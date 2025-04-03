import React from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ErrorState = ({ error, retry }) => (
  <Card className="w-full p-8">
    <CardContent className="flex flex-col items-center justify-center space-y-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div className="text-center space-y-2">
        <h3 className="font-semibold">Unable to Load Matches</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={retry} className="mt-4">
          Try Again
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default ErrorState;
