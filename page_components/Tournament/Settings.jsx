"use client";
import axios from "axios";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Image as ImageIcon,
  Gift,
  Info,
  AlertTriangle,
  Ban,
  Archive,
  Loader2,
  Trophy,
  Medal,
  InfoIcon,
  Crown,
  Coins,
  AlertCircle,
  Sparkles,
  Edit2,
  Plus,
  Trash2,
  DollarSign,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  Timer,
  Calendar,
  Mail,
  Clock,
  Star,
  Gamepad2,
  Scroll,
  Calculator,
  Package,
  Shield,
  LinkIcon,
  MessageCircle,
  Send,
  ExternalLink,
} from "lucide-react";

import UploadSection from "@/components/UploadSection";
import { createNotification } from "@/app/store/notificationSlice";
import { getTierIcon } from "@/utils/tournaments";
import { useProductsHandler } from "@/lib/tournament";

import ProductImageUpload from "./ProductImageUpload";
import ProductsGrid from "./ProductsGrid";

import useS3Upload from "@/lib/media/use-s3-upload";

import "@/styles/tournament.css";

const calculateTierProgress = (tier, sponsorships, products) => {
  const directAmount = sponsorships
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
    remainingAmount: Math.max(0, tier.amount - (directAmount + productAmount)),
  };
};

const TierProgress = ({ tier, sponsorships, products }) => {
  const progress = calculateTierProgress(tier, sponsorships, products);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span>{Math.round(progress.percentage)}%</span>
      </div>
      <Progress value={progress.percentage} className="h-2" />
      <div className="flex flex-wrap gap-2">
        {progress.directAmount > 0 && (
          <Badge variant="secondary" className="text-xs">
            Direct: {(progress.directAmount / 100).toLocaleString()} KES
          </Badge>
        )}
        {progress.productAmount > 0 && (
          <Badge variant="secondary" className="text-xs">
            Products: {(progress.productAmount / 100).toLocaleString()} KES
          </Badge>
        )}
      </div>
    </div>
  );
};

const SponsorshipTierCard = ({
  tier,
  products = [],
  sponsorships = [],
  // onEditTier,
  // onAssignProduct,
}) => {
  const assignedProducts = products.filter((p) => p.tierId === tier.id);

  return (
    <Card className="relative border border-muted">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${tier.bgColor}/10`}>
              {React.createElement(
                {
                  community: Users,
                  partner: Shield,
                  champion: Trophy,
                  legend: Crown,
                }[tier.id],
                { className: `h-5 w-5 ${tier.color}` }
              )}
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                {tier.name}
                <Badge variant="outline" className="text-xs">
                  {tier.maxSponsors - (tier.currentSponsors || 0)} spots left
                </Badge>
              </h3>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>{(tier.amount / 100).toLocaleString()} KES</span>
                <span>•</span>
                <span>{tier.percentage}% of target</span>
              </div>
            </div>
          </div>
          {/* <Button variant="ghost" size="icon" onClick={() => onEditTier(tier)}>
            <Edit2 className="h-4 w-4" />
          </Button> */}
        </div>

        <TierProgress
          tier={tier}
          sponsorships={sponsorships}
          products={products}
        />
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Direct Sponsorship Benefits
            </h4>
            <div className="flex flex-wrap gap-1">
              {tier.directSponsorshipPerks.map((perk, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {perk}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Products ({assignedProducts.length}/
                {tier.productStrategy.maxProducts})
              </h4>
              {/* <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => onAssignProduct(tier)}
                disabled={
                  assignedProducts.length >= tier.productStrategy.maxProducts
                }
              >
                Assign Product
              </Button> */}
            </div>

            {assignedProducts.length > 0 ? (
              <div className="grid gap-2">
                {assignedProducts.map((product) => (
                  <Card key={product._id} className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{product.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {product.sold} sold •{" "}
                            {(product.price / 100).toLocaleString()} KES
                          </p>
                        </div>
                        {/* <Badge variant="outline">{product.type}</Badge> */}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="py-6">
                  <div className="text-center text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No products assigned to this tier</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Settings = ({ tournament, products }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { upload } = useS3Upload();

  const isPro = true;

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    mutate: productsMutate,
  } = useProductsHandler(tournament?._id);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const userProfile = useSelector((state) => state.auth.profile);

  const isWinnerTakeAll = tournament?.prizeDistribution?.first === 100;

  const isPaidTournament = tournament?.type === "paid";
  const isEditable =
    tournament.status === "draft" || tournament.status === "setup";

  const [distribution, setDistribution] = useState(
    isWinnerTakeAll ? "winnerTakeAll" : "threeWaySplit"
  );

  const distributions = {
    winnerTakeAll: {
      first: 100,
      second: 0,
      third: 0,
    },
    threeWaySplit: {
      first: 50,
      second: 30,
      third: 20,
    },
  };

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    inventory: "",
    image: "",
    tierId: null,
  });

  const [backgroundType, setBackgroundType] = useState("table");

  const [errorMessage, setErrorMessage] = useState("");

  const [isTableHovered, setIsTableHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);

  const [formData, setFormData] = useState({
    name: tournament.name || "",
    description: tournament.description || null,
    format: tournament.format || "single elimination",
    numberOfParticipants: tournament.numberOfParticipants || 4,
    startDate: tournament.startDate ? new Date(tournament.startDate) : null,
    maxDuration: tournament.maxDuration || null,
    customBannerImage: tournament.customBannerImage || "",
    customTableBackgroundImage: tournament.customTableBackgroundImage || "",
    customCardSkinImage: tournament.customCardSkinImage || "",
    type: tournament.type || null,
    autoStart: tournament.autoStart || false,
    requireTelegram: tournament?.requireTelegram,
    prizeDistribution: tournament.prizeDistribution,
    sponsorshipDetails: tournament.sponsorshipDetails,
    buyIn: {
      entryFee: tournament.buyIn?.entryFee || 0,
      prizePool: tournament.buyIn?.prizePool || 0,
      distribution: {
        winner: tournament.buyIn?.distribution?.winner || 70,
        creator: tournament.buyIn?.distribution?.creator || 25,
        platform: tournament.buyIn?.distribution?.platform || 5,
      },
    },
    paymentType: tournament.paymentInformation?.type,
    paymentDetails: tournament.paymentInformation?.details,
    // paymentInformation: {
    //   type: tournament.paymentInformation?.type || "phoneNumber", // Default if not available
    //   phoneNumber:
    //     tournament.paymentInformation?.type === "phoneNumber"
    //       ? tournament.paymentInformation.details
    //       : "",
    //   mpesaPaybill:
    //     tournament.paymentInformation?.type === "mpesaPaybill"
    //       ? tournament.paymentInformation.details
    //       : "",
    //   lipaNaMpesa:
    //     tournament.paymentInformation?.type === "lipaNaMpesa"
    //       ? tournament.paymentInformation.details
    //       : "",
    // },
  });

  const TABLE_MIN_WIDTH = 1280;
  const TABLE_MIN_HEIGHT = 720;
  const TABLE_REC_WIDTH = 1920;
  const TABLE_REC_HEIGHT = 1080;
  const CARD_WIDTH = 60;
  const CARD_HEIGHT = 90;

  const matchingTier = tournament?.sponsorshipDetails?.tiers.find(
    (t) => t.id === newProduct.tierId
  );

  // sponsorship products
  const platformFee = 0.05; // 5%
  const winnerShare = 0.25; // 25%
  const basePrice = Number(newProduct.price) || 0;
  const quantity = Number(newProduct.inventory) || 0;

  // const calculateProfits = () => {
  //   const totalRevenue = basePrice * quantity;
  //   const platformCut = totalRevenue * platformFee;
  //   const winnerCut = totalRevenue * winnerShare;
  //   const creatorProfit = totalRevenue - platformCut - winnerCut;
  //   const profitPerItem =
  //     basePrice - basePrice * platformFee - basePrice * winnerShare;

  //   return {
  //     perItem: profitPerItem,
  //     total: creatorProfit,
  //     percentage: (creatorProfit / totalRevenue) * 100,
  //   };
  // };

  const calculateProfits = () => {
    const price = Number(newProduct.price) || 0;
    const inventory = Number(newProduct.inventory) || 0;

    // Profit splits based on your model
    const creatorShare = 0.7;
    const winnerShare = 0.25;
    const platformShare = 0.05;

    return {
      perItem: price * creatorShare,
      total: price * inventory * creatorShare,
      splits: {
        creator: creatorShare * 100,
        winner: winnerShare * 100,
        platform: platformShare * 100,
      },
    };
  };

  const profits = calculateProfits();
  // end

  const getTitle = () => {
    switch (backgroundType) {
      case "table":
        return "Upload Table Background";
      case "card":
        return "Upload Card Skin";
      case "banner":
        return "Upload Tournament Banner";
      default:
        return "Upload Image";
    }
  };

  const handleDistributionChange = (value) => {
    setDistribution(value); // Update local state
    setFormData((prev) => ({
      ...prev,
      prizeDistribution: {
        ...distributions[value],
      },
    }));
  };

  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);

  const [showTargetDialog, setShowTargetDialog] = useState(false);

  const [sponsorshipTarget, setSponsorshipTarget] = useState(
    tournament?.sponsorshipTarget || 5000
  );

  const [isEnabled, setIsEnabled] = useState(tournament.type === "sponsored");

  const [isHovered, setIsHovered] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);

  // Example card back styles - these would come from your design system
  const defaultCardBack = "/cards/backred.png";

  const isPrizeDistributionChanged = () => {
    return (
      formData.prizeDistribution?.first !==
        tournament.prizeDistribution?.first ||
      formData.prizeDistribution?.second !==
        tournament.prizeDistribution?.second ||
      formData.prizeDistribution?.third !== tournament.prizeDistribution?.third
    );
  };

  const isFormDataChanged = () => {
    return (
      formData.name !== tournament.name ||
      formData.description !== tournament.description ||
      formData.autoStart !== tournament.autoStart ||
      formData.requireTelegram !== tournament?.requireTelegram ||
      isPrizeDistributionChanged() ||
      formData.customTableBackgroundImage !==
        tournament.customTableBackgroundImage ||
      formData.customCardSkinImage !== tournament.customCardSkinImage
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // IMAGE HANDLING

  const handleTabChange = (value) => {
    // console.log("## SETTING TYPE ###");
    // console.log(value);

    setBackgroundType(value);
    setFile(null);
    setPreview(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const { data } = await axios.post("/api/tournament/signed-url", {
        filename: file.name,
        fileType: file.type,
        tournamentId: tournament._id,
        assetType: backgroundType,
      });

      // Upload to S3
      await axios.put(data.uploadUrl, file, {
        headers: { "Content-Type": file.type },

        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      // Generate final URL
      const assetUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${data.Key}`;

      const getUpdateData = (type) => {
        switch (type) {
          case "table":
            return { customTableBackgroundImage: assetUrl };
          case "card":
            return { customCardSkinImage: assetUrl };
          case "banner":
            return { customBannerImage: assetUrl };
          default:
            return {};
        }
      };

      const updateData = getUpdateData(backgroundType);

      // Update tournament with new asset URL
      const editResponse = await axios.put(
        `/api/tournament/edit/?tournamentId=${tournament._id}`,
        updateData
      );

      if (editResponse.status === 200) {
        const getSuccessMessage = (type) => {
          switch (type) {
            case "table":
              return "Table background";
            case "card":
              return "Card skin";
            case "banner":
              return "Tournament banner";
            default:
              return "Image";
          }
        };

        dispatch(
          createNotification({
            open: true,
            type: "success",
            message: `${getSuccessMessage(backgroundType)} saved successfully!`,
          })
        );

        router.refresh();
      }

      setProgress(100);
    } catch (err) {
      console.error("Upload error:", err);

      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      setFile(null);
      setPreview(null);
      setShowUploadModal(false);
    }
  };

  const CONSTRAINTS = {
    table: {
      maxSize: 5 * 1024 * 1024, // 5MB
      formats: ["image/jpeg", "image/png", "image/webp"],
      minWidth: 1280,
      minHeight: 720,
      maxWidth: 3840,
      maxHeight: 2160,
      aspectRatio: 16 / 9,
      aspectTolerance: 0.1,
    },
    card: {
      maxSize: 2 * 1024 * 1024, // 2MB
      formats: ["image/png"],
      minWidth: 300,
      minHeight: 450,
      maxWidth: 1000,
      maxHeight: 1500,
      aspectRatio: 2 / 3,
      aspectTolerance: 0.1,
    },
    banner: {
      maxSize: 3 * 1024 * 1024, // 3MB
      formats: ["image/jpeg", "image/png", "image/webp"],
      minWidth: 1200,
      minHeight: 300,
      maxWidth: 2400,
      maxHeight: 600,
      aspectRatio: 4 / 1,
      aspectTolerance: 0.1,
    },
  };

  const validateImage = async (file, type) => {
    const constraints = CONSTRAINTS[type];

    // Size validation
    if (file.size > constraints.maxSize) {
      throw new Error(
        `Image must be smaller than ${constraints.maxSize / (1024 * 1024)}MB`
      );
    }

    // Format validation
    if (!constraints.formats.includes(file.type)) {
      throw new Error(
        `Image must be ${constraints.formats
          .map((f) => f.split("/")[1])
          .join(" or ")}`
      );
    }

    // Dimension and aspect ratio validation
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        // Check minimum dimensions
        if (
          img.width < constraints.minWidth ||
          img.height < constraints.minHeight
        ) {
          reject(
            new Error(
              `Image must be at least ${constraints.minWidth}x${constraints.minHeight}px`
            )
          );
        }

        // Check minimum dimensions
        if (
          img.width < constraints.minWidth ||
          img.height < constraints.minHeight
        ) {
          reject(
            new Error(
              `Image must be at least ${constraints.minWidth}x${constraints.minHeight}px`
            )
          );
        }

        // Check aspect ratio within tolerance
        const actualRatio = img.width / img.height;
        const targetRatio = constraints.aspectRatio;
        const difference = Math.abs(actualRatio - targetRatio);

        if (difference > constraints.aspectTolerance) {
          console.log("### type here ###");
          console.log(type);
          reject(
            new Error(
              type === "table" || type === "banner"
                ? "Image must have a 16:9 aspect ratio (landscape)"
                : "Image must have a 2:3 aspect ratio (portrait)"
            )
          );
        }

        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: actualRatio,
        });
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = objectUrl;
    });
  };

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      // await validateImage(file);
      await validateImage(file, backgroundType); // or 'card'

      setFile(file);
      setPreview(URL.createObjectURL(file));
      setError("");

      // Close the modal since we have a valid preview and no errors
      setShowUploadModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const getAcceptedTypes = (type) =>
    ({
      table: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
      },
      card: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
      },
      banner: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
      },
    }[type]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedTypes(backgroundType),

    maxFiles: 1,
    multiple: false,
  });
  // END IMAGE HANDLING

  const handleSubmit = async (e) => {
    e.preventDefault();

    // console.log(formData);
    // return;

    if (formData.type === "paid") {
      if (formData.buyIn.entryFee <= 9) {
        dispatch(
          createNotification({
            open: true,
            type: "error",
            message: "Please set a valid entry fee for paid tournaments",
          })
        );
        return;
      }
    }

    setLoading(true);
    dispatch(
      createNotification({
        open: true,
        type: "info",
        message: "Editing tournament...",
      })
    );

    try {
      const response = await axios.put(
        `/api/tournament/edit/?tournamentId=${tournament._id}`,
        formData
      );

      if (response.status === 200) {
        dispatch(
          createNotification({
            open: true,
            type: "success",
            message: "Changes saved successfully!",
          })
        );
        // Optionally, update local state or refetch tournament data
        // setTournament(response.data.tournament);

        // console.log(response.data.tournament);

        router.refresh();
      }
    } catch (error) {
      console.error("Error updating tournament", error);
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: error.response?.data?.message || "Error saving changes.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTargetSubmit = async (e) => {
    // console.log(sponsorshipTarget);

    if (
      !sponsorshipTarget ||
      sponsorshipTarget < 3000 ||
      sponsorshipTarget > 50000
    )
      return;

    setLoading(true);
    try {
      const updatedData = {
        ...formData,
        type: "sponsored",
        sponsorshipDetails: {
          targetAmount: Number(sponsorshipTarget),
        },
      };

      // console.log(updatedData);

      const response = await axios.put(
        `/api/tournament/edit/?tournamentId=${tournament._id}`,
        updatedData
      );

      if (response.status === 200) {
        setFormData(updatedData);
        setIsEnabled(true);
        setShowTargetDialog(false);

        dispatch(
          createNotification({
            open: true,
            type: "success",
            message: "Changes  saved!",
          })
        );
      }
    } catch (error) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Failed to save changes.",
        })
      );
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate form fields
    if (!newProduct.name?.trim()) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Product name is required",
        })
      );
      setLoading(false);
      return;
    }

    if (!newProduct.price || Number(newProduct.price) <= 0) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Price must be greater than 0",
        })
      );
      setLoading(false);
      return;
    }

    if (!newProduct.inventory || Number(newProduct.inventory) < 1) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Inventory must be at least 1",
        })
      );
      setLoading(false);
      return;
    }

    if (!newProduct.tierId) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Product must fit within a sponsorship tier's price range",
        })
      );
      setLoading(false);
      return;
    }

    if (Number(newProduct.price) > 20000) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Price cannot exceed 20,000",
        })
      );
      setLoading(false);
      return;
    }

    try {
      const productArray = [];
      const inventory = Number(newProduct.inventory);
      const groupName = newProduct.name.trim(); // Use the product name as the group name

      for (let i = 1; i <= inventory; i++) {
        const productName = `${groupName}-${i}`; // Generate unique product name

        productArray.push({
          name: productName,
          groupName: groupName,
          image: newProduct.image, // Use the S3 URL instead of image data
          description: newProduct.description,
          type: "physical",
          price: {
            amount: Number(newProduct.price) * 100,
            currency: "KES",
          },
          tournamentId: tournament._id,
          tierId: newProduct.tierId,
        });
      }

      const response = await axios.post(
        `/api/products/create-for-tournament`,
        productArray
      );

      setNewProduct({
        name: "",
        description: "",
        price: "",
        inventory: "",
        image: "",
      });

      setPreviewImage(null);

      dispatch(
        createNotification({
          open: true,
          type: "success",
          message: "Product(s) created successfully",
        })
      );
    } catch (error) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: error.response?.data?.message || "Error creating product",
        })
      );
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Add this handler function
  const handleImageUpload = (imageUrl) => {
    setNewProduct((prev) => ({
      ...prev,
      image: imageUrl,
    }));
  };

  const handleDeleteTournament = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/tournament/${tournament._id}/delete`);

      dispatch(
        createNotification({
          open: true,
          type: "success",
          message: "The tournament has been successfully deleted.",
        })
      );

      router.push(`/lobby`);
      router.refresh();
    } catch (error) {
      console.error("Error deleting tournament:", error);

      dispatch(
        createNotification({
          open: true,
          type: "error",
          message:
            error.response?.data?.message || "Failed to delete tournament",
        })
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveTournament = async () => {
    try {
      // API call to archive tournament
      // await archiveTournament(tournament._id);
      router.refresh();
    } catch (error) {
      console.error("Failed to archive tournament:", error);
    }
  };

  const handleCancelTournament = async () => {
    try {
      // API call to cancel tournament
      // await cancelTournament(tournament._id);
      router.refresh();
    } catch (error) {
      console.error("Failed to cancel tournament:", error);
    }
  };

  const [activeTab, setActiveTab] = useState("create");

  useEffect(() => {
    const price = Number(newProduct.price);
    if (price > 0) {
      const appropriateTier = tournament?.sponsorshipDetails?.tiers.find(
        (tier) =>
          price * 100 >= tier.productStrategy.priceRange.min && // Convert price to cents
          price * 100 <= tier.productStrategy.priceRange.max // Convert price to cents
      );

      setNewProduct((prev) => ({
        ...prev,
        tierId: appropriateTier?.id || null,
      }));

      if (!appropriateTier && price > 0) {
        // Optionally, show price ranges in KES for better user understanding
        dispatch(
          createNotification({
            open: true,
            type: "info",
            message: `Price must be between ${
              tournament?.sponsorshipDetails?.tiers[
                tournament?.sponsorshipDetails?.tiers.length - 1
              ].productStrategy.priceRange.min / 100
            } KES and ${
              tournament?.sponsorshipDetails?.tiers[0].productStrategy
                .priceRange.max / 100
            } KES`,
          })
        );
      }
    }
  }, [newProduct.price, tournament?.sponsorshipDetails?.tiers]);

  if (tournament?.creator?._id === userProfile?.uuid) {
    return (
      <>
        <Dialog open={showTargetDialog} onOpenChange={setShowTargetDialog}>
          <DialogContent className="sm:max-w-[425px] bg-light dark:bg-dark">
            <DialogHeader>
              <DialogTitle>Tournament Sponsorship</DialogTitle>
              <DialogDescription className="space-y-2">
                <p>
                  Set an optional fundraising target for your tournament.
                  Sponsors will contribute by purchasing your merchandise until
                  this goal is met.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <InfoIcon className="h-4 w-4" />
                  <span>Default target: 5,000 KSH</span>
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="target-amount"
                  className="flex items-center gap-2"
                >
                  Target Amount (KSH)
                  <Badge variant="secondary" className="font-normal">
                    Optional
                  </Badge>
                </Label>
                <div className="relative">
                  <Input
                    id="target-amount"
                    type="number"
                    value={sponsorshipTarget}
                    onChange={(e) => setSponsorshipTarget(e.target.value)}
                    placeholder="5,000 KSH (Default)"
                    min="3000"
                    max="50000"
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    KSH
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>💡</span>
                  <span>Recommended range: 3,000 KSH - 50,000 KSH</span>
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowTargetDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTargetSubmit}
                disabled={sponsorshipTarget < 3000 && sponsorshipTarget !== 0}
              >
                Continue with{" "}
                {sponsorshipTarget > 0 ? `${sponsorshipTarget} KSH` : "Default"}{" "}
                Target
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="">
          <motion.div
            className="space-y-4 sm:space-y-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {/* <motion.div variants={cardVariants}> */}
            <Accordion
              type="single"
              collapsible
              // defaultValue="basic-info"
            >
              <motion.div variants={cardVariants}>
                <AccordionItem value="basic-info">
                  <AccordionTrigger className="text-lg md:text-xl">
                    Basic Info
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <div className="relative">
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="pr-10"
                            readOnly
                          />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  The tournament name cannot be changed once
                                  set. This ensures consistency and avoids
                                  confusion for participants.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                        />
                      </div>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              <motion.div variants={cardVariants}>
                <AccordionItem value="game">
                  <AccordionTrigger className="text-lg md:text-xl">
                    Game Info
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card className="p-4 space-y-4">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Gamepad2 className="h-4 w-4" />
                          Gameplay Settings
                        </h3>

                        <div className="flex items-start justify-between py-3">
                          <div className="space-y-1">
                            <h3 className="font-medium">Turn Timer (30s)</h3>
                            <p className="text-sm text-muted-foreground">
                              Enable 30-second timer for each turn
                            </p>
                          </div>
                          <Switch
                            checked={formData.gameSettings?.timerEnabled}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({
                                ...prev,
                                gameSettings: {
                                  ...prev.gameSettings,
                                  timerEnabled: checked,
                                },
                              }))
                            }
                          />
                        </div>
                      </div>

                      {tournament.type === "paid" && (
                        <>
                          <Separator className="my-4" />

                          <div className="space-y-4">
                            <div className="flex items-start justify-between py-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">
                                    Automatic Tournament Start
                                  </h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Automatically start the tournament when the
                                  last player joins
                                </p>
                              </div>
                              <Switch
                                checked={formData.autoStart}
                                onCheckedChange={(checked) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    autoStart: checked,
                                  }))
                                }
                                disabled={formData.type !== "paid"}
                              />
                            </div>

                            {formData.autoStart && (
                              <div className="rounded-lg bg-muted p-4 text-sm space-y-3">
                                <div className="flex items-start gap-2">
                                  <InfoIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <div className="space-y-2">
                                    <p>When enabled:</p>
                                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                      <li>
                                        Tournament starts immediately when
                                        player count reaches{" "}
                                        {formData.numberOfParticipants}
                                      </li>
                                      <li>
                                        Players are automatically assigned to
                                        their matches
                                      </li>
                                      {/* <li>
                                    All participants receive start notifications
                                  </li>
                                  <li>
                                    Timer countdown begins for first matches
                                  </li> */}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              <motion.div variants={cardVariants}>
                <AccordionItem value="tournament-chat">
                  <AccordionTrigger className="text-lg md:text-xl">
                    Tournament Chat
                  </AccordionTrigger>
                  <AccordionContent>
                    {/* <Card className="p-4 space-y-4"> */}
                    {tournament.telegramGroup ? (
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={`https://api.dicebear.com/6.x/initials/svg?seed=${tournament?.telegramGroup.name}`}
                              alt={tournament?.telegramGroup.name}
                              className="h-10 w-10 rounded-full bg-background"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-[#0088cc] rounded-full p-1">
                              <Send className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              {tournament?.telegramGroup.name}
                              <Badge variant="secondary" className="text-xs">
                                {tournament?.telegramGroup.memberCount} members
                              </Badge>
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Official tournament chat • Bot status: Active
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          // onClick={() =>
                          //   window.open(
                          //     tournament?.telegramGroup.inviteLink,
                          //     "_blank"
                          //   )
                          // }
                          title="Open in Telegram"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center p-4">
                        Tournament chat information unavailable
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 mt-4">
                      <Label htmlFor="requireTelegram" className="text-sm">
                        Require Telegram for Participants
                      </Label>
                      <Switch
                        id="requireTelegram"
                        checked={formData.requireTelegram}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => ({
                            ...prev,
                            requireTelegram: checked,
                          }));
                        }}
                      />
                    </div>

                    {/* Add a message if telegram is not required. */}
                    {!formData?.requireTelegram && (
                      <div className="text-sm text-muted-foreground text-center p-4">
                        Telegram is optional for this tournament.
                      </div>
                    )}
                    {formData?.requireTelegram && (
                      <div className="text-sm text-muted-foreground text-center p-4">
                        Telegram is required for this tournament.
                      </div>
                    )}
                    {/* </Card> */}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              {tournament.type === "sponsored" && (
                <motion.div variants={cardVariants}>
                  <AccordionItem value="sponsorships">
                    <AccordionTrigger className="text-lg md:text-xl">
                      Sponsorship Products
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card className="w-full">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                              <CardTitle className="flex flex-col md:flex-row items-center gap-2">
                                <span className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs truncate"
                                  >
                                    Target:{" "}
                                    {(
                                      tournament?.sponsorshipDetails
                                        ?.targetAmount / 100
                                    )?.toLocaleString()}{" "}
                                    KES
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize truncate"
                                  >
                                    {tournament?.sponsorshipDetails?.scale}{" "}
                                    Tournament
                                  </Badge>
                                </span>
                              </CardTitle>
                              <CardDescription>
                                Create and manage sponsorship products
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                          <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                              {/* <TabsTrigger value="tiers">
                          Tiers & Products
                        </TabsTrigger> */}
                              <TabsTrigger value="create">Create</TabsTrigger>
                              <TabsTrigger value="manage">Manage</TabsTrigger>
                            </TabsList>

                            {/* <TabsContent value="tiers" className="space-y-4">
                        {tournament?.sponsorshipDetails?.tiers.map((tier) => (
                          <SponsorshipTierCard
                            key={tier.id}
                            tier={tier}
                            products={products || []}
                            sponsorships={
                              tournament.sponsorshipDetails.sponsors
                            }
                            // onEditTier={onEditTier}
                            // onAssignProduct={onAssignProduct}
                          />
                        ))}
                      </TabsContent> */}

                            <TabsContent value="create">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                                    <Package className="h-5 w-5" />
                                    New Product
                                  </CardTitle>
                                  {matchingTier && (
                                    <CardDescription>
                                      Will be assigned to {matchingTier.name}{" "}
                                      tier
                                    </CardDescription>
                                  )}
                                </CardHeader>

                                <CardContent>
                                  <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                      id="name"
                                      value={newProduct.name}
                                      onChange={(e) =>
                                        setNewProduct((prev) => ({
                                          ...prev,
                                          name: e.target.value,
                                        }))
                                      }
                                      placeholder="Product name"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="description">
                                      Description
                                    </Label>
                                    <Textarea
                                      id="description"
                                      value={newProduct.description}
                                      onChange={(e) =>
                                        setNewProduct((prev) => ({
                                          ...prev,
                                          description: e.target.value,
                                        }))
                                      }
                                      placeholder="Product description"
                                      className="min-h-[100px]"
                                    />
                                  </div>

                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label
                                          htmlFor="price"
                                          className="flex items-center gap-2"
                                        >
                                          Price (KSH)
                                          <TooltipProvider delayDuration={100}>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-muted-foreground" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>
                                                  Recommended: Add 30-40% markup
                                                  to cover profit sharing
                                                </p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </Label>
                                        <Input
                                          id="price"
                                          type="number"
                                          value={newProduct.price}
                                          onChange={(e) =>
                                            setNewProduct((prev) => ({
                                              ...prev,
                                              price: e.target.value,
                                            }))
                                          }
                                          min="0"
                                          max="20000"
                                          className="pr-12"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="inventory">Stock</Label>
                                        <Input
                                          id="inventory"
                                          type="number"
                                          value={newProduct.inventory}
                                          onChange={(e) =>
                                            setNewProduct((prev) => ({
                                              ...prev,
                                              inventory: e.target.value,
                                            }))
                                          }
                                          min="1"
                                        />
                                      </div>
                                    </div>

                                    {basePrice > 0 && quantity > 0 && (
                                      <Card className="bg-muted/50">
                                        <CardContent className="p-3 sm:p-4">
                                          <div className="flex items-center gap-2 mb-3">
                                            <Calculator className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                              Profit Breakdown
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-1">
                                              <p className="text-xs md:text-sm text-muted-foreground">
                                                Your Profit/Item
                                              </p>
                                              <p className="text-sm font-medium">
                                                KSH {profits.perItem.toFixed(0)}
                                              </p>
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-xs md:text-sm text-muted-foreground">
                                                Total Profit
                                              </p>
                                              <p className="text-sm font-medium">
                                                KSH {profits.total.toFixed(0)}
                                              </p>
                                            </div>
                                            <div className="col-span-2">
                                              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                                <span>Creator: 70%</span>
                                                <span>Winner: 25%</span>
                                                <span>Platform: 5%</span>
                                              </div>
                                              <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
                                                <div
                                                  className="h-full bg-gradient-to-r from-primary to-primary/70"
                                                  style={{ width: "70%" }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}
                                  </div>

                                  <ProductImageUpload
                                    imageFile={imageFile}
                                    setImageFile={setImageFile}
                                    setPreviewImage={setPreviewImage}
                                    previewImage={previewImage}
                                    setError={setError}
                                    error={error}
                                    clearImage={() => {
                                      setPreviewImage(null);
                                      setImageFile(null);
                                      setError("");
                                      // Also clear the image URL from the product data
                                      setNewProduct((prev) => ({
                                        ...prev,
                                        image: "",
                                      }));
                                    }}
                                    onImageUpload={handleImageUpload}
                                    tournamentId={tournament._id}
                                  />
                                </CardContent>
                                <CardFooter>
                                  <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                    onClick={(e) => createProduct(e)}
                                  >
                                    {loading ? "Creating..." : "Create Product"}
                                  </Button>
                                </CardFooter>
                              </Card>
                            </TabsContent>

                            <TabsContent value="manage">
                              <ProductsGrid
                                products={productsData?.products || []}
                                tiers={tournament.sponsorshipDetails.tiers}
                                tournamentStatus={tournament.status}
                              />
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              )}

              <motion.div variants={cardVariants}>
                <AccordionItem value="prize-distribution">
                  <AccordionTrigger className="text-lg md:text-xl">
                    Prize Distribution{" "}
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card className="pt-4 space-y-4">
                      {/* Economics Overview */}
                      <div className="rounded-lg bg-muted/50 p-4">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          {isPaidTournament ? (
                            <>
                              <Coins className="h-5 w-5 text-primary" />
                              Prize Pool Distribution
                            </>
                          ) : (
                            <>
                              <Gift className="h-5 w-5 text-primary" />
                              Sponsorship Distribution
                            </>
                          )}
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          {isPaidTournament ? (
                            <>
                              <div className="text-center">
                                <p className="text-muted-foreground">
                                  Prize Pool
                                </p>
                                <p className="font-medium">75%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">Creator</p>
                                <p className="font-medium">15%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">
                                  Platform
                                </p>
                                <p className="font-medium">10%</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-center">
                                <p className="text-muted-foreground">Creator</p>
                                <p className="font-medium">60%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">Winners</p>
                                <p className="font-medium">30%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">
                                  Platform
                                </p>
                                <p className="font-medium">10%</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Prize Split Selection */}
                      <RadioGroup
                        value={distribution}
                        onValueChange={handleDistributionChange}
                        disabled={!isEditable}
                      >
                        <div className="grid gap-4">
                          {/* Winner Takes All */}
                          <Label
                            className={`relative flex items-start p-4 cursor-pointer rounded-lg border-2 transition-all
                 ${
                   distribution === "winnerTakeAll"
                     ? "border-primary bg-primary/5"
                     : "border-muted hover:border-primary/50"
                 }`}
                          >
                            <RadioGroupItem
                              value="winnerTakeAll"
                              className="sr-only"
                            />
                            <div className="flex items-center gap-4">
                              <div className="p-2 rounded-full bg-primary/10">
                                <Trophy className="h-5 w-5 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">
                                  Winner Takes All
                                </p>
                                <Badge className="bg-primary/10 text-primary">
                                  {isPaidTournament
                                    ? "100% of prize pool"
                                    : "30% to winner"}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                  Best for tournaments up to 16 players
                                </p>
                              </div>
                            </div>
                          </Label>

                          {/* Three-Way Split */}
                          <Label
                            className={`relative flex items-start p-4 cursor-pointer rounded-lg border-2 transition-all
                 ${
                   distribution === "threeWaySplit"
                     ? "border-primary bg-primary/5"
                     : "border-muted hover:border-primary/50"
                 }`}
                          >
                            <RadioGroupItem
                              value="threeWaySplit"
                              className="sr-only"
                            />
                            <div className="flex items-center gap-4">
                              <div className="p-2 rounded-full bg-primary/10">
                                <Medal className="h-5 w-5 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">
                                  Top 3 Split
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {isPaidTournament ? (
                                    <>
                                      <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                        1st: 60%
                                      </Badge>
                                      <Badge className="bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400">
                                        2nd: 25%
                                      </Badge>
                                      <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                        3rd: 15%
                                      </Badge>
                                    </>
                                  ) : (
                                    <>
                                      <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                        1st: 18%
                                      </Badge>
                                      <Badge className="bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400">
                                        2nd: 7.5%
                                      </Badge>
                                      <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                        3rd: 4.5%
                                      </Badge>
                                    </>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Recommended for larger tournaments
                                </p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>

                      {/* Info Section */}
                      <div className="rounded-lg bg-muted/50 p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Info className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs md:text-sm text-muted-foreground">
                            {distribution === "winnerTakeAll"
                              ? isPaidTournament
                                ? "Full prize pool to tournament champion"
                                : "Winner receives entire 30% prize portion"
                              : "Prize portion split among top 3 finishers"}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              <motion.div variants={cardVariants}>
                <AccordionItem value="appearance">
                  <AccordionTrigger className="text-lg md:text-xl">
                    Appearance
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card className="pt-4 space-y-4">
                      {" "}
                      <CardContent className="space-y-4 sm:space-y-6">
                        <Tabs
                          defaultValue="table"
                          onValueChange={handleTabChange}
                        >
                          <TabsList className="grid w-full grid-cols-3 gap-1 md:gap-2">
                            <TabsTrigger
                              value="banner"
                              className="px-2 py-1 text-xs sm:text-sm"
                            >
                              <span className="hidden sm:inline">
                                Tournament Banner
                              </span>
                              <span className="sm:hidden">Banner</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="table"
                              className="px-2 py-1 text-xs sm:text-sm"
                            >
                              <span className="hidden sm:inline">
                                Table Background
                              </span>
                              <span className="sm:hidden">Table</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="card"
                              className="px-2 py-1 text-xs sm:text-sm"
                            >
                              <span className="hidden sm:inline">
                                Card Skin Design
                              </span>
                              <span className="sm:hidden">Card Skin</span>
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="banner">
                            <Card className="w-full max-w-2xl mx-auto">
                              <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                                  Tournament Banner Image
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="text-muted-foreground cursor-help h-4 w-4 sm:h-5 sm:w-5" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs sm:text-sm">
                                          Add a banner image to showcase your
                                          tournament (Recommended: 1200x300px)
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                                <div
                                  className="w-full h-32 sm:h-48 rounded-lg overflow-hidden shadow-lg relative"
                                  style={{
                                    backgroundImage: `url(${
                                      preview || formData.customBannerImage
                                    })`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }}
                                >
                                  {!preview && !formData.customBannerImage && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                      <p className="text-sm text-muted-foreground">
                                        Banner Preview
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="max-w-md mx-auto">
                                  <Button
                                    variant={file ? "default" : "outline"}
                                    className="w-full h-auto py-3"
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (file) {
                                        handleUpload();
                                      } else {
                                        setShowUploadModal(true);
                                      }
                                    }}
                                    disabled={uploading}
                                  >
                                    <div className="flex items-center gap-2">
                                      {uploading ? (
                                        <div className="w-full space-y-2">
                                          <Progress
                                            value={progress}
                                            className="h-2"
                                          />
                                          <p className="text-xs text-center text-muted-foreground">
                                            Uploading... {progress}%
                                          </p>
                                        </div>
                                      ) : (
                                        <>
                                          {file ||
                                          formData.customBannerImage ? (
                                            <ImageIcon className="h-4 w-4" />
                                          ) : (
                                            <Crown className="h-4 w-4" />
                                          )}
                                          <span>
                                            {file
                                              ? "Upload Banner"
                                              : formData.customBannerImage
                                              ? isHovered
                                                ? "Change Banner"
                                                : "Banner Added"
                                              : "Add Tournament Banner"}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent value="table">
                            <Card className="w-full max-w-2xl mx-auto">
                              <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                                  Cards Table Background
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="text-muted-foreground cursor-help h-4 w-4 sm:h-5 sm:w-5" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs sm:text-sm">
                                          Customize table ambiance
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                                <div
                                  className="aspect-video rounded-lg overflow-hidden shadow-lg relative"
                                  style={{
                                    backgroundImage: `url(${
                                      preview ||
                                      formData.customTableBackgroundImage
                                    })`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }}
                                >
                                  <div className="absolute inset-0">
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-1 sm:space-x-2">
                                      <div className="w-4 sm:w-6 md:w-8 h-6 sm:h-8 md:h-12 bg-white rounded-md border-2 border-gray-300"></div>
                                      <div className="w-4 sm:w-6 md:w-8 h-6 sm:h-8 md:h-12 bg-white rounded-md border-2 border-gray-300"></div>
                                    </div>

                                    <div className="absolute bottom-1 sm:bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 w-3 sm:w-4 md:w-8 h-3 sm:h-4 md:h-8 bg-blue-500 rounded-full"></div>
                                    <div className="absolute top-1 sm:top-2 md:top-4 left-1/2 transform -translate-x-1/2 w-3 sm:w-4 md:w-8 h-3 sm:h-4 md:h-8 bg-red-500 rounded-full"></div>
                                  </div>
                                </div>

                                <div className="max-w-md mx-auto">
                                  <Button
                                    variant={file ? "default" : "outline"}
                                    className="w-full h-auto py-3"
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (file) {
                                        handleUpload();
                                      } else {
                                        setShowUploadModal(true);
                                      }
                                    }}
                                    disabled={uploading}
                                  >
                                    <div className="flex items-center gap-2">
                                      {uploading ? (
                                        <div className="w-full space-y-2">
                                          <Progress
                                            value={progress}
                                            className="h-2"
                                          />
                                          <p className="text-xs text-center text-muted-foreground">
                                            Uploading... {progress}%
                                          </p>
                                        </div>
                                      ) : (
                                        <>
                                          {backgroundType === "banner" && (
                                            <>
                                              {file ||
                                              formData.customBannerImage ? (
                                                <ImageIcon className="h-4 w-4" />
                                              ) : (
                                                <Crown className="h-4 w-4" />
                                              )}
                                              <span>
                                                {file
                                                  ? "Upload Banner"
                                                  : formData.customBannerImage
                                                  ? isHovered
                                                    ? "Change Banner"
                                                    : "Banner Added"
                                                  : "Add Custom Banner"}
                                              </span>
                                            </>
                                          )}

                                          {backgroundType === "table" && (
                                            <>
                                              {file ||
                                              formData.customTableBackgroundImage ? (
                                                <ImageIcon className="h-4 w-4" />
                                              ) : (
                                                <Crown className="h-4 w-4" />
                                              )}
                                              <span>
                                                {file
                                                  ? "Upload Background"
                                                  : formData.customTableBackgroundImage
                                                  ? isHovered
                                                    ? "Change Background"
                                                    : "Background Added"
                                                  : "Add Custom Background"}
                                              </span>
                                            </>
                                          )}

                                          {backgroundType === "card" && (
                                            <>
                                              {file ||
                                              formData.customCardSkinImage ? (
                                                <ImageIcon className="h-4 w-4" />
                                              ) : (
                                                <Crown className="h-4 w-4" />
                                              )}
                                              <span>
                                                {file
                                                  ? "Upload Skin"
                                                  : formData.customCardSkinImage
                                                  ? isHovered
                                                    ? "Change Skin"
                                                    : "Skin Added"
                                                  : "Add Custom Skin"}
                                              </span>
                                            </>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent value="card">
                            <Card className="w-full max-w-2xl mx-auto">
                              <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                                  Individual Cards Skin
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="text-muted-foreground cursor-help h-4 w-4 sm:h-5 sm:w-5" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs sm:text-sm">
                                          Customize card skin design
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                                <div className="aspect-[2/3] w-24 sm:w-32 mx-auto rounded-lg overflow-hidden shadow-lg relative">
                                  <img
                                    src={
                                      preview || formData.customCardSkinImage
                                    }
                                    alt="Card Skin Preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                <div className="max-w-md mx-auto">
                                  <Button
                                    variant={file ? "default" : "outline"}
                                    className="w-full h-auto py-3"
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (file) {
                                        handleUpload();
                                      } else {
                                        setShowUploadModal(true);
                                      }
                                    }}
                                    disabled={uploading}
                                  >
                                    <div className="flex items-center gap-2">
                                      {uploading ? (
                                        <div className="w-full space-y-2">
                                          <Progress
                                            value={progress}
                                            className="h-2"
                                          />
                                          <p className="text-xs text-center text-muted-foreground">
                                            Uploading... {progress}%
                                          </p>
                                        </div>
                                      ) : (
                                        <>
                                          {file ||
                                          formData.customCardSkinImage ? (
                                            <ImageIcon className="h-4 w-4" />
                                          ) : (
                                            <Crown className="h-4 w-4" />
                                          )}
                                          <span>
                                            {file
                                              ? "Upload Skin"
                                              : formData.customCardSkinImage
                                              ? isHovered
                                                ? "Change Skin"
                                                : "Skin Added"
                                              : "Add Custom Skin"}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>

                    <Dialog
                      open={showUploadModal}
                      onOpenChange={setShowUploadModal}
                    >
                      <DialogContent className="sm:max-w-md bg-light dark:bg-dark">
                        <DialogHeader>
                          <DialogTitle>{getTitle()}</DialogTitle>
                        </DialogHeader>

                        {error && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <UploadSection
                          getRootProps={getRootProps}
                          isDragActive={isDragActive}
                          getInputProps={getInputProps}
                          uploadType={backgroundType}
                        />
                      </DialogContent>
                    </Dialog>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              {/* <motion.div variants={cardVariants}>
                <AccordionItem value="payment-information">
                  <AccordionTrigger className="text-lg md:text-xl">
                    Payment Information
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card className="p-4 space-y-4">
                      {formData.paymentType === "phoneNumber" && (
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.paymentDetails || ""}
                            // onChange={handleChange}
                            placeholder="Enter Phone Number"
                            type="tel"
                          />
                        </div>
                      )}

                      {formData.paymentType === "mpesaPaybill" && (
                        <div className="space-y-2">
                          <Label htmlFor="mpesaPaybill">
                            Mpesa Paybill Number
                          </Label>
                          <Input
                            id="mpesaPaybill"
                            name="mpesaPaybill"
                            value={formData.paymentDetails || ""}
                            // onChange={handleChange}
                            placeholder="Enter Paybill Number"
                            type="text"
                          />
                        </div>
                      )}

                      {formData.paymentType === "lipaNaMpesa" && (
                        <div className="space-y-2">
                          <Label htmlFor="lipaNaMpesa">
                            Business/Till Number
                          </Label>
                          <Input
                            id="lipaNaMpesa"
                            name="lipaNaMpesa"
                            value={formData.paymentDetails || ""}
                            // onChange={handleChange}
                            placeholder="Enter Business/Till Number"
                            type="text"
                          />
                        </div>
                      )}
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </motion.div> */}
            </Accordion>

            {/* <motion.div variants={cardVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Match Schedule
                  </CardTitle>
                  <CardDescription>
                    Set optional schedule for tournament rounds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Enable Match Scheduling</Label>
                        <p className="text-sm text-muted-foreground">
                          Set specific times for tournament matches
                        </p>
                      </div>
                      <Switch
                        checked={formData.matchSchedule?.enabled || false}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => ({
                            ...prev,
                            matchSchedule: {
                              ...(prev.matchSchedule || {}),
                              enabled: checked,
                              rounds: checked
                                ? Array.from({
                                    length: Math.ceil(
                                      Math.log2(tournament.numberOfParticipants)
                                    ),
                                  }).map((_, index) => ({
                                    round: index + 1,
                                    scheduledTime: null,
                                  }))
                                : [],
                            },
                          }));
                        }}
                      />
                    </div>

                    {formData.matchSchedule?.enabled && (
                      <div className="space-y-4 pt-4">
                        {Array.from({
                          length: Math.ceil(
                            Math.log2(tournament.numberOfParticipants)
                          ),
                        }).map((_, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="w-24">
                              <Label>Round {index + 1}</Label>
                            </div>
                            <div className="flex-1">
                              <Input
                                type="datetime-local"
                                value={
                                  formData.matchSchedule?.rounds?.[index]
                                    ?.scheduledTime || ""
                                }
                                onChange={(e) => {
                                  const newSchedule = [
                                    ...(formData.matchSchedule?.rounds || []),
                                  ];
                                  newSchedule[index] = {
                                    round: index + 1,
                                    scheduledTime: e.target.value,
                                  };
                                  setFormData((prev) => ({
                                    ...prev,
                                    matchSchedule: {
                                      ...prev.matchSchedule,
                                      rounds: newSchedule,
                                    },
                                  }));
                                }}
                              />
                            </div>
                            {index > 0 && (
                              <div className="text-xs text-muted-foreground">
                                +30min buffer from previous round
                              </div>
                            )}
                          </div>
                        ))}

                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 mt-0.5" />
                            <div className="text-sm text-muted-foreground">
                              <p>Schedule Information:</p>
                              <ul className="list-disc pl-4 mt-2 space-y-1">
                                <li>30-minute buffer between rounds</li>
                                <li>Participants receive notifications</li>
                                <li>All times shown in local timezone</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div> */}

            {errorMessage && <p className="text-destructive">{errorMessage}</p>}
            <motion.div variants={cardVariants}>
              <Button
                onClick={(e) => handleSubmit(e)}
                disabled={
                  loading ||
                  (!isFormDataChanged() &&
                    ["draft", "setup", "ready"].includes(tournament?.status))
                }
              >
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    These actions are irreversible and should be used with
                    caution
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tournament Actions */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {tournament.status !== "in-progress" &&
                      tournament.status !== "completed" && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card className="border-destructive/20">
                            <CardContent className="pt-6">
                              <div className="flex flex-col gap-4">
                                <div className="flex items-start gap-4">
                                  {/* <div className="p-2 rounded-lg bg-destructive/10">
                                    <Trash2 className="h-5 w-5 text-destructive" />
                                  </div> */}
                                  <div className="space-y-1">
                                    <h4 className="font-medium">
                                      Delete Tournament
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      Permanently remove this tournament and all
                                      associated data
                                    </p>
                                  </div>
                                </div>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      {isDeleting ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Deleting...
                                        </>
                                      ) : (
                                        "Delete Tournament"
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-light dark:bg-dark w-11/12 rounded-lg">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Are you absolutely sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the
                                        tournament &quot;{tournament.name}&quot;
                                        and all associated data. This action
                                        cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel disabled={isDeleting}>
                                        Cancel
                                      </AlertDialogCancel>

                                      <AlertDialogAction
                                        onClick={handleDeleteTournament}
                                        className="bg-destructive hover:bg-destructive/90"
                                        disabled={isDeleting}
                                      >
                                        Delete Tournament
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}

                    {tournament.status === "draft" && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card className="border-destructive/20">
                          <CardContent className="pt-6">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-orange-500/10">
                                  <Ban className="h-5 w-5 text-orange-500" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="font-medium">
                                    Cancel Tournament
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Cancel this tournament before it begins
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                // onClick={onCancel}
                                className="border-orange-500/20 hover:bg-orange-500/10"
                              >
                                Cancel Tournament
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {tournament.status === "completed" && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card className="border-destructive/20">
                          <CardContent className="pt-6">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                  <Archive className="h-5 w-5 text-blue-500" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="font-medium">
                                    Archive Tournament
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Hide this tournament from public view
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                // onClick={onArchive}
                                className="border-blue-500/20 hover:bg-blue-500/10"
                              >
                                Archive Tournament
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
          {/* <button onClick={() => console.log(tournament)}>..TOURNAMENT.</button>
          <br /> */}
          {/* <br />
          <button onClick={() => console.log(formData)}>DATA DE FORM</button> */}

          {/* <button onClick={() => console.log(productsData)}>Details</button> */}

          {/* <button onClick={() => console.log(tournament)}>..TOURNAMENT.</button> */}
        </div>
      </>
    );
  } else {
    return null;
  }
};

export default Settings;
