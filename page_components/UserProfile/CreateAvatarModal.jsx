"use client";
import React, { useState } from "react";
import axios from "axios";

import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Gamepad2,
  Swords,
  Shield,
  Brain,
  Crown,
  AlertTriangle,
} from "lucide-react";

const archetypes = [
  {
    id: "aggressive",
    name: "Aggressive",
    icon: <Swords className="w-6 h-6" />,
    description:
      "A bold player who prioritizes offensive plays and rapid hand reduction.",
    baseStrategy: {
      weights: { offensive: 0.6, defensive: 0.2, control: 0.2 },
      traits: {
        riskTolerance: 0.8,
        specialCardUsage: 0.7,
        multiCardPreference: 0.6,
        suitControlPriority: 0.4,
      },
    },
  },
  {
    id: "defensive",
    name: "Defensive",
    icon: <Shield className="w-6 h-6" />,
    description:
      "A cautious player who excels at avoiding penalties and maintaining control.",
    baseStrategy: {
      weights: { offensive: 0.2, defensive: 0.6, control: 0.2 },
      traits: {
        riskTolerance: 0.3,
        specialCardUsage: 0.4,
        multiCardPreference: 0.3,
        suitControlPriority: 0.7,
      },
    },
  },
  {
    id: "tactical",
    name: "Tactical",
    icon: <Brain className="w-6 h-6" />,
    description:
      "A strategic player who masters card sequences and suit control.",
    baseStrategy: {
      weights: { offensive: 0.2, defensive: 0.2, control: 0.6 },
      traits: {
        riskTolerance: 0.5,
        specialCardUsage: 0.6,
        multiCardPreference: 0.4,
        suitControlPriority: 0.8,
      },
    },
  },
  {
    id: "balanced",
    name: "Balanced",
    icon: <Crown className="w-6 h-6" />,
    description:
      "A versatile player who adapts their strategy based on the situation.",
    baseStrategy: {
      weights: { offensive: 0.33, defensive: 0.33, control: 0.34 },
      traits: {
        riskTolerance: 0.5,
        specialCardUsage: 0.5,
        multiCardPreference: 0.5,
        suitControlPriority: 0.5,
      },
    },
  },
];

const CreateAvatarModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    selectedArchetype: null,
  });

  const createKadiPlayer = async () => {
    console.log(formData);

    if (!formData.name || !formData.selectedArchetype) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/cards/kadistrategy/create", {
        name: formData.name,
        archetype: formData.selectedArchetype.id,
      });

      console.log("### CREATED KADI STRATEGY ###");
      console.log(response);

      //   onSuccess?.(result);
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-11/12 md:max-w-[80%] lg:max-w-[60%] h-[90vh] sm:h-[85vh] bg-light dark:bg-dark">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create Your Kadi AI Avatar
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-2">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <Label htmlFor="name" className="text-lg">
                  Avatar Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter a name for your AI avatar"
                  className="text-lg"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-lg">Choose Your Archetype</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {archetypes.map((archetype) => (
                    <Card
                      key={archetype.id}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        formData.selectedArchetype?.id === archetype.id
                          ? "border-primary"
                          : ""
                      }`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          selectedArchetype: archetype,
                        })
                      }
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          {archetype.icon}
                          <CardTitle>{archetype.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          {archetype.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </ScrollArea>

        {error && (
          <div className="flex items-center gap-2 text-destructive mt-4">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={createKadiPlayer}
            disabled={loading || !formData.name || !formData.selectedArchetype}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 animate-spin" />
                Creating...
              </div>
            ) : (
              "Create Avatar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAvatarModal;
