"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import axios from "axios";

import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import {
  Timer,
  Clock,
  Loader2,
  Users2,
  Bot,
  RefreshCw,
  AlertTriangle,
  LogIn,
  Gamepad2,
} from "lucide-react";

import { createNotification } from "@/app/store/notificationSlice";
import { useWalletHandler } from "@/lib/user";

const CreateRoomModal = ({ createRoomOpen, handleCloseCreateRoom }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const userProfile = useSelector((state) => state.auth.profile);

  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const initialFormData = {
    roomName: "",
    maxPlayers: 2,
    timer: null,
    joker: true,
    amount: 0,
    isComputer: false,
    isPrivate: false,
    password: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { data: walletData, mutate: walletMutate } = useWalletHandler();

  const validationRules = {
    roomName: [
      { test: (value) => !!value, message: "Please enter a table name" },
      {
        test: (value) => value.length >= 2,
        message: "Table name must be at least 2 characters",
      },
      {
        test: (value) => value.length <= 20,
        message: "Table name must be between 15 - 20 characters",
      },
      {
        test: (value) => /^[a-zA-Z0-9-_]+$/.test(value),
        message: "Only letters, numbers, hyphens and underscores allowed",
      },
    ],
    amount: [
      {
        test: (value) => value === 0 || value >= 10,
        message: "Minimum buy-in is 10 KES for competitive games",
      },
      {
        test: (value) => value <= 9 || value <= walletData?.balances.KES / 100,
        message: `Insufficient balance. Your current balance: ${
          walletData?.balances.KES / 100
        } KES`,
      },
    ],
    timer: [
      { test: (value) => value !== null, message: "Please select a game mode" },
    ],
  };

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return "";

    for (const rule of rules) {
      if (!rule.test(value)) {
        return rule.message;
      }
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "roomName") {
      processedValue = value.replace(/[^a-zA-Z0-9-_]/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, processedValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const showError = (fieldName) => touched[fieldName] && errors[fieldName];

  const generateRandomTableName = () => {
    // const adjectives = [
    //   "kona",
    //   "nduthi",
    //   "madrama",
    //   "ndovu",
    //   "kamote",
    //   "mbuzi",
    //   "nare",
    //   "sherehe",
    //   "mafisi", // clever/cunning players
    //   "mugithi", // unstoppable
    //   "ngori", // sharp/skilled
    //   "densi", // intense/serious
    //   "kubwa", // big/important
    //   "morio", // awesome
    //   "stepi", // strategic
    //   "jamu", // cool/awesome
    //   "rada", // alert/aware
    //   "sonko",
    //   "fuego",
    //   "kichaa",
    //   "kadi",
    // ];

    // const nouns = [
    //   "kariandusi",
    //   "mutuse",
    //   "kuu",
    //   "mbao", // game (slang for game/match)
    //   "mangware", // evening gaming session
    //   "kambi", // camp/gathering
    //   "masaa", // time/session
    //   "bashment", // party/gathering
    //   "genge", // crew/group
    //   "sherehe", // celebration
    //   "nduru", // shouts (of victory)
    //   "mandoo", // game/match
    //   "kibanda",
    //   "roya",
    //   "janta",
    //   "shoki",
    //   "tema",
    //   "tena",
    // ];

    // const adjectives = [
    //   "mogatha", // beautiful/harsh (strong emotion)
    //   "chungli", // strong/intense
    //   "freshi", // cool/awesome
    //   "warazi", // enemy/rival (competitive)
    //   "machili", // rich/loaded
    //   "fiti", // perfect/fit
    //   "mafisi", // clever/cunning
    //   "ngori", // sharp/skilled
    //   "densi", // intense
    //   "raha", // fun/enjoyment
    //   "sonko", // rich/boss
    //   "aluta", // feeling good
    //   "warena", // fire/hot
    //   "bwakala", // big/massive
    //   "imeweza", // dope/awesome
    //   "msanii", // skillful (ironically)
    //   "mbogi", // badass
    //   "chwaka", // fast/quick
    //   "mnoma", // excellent
    //   "jamo", // solo/alone
    //   "kipaji", // talented
    //   "murife", // notorious
    //   "mtaro", // street-smart
    //   "zimenice", // high/excited
    //   "mochoka", // coming through
    //   "floss", // showing off
    //   "genge", // crew/gang
    //   "boikelo", // charming
    //   "arif", // friendly
    //   "mtibo", // stylish
    // ];

    // const nouns = [
    //   "mandoo", // match/game
    //   "mbao", // game (slang)
    //   "rende", // crew
    //   "nduru", // victory shouts
    //   "mambaru", // detectives (intense)
    //   "zabe", // chill spot
    //   "shoki", // show/display
    //   "tema", // cut/play
    //   "muok", // coming/arrival
    //   "dangulo", // home base
    //   "rieng", // plan/move
    //   "janta", // squad
    //   "kibeng", // many/crowd
    //   "mtaro", // street
    //   "riba", // stories
    //   "medi", // meditation/chill
    //   "ngife", // bank (money)
    //   "dipra", // big vehicle
    //   "barodi", // money
    //   "tenje", // device
    //   "mbogi", // crew
    //   "shashola", // high energy
    //   "kambi", // camp
    //   "nare", // fire
    //   "bash", // party
    //   "mzinga", // bottle/round
    //   "roya", // royal
    //   "kubwa", // big
    //   "ndani", // inside
    //   "pori", // pocket/stash
    // ];

    const adjectives = [
      "bwaku",
      "mdeadly",
      "gangari",
      "mkali",
      "chopi",
      "drip",
      "rieng",
      "warena",
      "chachisha",
      "mless",
      "mbele",
      "janjes",
      "macho",
      "mngaari",
      "chonjo",
      "mtindo",
      "fafiri",
      "mzee",
      "wazi",
      "stingo",
      "mwrong",
      "msuper",
      "bweks",
      "manga",
      "mzito",
      "haki",
      "fiti",
      "songa",
      "ngori",
      "pupa",
      "mwaks",
      "mwaku",
      "nyastu",
      "mnahao",
      "sugu",
      "ridho",
      "teke",
      "randa",
      "dabo",
      "meja",
    ];

    const nouns = [
      "mpango",
      "mbogi",
      "kadi",
      "vita",
      "jama",
      "ngoma",
      "mrah",
      "rieng",
      "mbete",
      "mutaratara",
      "gwoko",
      "bunduz",
      "mzinga",
      "jiji",
      "mchoro",
      "nduka",
      "kombora",
      "msoto",
      "manyake",
      "pesa",
      "tano",
      "mwendeleo",
      "vuta",
      "mstahimili",
      "mshindani",
      "mwanzo",
      "mwisho",
      "genge",
      "rungu",
      "chapa",
      "baze",
      "mzee",
      "wivu",
      "nduadhi",
      "mshamba",
      "vungu",
      "shangwe",
      "mwendo",
      "mzunguko",
      "mwanga",
    ];

    // Ensure length ≤ 15 by using shorter words and ID
    const randomNum = Math.floor(Math.random() * 100);
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    const roomName = `${adj}-${noun}-${randomNum}`;

    setFormData((prev) => ({ ...prev, roomName }));
    setTouched((prev) => ({ ...prev, roomName: true }));
    setErrors((prev) => ({ ...prev, roomName: "" }));
  };

  const handleSubmit = async () => {
    setTouched({ roomName: true, amount: true, timer: true });

    const newErrors = {};
    Object.keys(validationRules).forEach((field) => {
      newErrors[field] = validateField(field, formData[field]);
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
      const endpoint = formData.isComputer
        ? "/api/cards/create-test-room"
        : "/api/cards/create-room";

      const roomLink = formData.isComputer ? "/kadi" : "/kadi/play";

      const response = await axios.post(endpoint, {
        roomName: formData.roomName,
        creator: userProfile?.uuid,
        maxPlayers: formData.maxPlayers,
        timer: formData.timer,
        amount: formData.amount,
        joker: formData.joker,
      });

      if (response.status === 201) {
        dispatch(
          createNotification({
            open: true,
            type: "success",
            message: response.data.message,
          })
        );

        router.push(`${roomLink}/${formData.roomName}`);
        handleCloseCreateRoom();
        if (formData.amount > 9) walletMutate();
      }
    } catch (error) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message:
            error.response?.data?.message ||
            "Failed to create room. Please try again.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={createRoomOpen} onOpenChange={handleCloseCreateRoom}>
      <DialogContent className="w-[95%] sm:w-11/12 md:max-w-[80%] lg:max-w-[60%] h-[90vh] sm:h-[85vh] bg-light dark:bg-dark">
        <div className="flex-none p-3 sm:p-4 border-b">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold flex items-center justify-between">
            <span>New Kadi Game</span>
            <Button
              variant="secondary"
              size="xs md:sm"
              onClick={() => setShowHelp(!showHelp)}
              className="bg-primary/10 hover:bg-primary/20 text-primary p-1"
            >
              <AlertTriangle className="w-4 h-4" />
              Help?
            </Button>
          </DialogTitle>

          {showHelp && (
            <Alert className="mt-2">
              <AlertDescription className="text-sm">
                • Create a free practice untimed game or timed game.
                <br />
                • Choose between multiplayer or quick computer match
                <br />• Select game mode and player count for multiplayer games
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-3">
            <Label className="text-sm">Game Type</Label>
            <div className="flex gap-2 mt-1">
              <Button
                variant={!formData.isComputer ? "default" : "outline"}
                className="flex-1 h-9 text-sm"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    isComputer: false,
                  }))
                }
              >
                <Users2 className="w-4 h-4 md:mr-2" />
                <span className="text-xs md:text-sm"> Multiplayer</span>
              </Button>
              <Button
                variant={formData.isComputer ? "default" : "outline"}
                className="flex-1 h-9 text-sm"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    isComputer: true,
                    maxPlayers: 2,
                    timer: false,
                    amount: 0,
                  }))
                }
              >
                {/* <Bot className="w-4 h-4 md:mr-2" /> */}
                <span className="text-xs md:text-sm">Quick Match</span>
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-grow px-2 md:px-6 py-4 bg-tertiary/5">
          <div className="space-y-4 sm:space-y-6 pr-2 sm:pr-6">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor="roomName" className="text-sm">
                  Table Name
                </Label>
                <div className="relative">
                  <Input
                    id="roomName"
                    name="roomName"
                    placeholder="e.g., lucky-table-123"
                    value={formData.roomName}
                    onChange={handleInputChange}
                    className={`mt-1 ${
                      showError("roomName") ? "border-red-500" : ""
                    }`}
                    maxLength={20}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={generateRandomTableName}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                {showError("roomName") && (
                  <p className="text-sm text-red-500 mt-1">{errors.roomName}</p>
                )}
              </div>
            </div>

            {/* {!formData.isComputer && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="privateRoom" className="text-sm">
                    Private Room
                  </Label>
                  <Switch
                    id="privateRoom"
                    checked={formData.isPrivate}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isPrivate: checked }))
                    }
                  />
                </div>

                {formData.isPrivate && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label htmlFor="password" className="text-sm">
                        Password
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`mt-1 ${
                          showError("password") ? "border-red-500" : ""
                        }`}
                      />
                      {showError("password") && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )} */}

            {!formData.isComputer && (
              <Card>
                <CardContent className="pt-6">
                  <Label htmlFor="amount" className="flex items-center gap-2">
                    Buy In Amount
                    {formData.amount > 9 && (
                      <Badge variant="outline" className="text-xs">
                        Balance: {walletData?.balances.KES / 100 || 0} KES
                      </Badge>
                    )}
                  </Label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 my-4">
                    {[0, 10, 20, 50, 100, 200, 500].map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant={
                          formData.amount === value ? "default" : "outline"
                        }
                        className={`${
                          value > 9 && value > walletData?.balances.KES / 100
                            ? "opacity-50"
                            : ""
                        }`}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, amount: value }));
                          setTouched((prev) => ({ ...prev, amount: true }));
                          setErrors((prev) => ({
                            ...prev,
                            amount: validateField("amount", value),
                          }));
                        }}
                        disabled={value > 9 && value > walletData?.balance}
                      >
                        {value === 0 ? "Free" : `${value} KES`}
                      </Button>
                    ))}
                  </div>

                  <div className="relative">
                    <Input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      min="0"
                      className={showError("amount") ? "border-red-500" : ""}
                      placeholder="Enter custom amount"
                    />
                    {showError("amount") && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.amount}
                      </p>
                    )}
                  </div>

                  {formData.amount > 0 && (
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Pot</span>
                        <span className="text-lg font-semibold text-primary">
                          KES {formData.amount * formData.maxPlayers}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Winner takes all - {formData.maxPlayers} players × KES{" "}
                        {formData.amount} buy-in
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label className="text-sm">Number of Players</Label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map((number) => (
                  <Button
                    key={number}
                    type="button"
                    variant={
                      formData.maxPlayers === number ? "default" : "outline"
                    }
                    className="relative"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        maxPlayers: number,
                      }));
                    }}
                  >
                    <Users2 className="w-4 h-4 mr-2 hidden sm:inline-block" />
                    <span className="text-sm sm:text-base">
                      {number} Players
                    </span>
                    {/* {number === 2 && (
                          <Badge
                            variant="secondary"
                            className="absolute -top-2 -right-2 text-[10px]"
                          >
                            Popular
                          </Badge>
                        )} */}
                  </Button>
                ))}
              </div>
            </div>

            {!formData.isComputer && (
              <div className="space-y-2">
                <Label className="text-sm">Game Mode</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={formData.timer === true ? "default" : "outline"}
                    className={`h-auto py-3 px-4 flex flex-col items-start space-y-1 
                        ${showError("timer") ? "border-red-500" : ""}`}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, timer: true }));
                      setTouched((prev) => ({ ...prev, timer: true }));
                      setErrors((prev) => ({ ...prev, timer: "" }));
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      <span className="text-sm sm:text-base">Speed Mode</span>
                      <Badge variant="secondary" className="text-[10px]">
                        Popular
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground text-left">
                      30-second turns, timed play
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant={formData.timer === false ? "default" : "outline"}
                    className={`h-auto py-3 px-4 flex flex-col items-start space-y-1
                        ${showError("timer") ? "border-red-500" : ""}`}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, timer: false }));
                      setTouched((prev) => ({ ...prev, timer: true }));
                      setErrors((prev) => ({ ...prev, timer: "" }));
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm sm:text-base">Relaxed Mode</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-left">
                      No time limit, casual pace
                    </span>
                  </Button>
                </div>
                {showError("timer") && (
                  <p className="text-sm text-red-500">{errors.timer}</p>
                )}
              </div>
            )}

            <div className="space-y-4">
              {/* <div className="flex items-center space-x-2">
                <Checkbox
                  id="joker"
                  checked={formData.joker}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      joker: checked,
                    }))
                  }
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="joker">Include Joker</Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.amount === 0
                      ? "Great for learning different card combinations"
                      : "Adds 2 extra Joker cards to the game"}
                  </p>
                </div>
              </div> */}

              {/* {!formData.isComputer && (
                <Alert>
                  <AlertDescription className="text-sm">
                    {formData.amount > 0
                      ? `💰 Competitive game - Winner takes ${
                          formData.maxPlayers * formData.amount
                        } KES`
                      : "🎮 Practice game - Perfect for learning or casual play"}
                  </AlertDescription>
                </Alert>
              )} */}
            </div>

            <div className="pt-4">
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
                {loading && <Gamepad2 className="w-5 h-4 animate-spin" />}
                {!userProfile ? (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Login to Create Game
                  </div>
                ) : loading ? (
                  "Creating..."
                ) : formData.isComputer ? (
                  "Start Quick Match"
                ) : (
                  `Create ${formData.timer ? "Timed" : "Untimed"} Game`
                )}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
export default CreateRoomModal;
