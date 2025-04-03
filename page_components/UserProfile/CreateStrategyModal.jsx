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
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Swords,
  Shield,
  Crown,
  Gamepad2,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";

const CreateStrategyModal = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Strategy core data
  const [name, setName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("balanced");

  // Strategy weights
  const [weights, setWeights] = useState({
    offensive: 0.33,
    defensive: 0.33,
    control: 0.34,
  });

  // Personality traits
  const [traits, setTraits] = useState({
    riskTolerance: 0.5,
    specialCardUsage: 0.5,
    multiCardPreference: 0.5,
    suitControlPriority: 0.5,
  });

  const templates = [
    {
      id: "aggressive",
      name: "Aggressive",
      icon: <Swords className="w-5 h-5" />,
      description: "Focuses on rapid hand reduction and offensive plays",
      weights: { offensive: 0.6, defensive: 0.2, control: 0.2 },
      traits: {
        riskTolerance: 0.8,
        specialCardUsage: 0.7,
        multiCardPreference: 0.6,
        suitControlPriority: 0.4,
      },
    },
    {
      id: "defensive",
      name: "Defensive",
      icon: <Shield className="w-5 h-5" />,
      description: "Prioritizes safe plays and penalty avoidance",
      weights: { offensive: 0.2, defensive: 0.6, control: 0.2 },
      traits: {
        riskTolerance: 0.3,
        specialCardUsage: 0.4,
        multiCardPreference: 0.3,
        suitControlPriority: 0.7,
      },
    },
    {
      id: "control",
      name: "Control",
      icon: <Crown className="w-5 h-5" />,
      description: "Masters suit control and strategic card sequences",
      weights: { offensive: 0.2, defensive: 0.2, control: 0.6 },
      traits: {
        riskTolerance: 0.5,
        specialCardUsage: 0.6,
        multiCardPreference: 0.4,
        suitControlPriority: 0.8,
      },
    },
    {
      id: "balanced",
      name: "Balanced",
      icon: <Brain className="w-5 h-5" />,
      description: "Adapts play style based on game situation",
      weights: { offensive: 0.33, defensive: 0.33, control: 0.34 },
      traits: {
        riskTolerance: 0.5,
        specialCardUsage: 0.5,
        multiCardPreference: 0.5,
        suitControlPriority: 0.5,
      },
    },
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
    setWeights(template.weights);
    setTraits(template.traits);
  };

  const updateWeight = (key, value) => {
    const newWeights = { ...weights, [key]: value };
    // Ensure weights sum to 1
    const total = Object.values(newWeights).reduce((a, b) => a + b, 0);
    const normalizedWeights = Object.fromEntries(
      Object.entries(newWeights).map(([k, v]) => [k, v / total])
    );
    setWeights(normalizedWeights);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/cards/kadistrategy/create", {
        name,
        template: selectedTemplate,
        weights,
        traits,
        makeActive: true, // Automatically make this the active strategy
      });

      if (response.status === 201) {
        onSuccess?.(response.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create strategy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-11/12 md:max-w-[80%] lg:max-w-[60%] h-[90vh] sm:h-[85vh] bg-light dark:bg-dark">
        <DialogHeader>
          <DialogTitle>Create New Kadi Strategy</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="template" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="weights">Weights</TabsTrigger>
            <TabsTrigger value="traits">Traits</TabsTrigger>
          </TabsList>

          <TabsContent value="template">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Strategy Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Strategy"
                />
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-1 gap-4">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? "border-primary"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardHeader className="flex flex-row items-center gap-4">
                        {template.icon}
                        <div>
                          <CardTitle className="text-lg">
                            {template.name}
                          </CardTitle>
                          <CardDescription>
                            {template.description}
                          </CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="weights">
            <Card>
              <CardHeader>
                <CardTitle>Strategy Weights</CardTitle>
                <CardDescription>
                  Adjust how your AI prioritizes different aspects of the game
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>
                    Offensive ({Math.round(weights.offensive * 100)}%)
                  </Label>
                  <Slider
                    value={[weights.offensive * 100]}
                    onValueChange={(value) =>
                      updateWeight("offensive", value[0] / 100)
                    }
                    max={100}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Defensive ({Math.round(weights.defensive * 100)}%)
                  </Label>
                  <Slider
                    value={[weights.defensive * 100]}
                    onValueChange={(value) =>
                      updateWeight("defensive", value[0] / 100)
                    }
                    max={100}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Control ({Math.round(weights.control * 100)}%)</Label>
                  <Slider
                    value={[weights.control * 100]}
                    onValueChange={(value) =>
                      updateWeight("control", value[0] / 100)
                    }
                    max={100}
                    step={1}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traits">
            <Card>
              <CardHeader>
                <CardTitle>Personality Traits</CardTitle>
                <CardDescription>
                  Fine-tune your AI's decision-making style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(traits).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()} (
                      {Math.round(value * 100)}%)
                    </Label>
                    <Slider
                      value={[value * 100]}
                      onValueChange={(newValue) =>
                        setTraits((prev) => ({
                          ...prev,
                          [key]: newValue[0] / 100,
                        }))
                      }
                      max={100}
                      step={1}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name || loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 animate-spin" />
                Creating...
              </div>
            ) : (
              "Create Strategy"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStrategyModal;
