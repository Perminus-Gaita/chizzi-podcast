import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const ConnectionLoader = ({ state }) => (
  <div className="flex flex-col gap-8" style={{ minHeight: "100vh" }}>
    {/* Connection Status Card */}
    <Card className="mb-6">
      <CardContent className="flex items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div className="space-y-1">
            <p className="font-medium text-sm">{state}</p>
            <p className="text-xs text-muted-foreground">
              Please wait while we connect
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Header Section */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="space-y-2 w-full">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-8 w-24" />
    </div>

    {/* Tabs Loader */}
    <div className="mb-6">
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>

    {/* Match Cards Loader */}
    {[1, 2, 3].map((i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: i * 0.1 }}
        className="w-full mb-4"
      >
        <Card className="relative overflow-hidden dark:bg-gray-800/70">
          <CardContent className="p-4 sm:p-6">
            {/* Match Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>

            {/* Player Information */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 sm:w-40" />
                  <Skeleton className="h-3 w-24 sm:w-32" />
                </div>
              </div>

              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-28 sm:w-36" />
                <Skeleton className="h-3 w-20 sm:w-24" />
              </div>
            </div>

            {/* Game State Indicators */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 bg-muted/30 rounded-lg mb-4">
              {[0, 1, 2].map((j) => (
                <div key={j} className="text-center space-y-1">
                  <Skeleton className="h-3 w-12 mx-auto mb-1" />
                  <Skeleton className="h-4 w-8 mx-auto" />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-9" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ))}
  </div>
);

export default ConnectionLoader;