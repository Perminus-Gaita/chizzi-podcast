"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Pencil, Upload, Trash2, Plus } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image"; // Add this import

const SOCIAL_PLATFORMS = [
  "X",
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
  "telegram",
  "discord",
];

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(40, "Name must be 40 characters or less"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(40, "Username must be 40 characters or less"),
  profilePicture: z.string().optional(),
  bannerImage: z.string().optional(),
  socialLinks: z
    .array(
      z.object({
        platform: z.string().min(1, "Platform is required"),
        link: z.string().url("Invalid URL"),
      })
    )
    .optional()
    .default([]),
});

const EditProfileModal = ({ user, onClose, onProfileUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [previewProfilePicture, setPreviewProfilePicture] = useState(
    user?.avatar
  );
  const [previewBannerImage, setPreviewBannerImage] = useState(
    user?.headerImage
  );

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.displayName || "",
      username: user?.username || "",
      profilePicture: user?.avatar || "",
      bannerImage: user?.headerImage || "",
      socialLinks:
        user?.socials?.map((social) => ({
          platform: social.platform,
          link: social.link,
        })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewProfilePicture(reader.result);
        form.setValue("profilePicture", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewBannerImage(reader.result);
        form.setValue("bannerImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const transformedData = {
        name: data.name,
        username: data.username,
        profilePicture: data.profilePicture,
        bannerImage: data.bannerImage,
        socialLinks: data.socialLinks
          .filter((link) => link.platform && link.link)
          .map((link) => ({
            platform: link.platform,
            link: link.link,
          })),
      };

      const response = await fetch(`/api/${user.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile");
      }

      if (response.status === 409) {
        setError("Username is already taken");
        return;
      }

      if (response.status === 403) {
        setError("You do not have permission to edit this profile");
        return;
      }

      onProfileUpdate({
        ...transformedData,
        hasUsernameChanged: data.username !== user.username,
        previousUsername: user.username,
      });

      onClose();
    } catch (error) {
      setError(error.message || "An error occurred while updating the profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-11/12 md:max-w-[80%] lg:max-w-[60%] h-[90vh] sm:h-[85vh] bg-light dark:bg-dark">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="px-4 py-2 mb-4 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded">
            {error}
          </div>
        )}

        <ScrollArea className="flex-grow px-2 md:px-6 py-4 bg-tertiary/5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Banner Image Upload */}
              <div className="relative h-48 w-full bg-muted">
                {previewBannerImage && (
                  <Image
                    src={previewBannerImage}
                    alt="Banner"
                    width={1920}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-2 right-2">
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="bannerUpload"
                    onChange={handleBannerImageUpload}
                  />
                  <label
                    htmlFor="bannerUpload"
                    className="cursor-pointer bg-light/70 dark:bg-dark/70 p-2 rounded-full hover:bg-light/90 dark:hover:bg-dark/90"
                  >
                    <Upload className="w-5 h-5" />
                  </label>
                </div>
              </div>

              {/* Profile Picture */}
              <div className="flex items-center space-x-4 -mt-16 ml-4">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-light dark:border-dark">
                    <AvatarImage
                      src={previewProfilePicture}
                      alt="Profile Picture"
                    />
                    <AvatarFallback>{user?.username[0]}</AvatarFallback>
                  </Avatar>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="profilePictureUpload"
                    onChange={handleProfilePictureUpload}
                  />
                  <label
                    htmlFor="profilePictureUpload"
                    className="absolute bottom-0 right-0 bg-light dark:bg-dark p-1 rounded-full cursor-pointer hover:bg-accent"
                  >
                    <Pencil className="w-4 h-4" />
                  </label>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4 px-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Choose a username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Social Links */}
                <div>
                  <FormLabel className="mb-2 block">Social Links</FormLabel>
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <FormField
                        control={form.control}
                        name={`socialLinks.${index}.platform`}
                        render={({ field: selectField }) => (
                          <FormItem className="w-1/3">
                            <Select
                              onValueChange={selectField.onChange}
                              defaultValue={selectField.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Platform" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SOCIAL_PLATFORMS.map((platform) => (
                                  <SelectItem key={platform} value={platform}>
                                    {platform}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`socialLinks.${index}.link`}
                        render={({ field: linkField }) => (
                          <FormItem className="flex-grow">
                            <FormControl>
                              <Input placeholder="https://" {...linkField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  {fields.length < 10 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({ platform: "", link: "" })}
                      className="mt-2"
                    >
                      <Plus className="mr-2 w-4 h-4" /> Add Social Link
                    </Button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 px-4 pb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
