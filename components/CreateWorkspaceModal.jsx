"use client";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useRouter } from 'next/navigation'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

const CreateWorkspaceModal = ({ isWorkspace, handleCloseWorkspace }) => {
  const userProfile = useSelector((state) => state.auth.profile);
  const router = useRouter();

  const [workspaceName, setWorkspaceName] = useState("");
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
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await convertToBase64(file);
      setFormData((prevData) => ({
        ...prevData,
        profilePicture: base64,
        filename: file.name,
      }));

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
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
    setError("");

    try {
      const response = await axios.post("/api/workspace", formData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Response:", response.data);

      if (response.status === 200) {
        router.push("/workspace/invite");
      }
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "An error occurred while creating the workspace"
      );
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

  // useEffect(() => {
  //   if (!workspaceName) {
  //     const defaultName = `workspace-${userProfile?.workspaces?.length + 1}`;
  //     setWorkspaceName(defaultName);
  //   }
  // }, [isWorkspace, workspaceName]);

  return (
    <Dialog open={isWorkspace} onOpenChange={handleCloseWorkspace}>
      <DialogContent className="w-11/12 md:max-w-[80%] h-[85vh] bg-light dark:bg-dark">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center text-2xl font-bold">
            New Workspace
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(100%-4rem)] pr-4 mt-4">
          <form onSubmit={handleSubmit} className="space-y-6 pr-6">
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

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Workspace"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspaceModal;
