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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import TelegramGroupSelect from "./TelegramGroupSelect";

const getSponsorshipTargetSuggestions = (participantCount) => {
  const suggestions = {
    4: [1000, 5000, 10000],
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

  const initialFormData = {
    name: "",
    slug: "",
    telegramGroupId: null,
    numberOfParticipants: null,
    type: null,
    buyIn: { entryFee: null },
    sponsorshipDetails: { targetAmount: 0 },
    // paymentInformation: {
    //   type: "phoneNumber",
    //   details: "",
    //   verified: false,
    // },
  };

  const [formData, setFormData] = useState(initialFormData);
  const targetSuggestions = getSponsorshipTargetSuggestions(
    formData.numberOfParticipants
  );

  const validationRules = {
    telegramGroupId: [
      { test: (value) => !!value, message: "Please select a Telegram group" },
    ],
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
          data.type !== "paid" || (value > 9 && value <= 1000),
        message: "Entry fee must be between 10 and 1,000 KES",
      },
    ],
    targetAmount: [
      {
        test: (value, data) =>
          data.type !== "sponsored" || (value >= 1000 && value <= 250000),
        message: "Sponsorship target must be between 1,000 and 250,000 KES",
      },
      {
        test: (value, data) => data.type !== "sponsored" || value % 1000 === 0,
        message: "Target amount must be in 1,000 KES increments",
      },
    ],
    // paymentType: [
    //   { test: (value) => !!value, message: "Please select a payment type" },
    // ],
    // paymentDetails: [
    //   // New rule for payment details
    //   {
    //     test: (value, data) => {
    //       const type = data.paymentInformation.type;
    //       if (!value) return false; // Required if a type is selected

    //       switch (type) {
    //         case "phoneNumber":
    //           return /^\d{10}$/.test(value); // Example: 10-digit phone number
    //         case "mpesaPaybill":
    //         case "lipaNaMpesa":
    //           return /^\d+$/.test(value); // Example: Only digits
    //         default:
    //           return false;
    //       }
    //     },
    //     message: "Invalid payment details",
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

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   let newFormData = { ...formData };

  //   if (name === "name") {
  //     const trimmedValue = value.slice(0, 30);
  //     const slug = slugify(trimmedValue, {
  //       lower: true,
  //       strict: true,
  //       trim: true,
  //     });
  //     newFormData = { ...newFormData, name: trimmedValue, slug };
  //   } else if (name === "entryFee") {
  //     newFormData.buyIn.entryFee = parseInt(value) || 0;
  //   } else if (name === "targetAmount") {
  //     newFormData.sponsorshipDetails.targetAmount = parseInt(value) || 0;
  //   } else {
  //     newFormData[name] =
  //       name === "numberOfParticipants" ? parseInt(value) || null : value;
  //   }

  //   setFormData(newFormData);
  //   setTouched((prev) => ({ ...prev, [name]: true }));
  //   const error = validateField(name, value);
  //   setErrors((prev) => ({ ...prev, [name]: error }));
  // };

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
      // newFormData.buyIn.entryFee = parseInt(value) || 0;
      newFormData.buyIn.entryFee = value === "" ? null : parseInt(value) || 0;
    } else if (name === "targetAmount") {
      newFormData.sponsorshipDetails.targetAmount = parseInt(value) || 0;
    } else if (name === "paymentType") {
      // Handle paymentType specifically
      newFormData.paymentInformation.type = value; // Direct assignment
    } else if (name === "details") {
      newFormData.paymentInformation.details = value;
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
      telegramGroupId: true,
      numberOfParticipants: true,
      type: true,
      entryFee: true,
      targetAmount: true,
      paymentType: true, // Add paymentType
      paymentDetails: true, // Add paymentDetails
    });

    const newErrors = {};
    Object.keys(validationRules).forEach((field) => {
      const value =
        field === "entryFee"
          ? formData.buyIn.entryFee
          : field === "targetAmount"
          ? formData.sponsorshipDetails.targetAmount
          : field === "paymentDetails" // Handle paymentDetails
          ? formData.paymentInformation.details
          : field === "paymentType" // Handle paymentType
          ? formData.paymentInformation.type
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
      }
    } catch (error) {
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
      <DialogContent className="w-[95%] sm:w-[90%] md:max-w-[80%] h-[90vh] sm:h-[85vh] bg-light dark:bg-dark">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            New Tournament
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-grow px-2 md:px-6 py-4 bg-tertiary/5">
          <div className="space-y-6 pr-2 sm:pr-6">
            {/* Tournament Name Field */}
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

            {/* Telegram Group Select */}
            <TelegramGroupSelect
              value={formData.telegramGroupId}
              onChange={(value) => {
                handleChange({
                  target: {
                    name: "telegramGroupId",
                    value: value,
                  },
                });
              }}
              showError={showError("telegramGroupId")}
            />

            {/* Tournament Size */}
            <div className="space-y-2">
              <Label htmlFor="numberOfParticipants">Tournament Size</Label>
              <Select
                id="numberOfParticipants"
                value={
                  formData.numberOfParticipants
                    ? formData.numberOfParticipants.toString()
                    : ""
                }
                onValueChange={(value) =>
                  handleChange({
                    target: {
                      name: "numberOfParticipants",
                      value: parseInt(value),
                    },
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Tournament Size" />
                </SelectTrigger>
                <SelectContent>
                  {[4, 8, 16, 32, 64, 128, 256, 512, 1024].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} Participants ({Math.log2(size)} Rounds)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showError("numberOfParticipants") && (
                <p className="text-sm text-red-500">
                  {errors.numberOfParticipants}
                </p>
              )}
            </div>

            {/* <div className="space-y-2">
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
            </div> */}

            {/* Tournament Type */}
            <div className="space-y-4">
              <Label>Tournament Type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={formData.type === "paid" ? "default" : "outline"}
                  onClick={() =>
                    handleChange({
                      target: { name: "type", value: "paid" },
                    })
                  }
                  className="h-auto p-4 flex flex-col items-start space-y-2"
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
                  type="button"
                  variant={
                    formData.type === "sponsored" ? "default" : "outline"
                  }
                  onClick={() =>
                    handleChange({
                      target: { name: "type", value: "sponsored" },
                    })
                  }
                  className="h-auto p-4 flex flex-col items-start space-y-2"
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

              {/* Entry Fee Section */}
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
                      value={
                        formData.buyIn.entryFee === null
                          ? ""
                          : formData.buyIn.entryFee
                      }
                      onChange={handleChange}
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

              {/* Sponsorship Section */}
              {formData.type === "sponsored" && (
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
                      Target is met through direct sponsorships, merchandise
                      sales or both. Tournament can proceed even if target isn't
                      met.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>

            {/* Payment Information Section */}
            {/* <div className="space-y-4">
              <Label>Payment Information</Label>
              <Select
                id="paymentType"
                name="paymentType"
                value={formData.paymentInformation.type}
                onValueChange={(value) => {
                  // Use onValueChange for Select component
                  handleChange({
                    target: {
                      name: "paymentType",
                      value: value,
                    },
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Payment Type" />{" "}
                
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phoneNumber">Phone Number</SelectItem>
                  <SelectItem value="mpesaPaybill">M-Pesa Paybill</SelectItem>
                  <SelectItem value="lipaNaMpesa">Lipa na M-Pesa</SelectItem>
                </SelectContent>
              </Select>

              {showError("paymentDetails") && (
                <p className="text-sm text-red-500">{errors.paymentDetails}</p>
              )}

              {formData.paymentInformation.type === "phoneNumber" && (
                <Input
                  type="tel"
                  name="details"
                  value={formData.paymentInformation.details}
                  onChange={handleChange}
                  placeholder="Enter Phone Number"
                  className="mt-2" // Add margin top for spacing
                />
              )}

              {formData.paymentInformation.type === "mpesaPaybill" && (
                <Input
                  type="text"
                  name="details"
                  value={formData.paymentInformation.details}
                  onChange={handleChange}
                  placeholder="Enter Paybill Number"
                  className="mt-2"
                />
              )}
              {formData.paymentInformation.type === "lipaNaMpesa" && (
                <Input
                  type="text"
                  name="details"
                  value={formData.paymentInformation.details}
                  onChange={handleChange}
                  placeholder="Enter Business/Till Number"
                  className="mt-2"
                />
              )}
              {formData.paymentInformation.type === "other" && (
                <Textarea // Use Textarea component
                  name="details"
                  value={formData.paymentInformation.details}
                  onChange={handleChange}
                  placeholder="Specify Payment Method and Details"
                  className="mt-2"
                />
              )}
            </div> */}

            {/* Submit Button */}
            <Button
              className="w-full"
              disabled={loading}
              onClick={() => {
                if (!userProfile) {
                  router.push("/login");
                  return;
                }
                handleSubmit();
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
              )}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTournamentModal;
