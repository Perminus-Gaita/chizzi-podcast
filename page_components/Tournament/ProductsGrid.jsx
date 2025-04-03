import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Edit2,
  Trash2,
  MoreVertical,
  Filter,
  Tags,
  DollarSign,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

const getTierColor = (id) => {
  const colors = {
    community: { color: "text-blue-500", bgColor: "bg-blue-500" },
    partner: { color: "text-indigo-500", bgColor: "bg-indigo-500" },
    champion: { color: "text-yellow-500", bgColor: "bg-yellow-500" },
    legend: { color: "text-purple-500", bgColor: "bg-purple-500" },
  };
  return colors[id] || colors.community;
};

const ProductCard = ({
  product,
  tier,
  //  onEdit,
  onDelete,
  //  onAssignTier
  tournamentStatus,
}) => {
  const tierColor = tier ? getTierColor(tier.id) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="relative group">
        <CardContent className="p-4">
          {/* Product Image */}
          <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-muted">
            <img
              src={product.image || "/api/placeholder/400/400"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Tier Badge Overlay */}
            {tier && (
              <div className="absolute top-2 right-2">
                <Badge className={`${tierColor.color} ${tierColor.bgColor}/10`}>
                  {tier.name}
                </Badge>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {product.sold} sold of {product.inventory}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem onClick={() => onEdit(product)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Product
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAssignTier(product)}>
                    <Tags className="h-4 w-4 mr-2" />
                    Assign to Tier
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={() => onDelete(product)}
                    disabled={["ready", "in-progress", "completed"].includes(
                      tournamentStatus
                    )}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Product
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Price and Type */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="font-medium">
                {(product?.price?.amount / 100).toLocaleString()} KES
              </Badge>
              {/* <Badge variant="outline">{product.type}</Badge> */}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ProductFilters = ({ filters, onChange }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Min price..."
            type="number"
            className="pl-8"
            value={filters.minPrice}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
          />
        </div>
        <div className="relative flex-1">
          <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Max price..."
            type="number"
            className="pl-8"
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
          />
        </div>
      </div>

      <Select
        value={filters.tier}
        onValueChange={(value) => onChange({ ...filters, tier: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by tier" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tiers</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          <SelectItem value="community">Community</SelectItem>
          <SelectItem value="partner">Partner</SelectItem>
          <SelectItem value="champion">Champion</SelectItem>
          <SelectItem value="legend">Legend</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.sort}
        onValueChange={(value) => onChange({ ...filters, sort: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
          <SelectItem value="sold-desc">Most Sold</SelectItem>
          <SelectItem value="sold-asc">Least Sold</SelectItem>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

const ProductsGrid = ({
  products = [],
  tiers = [],
  // onEditProduct,
  onDeleteProduct,
  // onAssignTier,
  tournamentStatus,
}) => {
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    tier: "all",
    sort: "newest",
  });

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      if (filters.minPrice && product.price < filters.minPrice * 100)
        return false;
      if (filters.maxPrice && product.price > filters.maxPrice * 100)
        return false;
      if (filters.tier === "unassigned" && product.tierId) return false;
      if (
        filters.tier !== "all" &&
        filters.tier !== "unassigned" &&
        product.tierId !== filters.tier
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "sold-desc":
          return b.sold - a.sold;
        case "sold-asc":
          return a.sold - b.sold;
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        default:
          return 0;
      }
    });

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-40">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No products yet. Create your first product!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* <ProductFilters filters={filters} onChange={setFilters} /> */}

      {filteredProducts.length === 0 ? (
        <Alert>
          <AlertDescription>
            No products match your current filters.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                tier={tiers.find((t) => t.id === product.tierId)}
                // onEdit={onEditProduct}
                onDelete={onDeleteProduct}
                // onAssignTier={onAssignTier}
                tournamentStatus={tournamentStatus}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;
