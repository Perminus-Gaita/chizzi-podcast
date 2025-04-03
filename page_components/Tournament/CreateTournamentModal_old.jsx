"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Label } from "@/components/ui/label";

import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Loader2,
  Gift,
  Coins,
  Info as InfoIcon,
  Trophy,
  Users,
  RefreshCw,
  LogIn,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createNotification } from "@/app/store/notificationSlice";

import { useTournamentsHandler } from "@/lib/tournament";

const getSponsorshipTargetSuggestions = (participantCount) => {
  const baseMultiplier = 1000;
  const suggestions = {
    4: [5000, 10000, 15000],
    8: [10000, 20000, 30000],
    16: [20000, 40000, 60000],
    32: [50000, 75000, 100000],
    64: [100000, 150000, 200000],
    128: [200000, 250000, 300000],
  };

  return suggestions[participantCount] || [5000, 10000, 20000];
};

const CreateTournamentModal = ({ isCreateForm, handleCloseCreateForm }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const userProfile = useSelector((state) => state.auth.profile);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { mutate: tournamentsMutate } = useTournamentsHandler();

  const initialFormData = {
    name: "",
    slug: "",
    numberOfParticipants: null,
    type: null,
    buyIn: { entryFee: 0 },
    sponsorshipDetails: { targetAmount: 0 },
  };

  const [formData, setFormData] = useState(initialFormData);

  const targetSuggestions = getSponsorshipTargetSuggestions(
    formData.numberOfParticipants
  );

  const handleTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, type }));
    setTouched((prev) => ({ ...prev, type: true }));
    setErrors((prev) => ({
      ...prev,
      type: validateField("type", type),
    }));
  };

  const validationRules = {
    name: [
      {
        test: (value) => !!value?.trim(),
        message: "Tournament name is required",
      },
      {
        test: (value) => value.length >= 3,
        message: "Name must be at least 3 characters",
      },
      {
        test: (value) => value.length <= 30,
        message: "Name must be 30 characters or less",
      },
    ],
    numberOfParticipants: [
      { test: (value) => !!value, message: "Please select tournament size" },
    ],
    type: [
      { test: (value) => !!value, message: "Please select tournament type" },
    ],
    entryFee: [
      {
        test: (value, data) =>
          data.type !== "paid" || (value > 0 && value <= 20000),
        message: "Entry fee must be between 1 and 20,000 KES",
      },
    ],
    targetAmount: [
      {
        test: (value, data) =>
          data.type !== "sponsored" || (value >= 5000 && value <= 250000),
        message: "Sponsorship target must be between 5,000 and 250,000 KES",
      },
      {
        test: (value, data) => data.type !== "sponsored" || value % 1000 === 0, // Must be in 1000 KES increments
        message: "Target amount must be in 1,000 KES increments",
      },
    ],
    // targetAmount: [
    //   {
    //     test: (value, data) => data.type !== "sponsored" || value > 0,
    //     message: "Please set a target amount for sponsorship",
    //   },
    // ],
  };

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return "";

    for (const rule of rules) {
      if (!rule.test(value, formData)) {
        return rule.message;
      }
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData };

    if (name === "name") {
      const trimmedValue = value.slice(0, 30);
      const slug = slugify(trimmedValue, {
        lower: true,
        strict: true,
        trim: true,
      });
      newFormData = { ...newFormData, name: trimmedValue, slug };
    } else if (name === "entryFee") {
      newFormData.buyIn.entryFee = parseInt(value) || 0;
    } else if (name === "targetAmount") {
      newFormData.sponsorshipDetails.targetAmount = parseInt(value) || 0;
    } else {
      newFormData[name] =
        name === "numberOfParticipants" ? parseInt(value) || null : value;
    }

    setFormData(newFormData);
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const generateRandomName = () => {
    const adjectives = ["Elite", "Premier", "Grand", "Master", "Champion"];
    const nouns = ["Series", "League", "Cup", "Tournament", "Championship"];
    const random = () => Math.floor(Math.random() * 5);
    const name = `${adjectives[random()]} ${nouns[random()]} ${Math.random()
      .toString(36)
      .slice(2, 4)}`;

    handleChange({ target: { name: "name", value: name } });
  };

  const showError = (fieldName) => touched[fieldName] && errors[fieldName];

  const handleSubmit = async () => {
    setTouched({
      name: true,
      numberOfParticipants: true,
      type: true,
      entryFee: true,
      targetAmount: true,
    });

    const newErrors = {};
    Object.keys(validationRules).forEach((field) => {
      const value =
        field === "entryFee"
          ? formData.buyIn.entryFee
          : field === "targetAmount"
          ? formData.sponsorshipDetails.targetAmount
          : formData[field];
      newErrors[field] = validateField(field, value);
    });

    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error)) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Please check all fields and try again",
        })
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/tournament/create", formData);

      if (response.status === 201) {
        dispatch(
          createNotification({
            open: true,
            type: "success",
            message: response.data.message,
          })
        );

        setFormData(initialFormData);

        router.push(
          `/${userProfile?.currentWorkspace.username}/${response.data.slug}`
        );
        handleCloseCreateForm();
        await tournamentsMutate();
      }
    } catch (error) {
      console.log("### THE RRROR ###");
      console.log(error);

      dispatch(
        createNotification({
          open: true,
          type: "error",
          message:
            error.response?.data?.message || "Failed to create tournament",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isCreateForm} onOpenChange={handleCloseCreateForm}>
      <DialogContent
        className="w-[95%] sm:w-[90%] md:max-w-[80%] h-[90vh] 
      sm:h-[85vh] bg-light dark:bg-dark"
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center justify-between">
            New Kadi Tournament
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-grow px-2 md:px-6 py-4 bg-tertiary/5">
          <div className="space-y-6 pr-2 sm:pr-6">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={30}
                  className={showError("name") ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={generateRandomName}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {showError("name") && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                URL: wufwuf.io/{userProfile?.username}/
                {formData.slug || "tournament-name"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tournament Size</Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[4, 8, 16, 32, 64, 128].map((size) => (
                  <Button
                    key={size}
                    type="button"
                    variant={
                      formData.numberOfParticipants === size
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      handleChange({
                        target: { name: "numberOfParticipants", value: size },
                      })
                    }
                    className="relative"
                  >
                    <Users className="w-4 h-4 mr-2 hidden sm:inline" />
                    {size}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({Math.log2(size)}R)
                    </span>
                  </Button>
                ))}
              </div>
              {showError("numberOfParticipants") && (
                <p className="text-sm text-red-500">
                  {errors.numberOfParticipants}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label>Tournament Type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  // type="button"
                  // variant={formData.type === "paid" ? "default" : "outline"}
                  // onClick={() =>
                  //   handleChange({ target: { name: "type", value: "paid" } })
                  // }
                  // className="h-auto p-4 flex flex-col items-start space-y-2"

                  type="button"
                  variant={formData.type === "paid" ? "default" : "outline"}
                  onClick={() => handleTypeChange("paid")}
                  className={`h-auto p-4 flex flex-col items-start space-y-2 
                    ${showError("type") ? "border-red-500" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="font-semibold text-sm sm:text-base">
                      Entry Fee Tournament
                    </span>
                  </div>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Players pay to participate</li>
                    <li>Prize pool from entry fees</li>
                    <li>Winner takes all (default)</li>
                  </ul>
                </Button>

                <Button
                  // type="button"
                  // variant={
                  //   formData.type === "sponsored" ? "default" : "outline"
                  // }
                  // onClick={() =>
                  //   handleChange({
                  //     target: { name: "type", value: "sponsored" },
                  //   })
                  // }
                  // className="h-auto p-4 flex flex-col items-start space-y-2"

                  type="button"
                  variant={
                    formData.type === "sponsored" ? "default" : "outline"
                  }
                  onClick={() => handleTypeChange("sponsored")}
                  className={`h-auto p-4 flex flex-col items-start space-y-2
                    ${showError("type") ? "border-red-500" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="font-semibold text-sm sm:text-base">
                      Sponsored Tournament
                    </span>
                  </div>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Free entry for players</li>
                    <li>Community-funded prize pool</li>
                    <li>Sponsor recognition & badges</li>
                  </ul>
                </Button>

                {showError("type") && (
                  <p className="text-sm text-red-500 col-span-full">
                    {errors.type}
                  </p>
                )}
              </div>

              {formData.type === "paid" && (
                <div className="space-y-3">
                  <Label>Entry Fee</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      KES
                    </span>
                    <Input
                      type="number"
                      name="entryFee"
                      value={formData.buyIn.entryFee}
                      onChange={handleChange}
                      min={0}
                      max={20000}
                      className={`pl-12 ${
                        showError("entryFee") ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {showError("entryFee") && (
                    <p className="text-sm text-red-500">{errors.entryFee}</p>
                  )}

                  <Alert>
                    <Trophy className="h-4 w-4" />
                    <AlertDescription>
                      Prize Pool: KES{" "}
                      {(
                        formData.buyIn.entryFee *
                        (formData.numberOfParticipants || 0)
                      ).toLocaleString()}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {formData.type === "sponsored" && (
                <>
                  {/* <div className="space-y-3">
                    <Label>Sponsorship Target</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        KES
                      </span>
                      <Input
                        type="number"
                        name="targetAmount"
                        value={formData.sponsorshipDetails.targetAmount}
                        onChange={handleChange}
                        min={0}
                        className={`pl-12 ${
                          showError("targetAmount") ? "border-red-500" : ""
                        }`}
                      />
                    </div>
                    {showError("targetAmount") && (
                      <p className="text-sm text-red-500">
                        {errors.targetAmount}
                      </p>
                    )}

                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Target can be met through sponsorships or merchandise
                        sales. Tournament can proceed even if target isn't met.
                      </AlertDescription>
                    </Alert>
                  </div> */}

                  <div className="space-y-3">
                    <Label>Sponsorship Target</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        KES
                      </span>
                      <Input
                        type="number"
                        name="targetAmount"
                        value={formData.sponsorshipDetails.targetAmount}
                        onChange={handleChange}
                        min={0}
                        className={`pl-12 ${
                          showError("targetAmount") ? "border-red-500" : ""
                        }`}
                      />
                    </div>

                    {/* Quick suggestion buttons */}
                    <div className="flex gap-2 mt-2">
                      {targetSuggestions.map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleChange({
                              target: {
                                name: "targetAmount",
                                value: suggestion,
                              },
                            })
                          }
                        >
                          {suggestion.toLocaleString()} KES
                        </Button>
                      ))}
                    </div>

                    {showError("targetAmount") && (
                      <p className="text-sm text-red-500">
                        {errors.targetAmount}
                      </p>
                    )}

                    <Alert variant="default" className="mt-2">
                      <InfoIcon className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Target can be met through sponsorships or merchandise
                        sales. Tournament can proceed even if target isn't met.
                      </AlertDescription>
                    </Alert>
                  </div>
                </>
              )}
            </div>

            <Button
              className="w-full"
              disabled={loading}
              onClick={() => {
                if (!userProfile) {
                  router.push("/login");
                  return;
                } else {
                  handleSubmit();
                }
              }}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {!userProfile ? (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login to Create Tournament
                </div>
              ) : loading ? (
                "Creating..."
              ) : (
                "Create Tournament"
              )}{" "}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTournamentModal;
