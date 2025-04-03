import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Wallet } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// Dummy data for NFT products
const dummyNFTProducts = [
  {
    _id: "nft1",
    name: "Tuma salamu",
    description: "Tuma salamu kwa upendekwako",
    image: "https://images.unsplash.com/photo-1605979257913-1704eb7b6246?q=80&w=2070&auto=format&fit=crop",
    price: 500,
    currency: "KSH",
    owner: {
      _id: "p1",
      name: "John Smith",
      username: "johnsmith",
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=john"
    }
  },
  {
    _id: "nft2",
    name: "Shout out",
    description: "Untakako shoutout",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2070&auto=format&fit=crop",
    price: 250,
    currency: "KSH",
    owner: {
      _id: "p2",
      name: "Jane Doe",
      username: "janedoe",
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane"
    }
  },
  {
    _id: "nft3",
    name: "Mchongoano",
    description: "Lipa uchongolewe ama beshte yako achongolewe",
    image: "https://images.unsplash.com/photo-1495727034151-8fdc73e332a8?q=80&w=2065&auto=format&fit=crop",
    price: 350,
    currency: "KSH",
    owner: {
      _id: "p3",
      name: "Michael Brown",
      username: "mikeb",
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael"
    }
  },
];

const NFTProductCard = ({ product, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full bg-white dark:bg-gray-900 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* NFT Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        </div>

        <CardContent className="pt-4 pb-2">
          <h3 className="font-bold text-lg mb-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
          
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-bold">{product.price} {product.currency}</span>
            </div>
            <Button size="sm" className="h-8">Buy</Button>
          </div>
        </CardContent>

        <CardFooter className="pt-2 mt-auto border-t dark:border-gray-800">
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-8 w-8 border dark:border-gray-700 flex-shrink-0">
              <AvatarImage src={product.owner.profilePicture} />
              <AvatarFallback>{product.owner.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{product.owner.name}</span>
              <span className="text-xs text-muted-foreground">@{product.owner.username}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const NFTProductsTab = ({ products = dummyNFTProducts }) => {
  return (
    <div className="space-y-6 pt-[25px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <NFTProductCard key={product._id} product={product} index={index} />
        ))}
      </div>
    </div>
  );
};

export default NFTProductsTab;