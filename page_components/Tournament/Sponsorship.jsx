import axios from "axios";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  Crown,
  Sparkles,
  Users,
  ArrowRight,
  Check,
  Gift,
  Shield,
  Timer,
  Heart,
  Stars,
  TrendingUp,
  Medal,
  Share2,
  Package,
  Info,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createNotification } from "@/app/store/notificationSlice";
import { cn } from "@/lib/utils";
import { getTierIcon } from "@/utils/tournaments";
import SupportModal from "./SupportModal";

const UnverifiedSponsorships = ({
  unverifiedSponsors,
  setSelectedSponsor,
  setIsDialogOpen,
}) => {
  if (unverifiedSponsors.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No unverified sponsorships.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      {unverifiedSponsors.map((sponsor) => (
        <div
          key={sponsor._id}
          className="flex items-center justify-between p-3 border-b"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={sponsor?.sponsor?.profilePicture} />
              <AvatarFallback>{sponsor?.sponsor?.username?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">@{sponsor?.sponsor?.username}</p>
              <p className="text-sm text-muted-foreground">
                KES {(sponsor.amount / 100).toLocaleString()}{" "}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setSelectedSponsor(sponsor);
              setIsDialogOpen(true);
            }}
          >
            Verify
          </Button>
        </div>
      ))}
    </ScrollArea>
  );
};

const Sponsorship = ({
  sponsors,
  products,
  sponsorshipDetails,
  tournamentId,
  tournamentCreator,
  tournamentName,
  tournamentSlug,
  tournamentStatus,
  // paymentInformation,
  //   handleTabChange,
}) => {
  const dispatch = useDispatch();
  const [selectedTier, setSelectedTier] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [showSupportDialog, setShowSupportDialog] = useState(false);

  const [currentTierIndex, setCurrentTierIndex] = useState(0);
  const currentTier = sponsorshipDetails?.tiers[currentTierIndex];

  const [showUnverified, setShowUnverified] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const nextTier = () => {
    if (currentTierIndex < sponsorshipDetails?.tiers.length - 1) {
      setCurrentTierIndex((prev) => prev + 1);
    }
  };

  const prevTier = () => {
    if (currentTierIndex > 0) {
      setCurrentTierIndex((prev) => prev - 1);
    }
  };

  // const tiers = [
  //   {
  //     id: "bronze",
  //     name: "Community",
  //     amount: 500,
  //     icon: <Medal className="h-6 w-6 text-amber-600" />,
  //     color: "text-amber-600",
  //     perks: ["Supporter Badge", "Tournament Chat Access"],
  //   },
  //   {
  //     id: "silver",
  //     name: "Champion",
  //     amount: 2500,
  //     icon: <Trophy className="h-6 w-6 text-slate-400" />,
  //     color: "text-slate-400",
  //     perks: ["Silver Badge", "Featured Supporter", "Custom Chat Color"],
  //   },
  //   {
  //     id: "gold",
  //     name: "Legend",
  //     amount: 7500,
  //     icon: <Crown className="h-6 w-6 text-yellow-500" />,
  //     color: "text-yellow-500",
  //     perks: [
  //       "Gold Badge",
  //       "Tournament Branding",
  //       "VIP Access",
  //       "Direct Contact",
  //     ],
  //   },
  // ];

  // Group sponsors by tier

  const calculateTierProgress = (tier) => {
    const directAmount = sponsors
      .filter((s) => s.tierId === tier.id)
      .reduce((sum, s) => sum + s.amount, 0);

    const productAmount = products
      .filter((p) => p.tierId === tier.id)
      .reduce((sum, p) => sum + p.price * p.sold, 0);

    return {
      directAmount,
      productAmount,
      totalAmount: directAmount + productAmount,
      percentage: ((directAmount + productAmount) / tier.amount) * 100,
    };
  };

  const progress = calculateTierProgress(currentTier);

  const handleSponsor = async (tier, type) => {
    // console.log("sponsoring...");
    // console.log({
    //   tournamentId: tournamentId,
    //   amount: tier.amount,
    //   type: type,
    //   currency: "KES",
    //   message: "", // Optional message
    //   callbackUrl: `${window.location.origin}/${tournamentCreator?.username}/${tournamentSlug}`,
    // });

    // console.log("### THE TIER ###");
    // console.log(tier);
    // if (!tier.amount || Number(tier.amount) < 50) return;

    setIsProcessing(true);
    try {
      const response = await axios.post("/api/payments/sponsor/paystack", {
        tournamentId: tournamentId,
        amount: Number(tier.amount),
        currency: "KES",
        type: type,
        message: "", // Optional message
        callbackUrl: `${window.location.origin}/${tournamentCreator?.username}/${tournamentSlug}`,
      });

      // Redirect to payment page
      if (response.data?.authorizationUrl) {
        window.location.href = response.data.authorizationUrl;
      }
    } catch (error) {
      console.error("Sponsorship error:", error);
      // Show error notification
      dispatch(
        createNotification({
          type: "error",
          message:
            error.response?.data?.message || "Failed to process sponsorship",
        })
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProductSupport = async (product, type) => {
    // console.log("Selected product:", product);

    setIsProcessing(true);
    try {
      // console.log("### THE response111");

      const response = await axios.post("/api/payments/products/paystack", {
        tournamentId,
        productId: product._id,
        currency: product.currentOwner.price.currency,
        type: type,
        callbackUrl: `${window.location.origin}/${tournamentCreator?.username}/${tournamentSlug}`,
      });

      // console.log("### THE response");
      // // console.log(response);
      // console.log("Processing?>?");
      // console.log(isProcessing);

      if (response.data?.authorizationUrl) {
        window.location.href = response.data.authorizationUrl;
      }
    } catch (error) {
      console.error("Sponsorship error:", error);

      dispatch(
        createNotification({
          type: "error",
          message:
            error.response?.data?.message ||
            "Failed to process product purchase",
        })
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // const handleDirectSupport = async (tier) => {
  //   setIsProcessing(true);
  //   try {
  //     const response = await axios.post("/api/payments/sponsor/paystack", {
  //       tournamentId,
  //       amount: tier.amount,
  //       currency: "KES",
  //       message: "",
  //       callbackUrl: `${window.location.origin}/${tournamentCreator?.username}/${tournamentSlug}`,
  //     });

  //     if (response.data?.authorizationUrl) {
  //       window.location.href = response.data.authorizationUrl;
  //     }
  //   } catch (error) {
  //     dispatch(
  //       createNotification({
  //         type: "error",
  //         message:
  //           error.response?.data?.message || "Failed to process sponsorship",
  //       })
  //     );
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  // Group sponsors by tier
  const getSponsorTier = (amount) => {
    if (amount >= 7500) return "gold";
    if (amount >= 2500) return "silver";
    return "bronze";
  };

  const groupedSponsors = sponsors?.reduce((acc, sponsor) => {
    const tier = getSponsorTier(sponsor.amount);
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(sponsor);
    return acc;
  }, {});

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `/api/tournament/sponsorship/${selectedSponsor._id}/verify`
      ); // Replace with your API route
      // Refresh sponsors or update the local state
      setIsDialogOpen(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error verifying sponsorship:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <SupportModal
        isOpen={showSupportDialog}
        onClose={() => {
          setShowSupportDialog(false);
          setSelectedTier(null);
        }}
        selectedTier={selectedTier}
        products={products}
        onDirectSupport={handleSponsor}
        onProductSupport={handleProductSupport}
        isProcessing={isProcessing}
        // paymentInformation={paymentInformation}
        // tournamentId={tournamentId}
      />
      {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-light dark:bg-dark">
          <DialogHeader>
            <DialogTitle>Verify Sponsorship</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p>
              Are you sure you want to verify the sponsorship from @
              {selectedSponsor?.sponsor?.username} for KES{" "}
              {(selectedSponsor?.amount / 100).toLocaleString()}?
            </p>
            {selectedSponsor?.mpesaTransactionCode && (
              <p className="text-sm text-muted-foreground">
                M-Pesa Transaction Code:{" "}
                <span className="font-bold text-md underline">
                  {selectedSponsor.mpesaTransactionCode}
                </span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleVerify} disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      <div
        className={`space-y-4 sm:space-y-6 flex flex-col
   ${
     sponsorshipDetails?.currentAmount >= sponsorshipDetails?.targetAmount
       ? "flex-col-reverse gap-4"
       : "flex-col"
   }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
                <CardTitle className="text-lg sm:text-2xl flex items-center gap-2">
                  Support Tournament
                  <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-bounce" />
                </CardTitle>

                <Badge variant="secondary" className="w-fit text-xs sm:text-sm">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  {sponsors?.length || 0} Supporters
                </Badge>
              </div>
              <CardDescription className="text-sm sm:text-base mt-2">
                Show your support and unlock exclusive perks!
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tiers">Support Tiers</TabsTrigger>
                  {/* <TabsTrigger value="products">Products</TabsTrigger> */}
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      {/* <CardHeader className="flex justify-between">
                        <CardTitle className="text-base md:text-lg">
                          {showUnverified
                            ? "Unverified Sponsors"
                            : "Recent Sponsors"}
                        </CardTitle>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowUnverified(!showUnverified)}
                        >
                          {showUnverified
                            ? "Show Recent"
                            : "Verify Sponsorships"}
                        </Button>
                      </CardHeader> */}
                      <CardContent>
                        {/* {showUnverified ? (
                          <UnverifiedSponsorships
                            unverifiedSponsors={sponsors.filter(
                              (sponsor) => sponsor.status !== "success"
                            )}
                            setIsDialogOpen={setIsDialogOpen}
                            setSelectedSponsor={setSelectedSponsor}
                          />
                        ) :  */}
                        {sponsors.length > 0 ? (
                          <ScrollArea className="h-[300px]">
                            {sponsors.slice(0, 5).map((sponsor) => (
                              <div
                                key={sponsor._id}
                                className="flex items-center justify-between p-3 border-b"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage
                                      src={sponsor?.sponsor?.profilePicture}
                                    />
                                    <AvatarFallback>
                                      {sponsor?.sponsor?.username?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      @{sponsor?.sponsor?.username}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      KES
                                      {(
                                        sponsor.amount / 100
                                      ).toLocaleString()}{" "}
                                    </p>
                                  </div>
                                </div>
                                <Badge>{sponsor.type}</Badge>
                              </div>
                            ))}
                          </ScrollArea>
                        ) : (
                          <div
                            className="h-full flex flex-col items-center justify-center
                           text-center p-1 md:p-6 text-muted-foreground"
                          >
                            <Users className="h-12 w-12 mb-4 opacity-20" />
                            <p className="font-medium mb-1">No sponsors yet</p>
                            <p className="text-sm">
                              Be the first to support this tournament and unlock
                              exclusive perks!
                            </p>
                            <Button
                              onClick={() => setActiveTab("tiers")}
                              className="w-full sm:w-auto"
                            >
                              <Sparkles className="h-4 w-4" />
                              Be The First Sponsor
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Popular Products
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[300px]">
                          {products
                            .sort((a, b) => b.sold - a.sold)
                            .slice(0, 5)
                            .map((product) => (
                              <div
                                key={product._id}
                                className="flex items-center justify-between p-3 border-b"
                              >
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {/* {product.sold} sold •{" "} */}
                                    {(
                                      product.currentOwner.price.amount / 100
                                    ).toLocaleString()}{" "}
                                    KES
                                  </p>
                                </div>
                                {/* <Badge variant="outline">{product.type}</Badge> */}
                              </div>
                            ))}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="tiers" className="space-y-4">
                  <div className="relative">
                    <div className="absolute top-1/2 -translate-y-1/2 -left-4 z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={prevTier}
                        disabled={currentTierIndex === 0}
                        className="rounded-full shadow-lg bg-background/80 backdrop-blur"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                    </div>

                    <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={nextTier}
                        disabled={
                          currentTierIndex ===
                          sponsorshipDetails?.tiers.length - 1
                        }
                        className="rounded-full shadow-lg bg-background/80 backdrop-blur"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentTier.id}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="px-1 md:px-4"
                      >
                        <Card
                          key={currentTier.id}
                          className="relative overflow-hidden"
                        >
                          <div
                            className={`absolute top-0 left-0 w-full h-1 ${currentTier.bgColor}/20`}
                          />
                          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex items-start sm:items-center gap-3">
                                <div
                                  className={`p-1 md:p-3 rounded-lg ${currentTier.bgColor}/10 shrink-0`}
                                >
                                  {React.createElement(
                                    getTierIcon(currentTier.id).icon,
                                    {
                                      className: `h-6 w-6 ${currentTier.color}`,
                                    }
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="text-base md:text-lg font-semibold truncate">
                                    {currentTier.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {(
                                      currentTier.amount / 100
                                    ).toLocaleString()}{" "}
                                    KES
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className="mt-1 text-xs"
                                  >
                                    {currentTier.maxSponsors -
                                      (currentTier.currentSponsors || 0)}{" "}
                                    spots left
                                  </Badge>
                                </div>
                              </div>

                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedTier(currentTier);
                                  setShowSupportDialog(true);
                                }}
                                className="w-full sm:w-auto"
                              >
                                <Sparkles className="h-4 w-4" />
                                Support
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 shrink-0" />
                                  Direct Benefits
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {currentTier.directSponsorshipPerks.map(
                                    (perk, i) => (
                                      <Badge
                                        key={i}
                                        variant="secondary"
                                        className="text-xs py-1 px-2 leading-relaxed"
                                      >
                                        {perk}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <Package className="h-4 w-4 shrink-0" />
                                  Products
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {products
                                    .filter(
                                      (p) =>
                                        p.currentOwner.tierId === currentTier.id
                                    )
                                    .map((product) => (
                                      <Badge
                                        key={product._id}
                                        variant="outline"
                                        className="text-xs py-1 px-2 leading-relaxed"
                                      >
                                        {product.name}
                                      </Badge>
                                    ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </AnimatePresence>
                    <div className="flex justify-center mt-4 gap-1">
                      {sponsorshipDetails?.tiers.map((tier, index) => (
                        <Button
                          key={tier.id}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-2 h-2 p-0 rounded-full",
                            index === currentTierIndex
                              ? "bg-primary"
                              : "bg-muted"
                          )}
                          onClick={() => setCurrentTierIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* <TabsContent
                  value="products"
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {products.map((product) => (
                    <Card key={product._id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full sm:w-20 h-auto sm:h-20 object-cover rounded-lg mb-4 sm:mb-0"
                            />
                          )}
                          <div className="flex-1 w-full">
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                              <div className="w-full sm:w-auto">
                                <h3 className="font-medium text-center sm:text-left">
                                  {product.name}
                                </h3>
                                <p className="text-sm text-muted-foreground text-center sm:text-left">
                                  {(
                                    product.price.amount / 100
                                  ).toLocaleString()}{" "}
                                  KES
                                </p>
                              </div>
                              <Badge variant="outline" className="mt-2 sm:mt-0">
                                {product.sold}/{product.inventory} Sold
                              </Badge>
                            </div>
                            <p className="text-sm text-center sm:text-left">
                              {product.description}
                            </p>
                            <div className="mt-4">
                              <Button className="w-full">
                                Purchase & Support
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent> */}
              </Tabs>
            </CardContent>

            {/* <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm font-medium">
                    Tournament Pool
                  </span>
                  <span className="text-xs sm:text-sm font-bold">
                    KES{" "}
                    {(
                      sponsorshipDetails?.currentAmount / 100
                    )?.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={
                    (sponsorshipDetails?.currentAmount /
                      sponsorshipDetails?.targetAmount) *
                    100
                  }
                />
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>
                    {Math.round(
                      (sponsorshipDetails?.currentAmount /
                        sponsorshipDetails?.targetAmount) *
                        100
                    )}
                    % Complete
                  </span>
                  <span>
                    Target: KES{" "}
                    {(sponsorshipDetails?.targetAmount / 100)?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {tiers.map((tier) => (
                  <motion.div
                    key={tier.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={cn(
                        "cursor-pointer",
                        selectedTier === tier.id && "border-primary"
                      )}
                      onClick={() => setSelectedTier(tier.id)}
                    >
                      <CardContent className="p-3 sm:p-4 text-center space-y-2 sm:space-y-3">
                        <motion.div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-primary/10">
                          <div
                            className={`p-2 rounded-full ${
                              getTierIcon(tier.id).bgColor
                            }/10`}
                          >
                            {React.createElement(getTierIcon(tier.id).icon, {
                              className: `h-5 w-5 ${
                                getTierIcon(tier.id).color
                              }`,
                            })}
                          </div>
                        </motion.div>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold">
                            {tier.name}
                          </h3>
                          <p
                            className={`${tier.color} text-xs sm:text-sm font-semibold`}
                          >
                            KES {(tier.amount / 100).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {tier.perks.map((perk, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-[10px] sm:text-xs"
                            >
                              {perk}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent> 

            <CardFooter className="p-4 sm:p-6 flex flex-col space-y-2 sm:space-y-3">
              <Button
                className="w-full h-10 sm:h-12 text-sm sm:text-base"
                disabled={!selectedTier || isProcessing}
                onClick={() =>
                  handleSponsor(tiers.find((t) => t.id === selectedTier))
                }
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <span className="flex items-center gap-2">
                    Send Support <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                )}
              </Button>
              <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                Secure payment via M-Pesa • Instant Recognition
              </p>
            </CardFooter>*/}
          </Card>
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                Sponsors
              </CardTitle>
              {(["in-progress", "completed"].includes(tournamentStatus) ||
                sponsorshipDetails?.currentAmount >=
                  sponsorshipDetails?.targetAmount) && (
                <CardDescription className="text-sm sm:text-base">
                  These amazing supporters made this tournament possible
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="leaderboard">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger
                    value="leaderboard"
                    className="text-xs sm:text-sm py-1.5 sm:py-2"
                  >
                    Top Supporters
                  </TabsTrigger>
                  <TabsTrigger
                    value="recent"
                    className="text-xs sm:text-sm py-1.5 sm:py-2"
                  >
                    Recent Support
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="leaderboard">
                  <ScrollArea className="h-[300px] sm:h-[400px] pr-2 sm:pr-4">
                    {Object.entries(groupedSponsors || {}).map(
                      ([tier, tierSponsors]) => (
                        <div key={tier} className="mb-4 sm:mb-6">
                          <div className="flex items-center gap-2 mb-2">
                            {tier === "gold" && (
                              <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                            )}
                            {tier === "silver" && (
                              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                            )}
                            {tier === "bronze" && (
                              <Medal className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                            )}
                            <h3 className="font-semibold capitalize text-sm sm:text-base">
                              {tier} Supporters
                            </h3>
                          </div>

                          <div className="space-y-2">
                            {tierSponsors.map((sponsor) => (
                              <div
                                key={sponsor._id}
                                className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50"
                              >
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                    <AvatarImage src={sponsor.profilePicture} />
                                    <AvatarFallback>
                                      {sponsor?.sponsor?.username[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">
                                      @{sponsor?.sponsor?.username}
                                    </p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                      KES{" "}
                                      {(sponsor.amount / 100).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                                >
                                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="recent">
                  <ScrollArea className="h-[300px] sm:h-[400px]">
                    {sponsors
                      ?.slice()
                      .sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                      )
                      .map((sponsor) => (
                        <div
                          key={sponsor._id}
                          className="flex items-center justify-between p-2 sm:p-3 border-b"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                              <AvatarImage src={sponsor.profilePicture} />
                              <AvatarFallback>
                                {sponsor?.sponsor?.username[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">
                                @{sponsor.username}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Just supported • KES{" "}
                                {sponsor.amount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {getSponsorTier(sponsor.amount)}
                          </Badge>
                        </div>
                      ))}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div> */}
        {/* <button onClick={() => console.log(sponsors)}>HERE</button> */}
      </div>
    </>
  );
};

export default Sponsorship;
