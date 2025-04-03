"use client";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const CreateWorkspacePage = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    profilePicture: null,
    filename: null,
  });

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(null);
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file");
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      setFormData((prevData) => ({
        ...prevData,
        profilePicture: base64,
        filename: file.name,
      }));

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setError(null);
    } catch (err) {
      setError("Error processing image. Please try again.");
      console.error("File processing error:", err);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name.trim() || !formData.username.trim()) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/workspace", formData, {
        headers: { 
          "Content-Type": "application/json",
        },
      });

      if (response.data) {
        router.push("/settings?tab=workspaceSettings&section=Invite");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An error occurred while creating the workspace";
      setError(errorMessage);
      console.error("Workspace creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Create New Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <input
                  accept="image/*"
                  id="profilePicture"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Avatar
                  className="w-32 h-32 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AvatarImage
                    src={imagePreview || undefined}
                    alt="Profile picture"
                  />
                  <AvatarFallback>
                    <Camera className="w-12 h-12 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <Label
                  htmlFor="profilePicture"
                  className="cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Choose Profile Picture
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter workspace name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter username"
                />
              </div>

              {error && (
                <div className="text-red-500 p-2 rounded bg-red-50 dark:bg-red-900/10">
                  {error}
                </div>
              )}

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Workspace"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateWorkspacePage;