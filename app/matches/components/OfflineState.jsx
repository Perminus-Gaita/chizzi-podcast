import React from "react";
import { WifiOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const OfflineState = () => (
  <Card className="w-full p-8">
    <CardContent className="flex flex-col items-center justify-center space-y-4">
      <WifiOff className="h-12 w-12 text-muted-foreground" />
      <div className="text-center space-y-2">
        <h3 className="font-semibold">You&apos;re Offline</h3>
        <p className="text-sm text-muted-foreground">
          Check your connection and try again
        </p>
      </div>
    </CardContent>
  </Card>
);

export default OfflineState;
