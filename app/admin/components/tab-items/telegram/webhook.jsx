import React, { useState, useEffect } from 'react';
import { Webhook as WebhookIcon, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Webhook = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  const handleSetWebhook = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/telegram/webhook/set-url', {
        method: 'POST', // Changed from GET to POST
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to set webhook URL');
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error('Server returned an invalid response');
        }
      }

      const data = await response.json();
      setSuccess(true);
      setWebhookUrl(data.result?.url || '');
    } catch (err) {
      console.error('Error setting webhook:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch current webhook URL on component mount
  useEffect(() => {
    const fetchWebhookInfo = async () => {
      try {
        const response = await fetch('/api/admin/telegram/webhook/info');
        if (!response.ok) throw new Error('Failed to fetch webhook info');
        const data = await response.json();
        setWebhookUrl(data.result?.url || '');
      } catch (err) {
        console.error('Error fetching webhook info:', err);
      }
    };

    fetchWebhookInfo();
  }, []);

  return (
    <Card className="border-0">
      <CardHeader>
        <div className="flex items-center gap-2">
          <WebhookIcon className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Telegram Webhook</CardTitle>
            <CardDescription>
              Configure the webhook URL for your Telegram bot
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-500/10 border-green-500/20 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Webhook URL set successfully!</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              value={webhookUrl}
              placeholder="Current webhook URL..."
              disabled
            />
            <p className="text-sm text-muted-foreground">
              The webhook URL is automatically configured based on your environment settings.
            </p>
          </div>

          <Button
            onClick={handleSetWebhook}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Webhook...
              </>
            ) : (
              <>
                <WebhookIcon className="mr-2 h-4 w-4" />
                Set Webhook URL
              </>
            )}
          </Button>

          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="text-sm font-medium mb-2">About Webhooks</h4>
            <p className="text-sm text-muted-foreground">
              Webhooks allow your Telegram bot to receive updates about new messages and events.
              The webhook URL should be an HTTPS endpoint that can receive POST requests from Telegram.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Webhook;