import React, { useState, useEffect } from 'react';
import { Bell, BellOff, AlertCircle, Check, Info, Settings2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

function urlBase64ToUint8Array(base64String) {
  try {
    if (!base64String) {
      throw new Error('VAPID key is empty or undefined');
    }
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  } catch (error) {
    console.error('Error converting VAPID key:', error);
    throw error;
  }
}

const NotificationSettings = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const checkNotificationStatus = async () => {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          setIsSupported(false);
          return;
        }

        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          setRegistration(reg);
          const subscription = await reg.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        }
      } catch (err) {
        console.error('Error checking notification status:', err);
        setError('Failed to check notification status');
      } finally {
        setIsLoading(false);
      }
    };

    checkNotificationStatus();
  }, []);

  const handleToggleNotifications = async (enabled) => {
    try {
      setError(null);
      setIsLoading(true);

      if (enabled) {
        // Register service worker if not registered
        if (!registration) {
          const reg = await navigator.serviceWorker.register('/sw.js');
          await navigator.serviceWorker.ready;
          setRegistration(reg);
        }

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Notification permission denied');
        }

        // Subscribe to push notifications
        const applicationServerKey = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });

        // Send subscription to server
        const response = await fetch('/api/push', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription.toJSON())
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to save subscription on server');
        }

        setIsSubscribed(true);
      } else {
        // Unsubscribe from push notifications
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          
          // Notify server about unsubscription
          const response = await fetch('/api/push', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ endpoint: subscription.endpoint })
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to remove subscription from server');
          }
        }
        setIsSubscribed(false);
      }
    } catch (err) {
      console.error('Error toggling notifications:', err);
      setError(err.message);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="border-0">
        <CardHeader>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Push notifications are not supported in your browser.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0" style={{minHeight: "410px"}}>
      <CardHeader className="text-center">
        <CardDescription>Manage your notification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-0">
        <div className="flex items-center justify-between py-4 px-6 border-b border-grey-800">
          <div className="flex items-center space-x-4">
            {isSubscribed ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium leading-none">
                  Push Notifications
                </h4>
                {error ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-red-500 font-medium">Error enabling</span>
                    <button 
                      onClick={() => setShowErrorModal(true)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                ) : isSubscribed ? (
                  <span className="text-sm text-green-500 font-medium">Enabled</span>
                ) : (
                  <span className="text-sm text-orange-500 font-medium">Not enabled</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Receive notifications about important updates and activities
              </p>
            </div>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggleNotifications}
            disabled={isLoading}
          />
        </div>

        {/* Loading state indicator */}
        {isLoading && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </CardContent>

      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Notification Error
            </DialogTitle>
            <DialogDescription className="space-y-4">
              <p>{error}</p>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                <p className="text-sm">If you&apos;re having trouble enabling notifications, please check if Google services for push messaging is enabled in your browser&apos;s settings.</p>
                <div className="border rounded-md p-4 bg-background">
                  <p className="font-medium mb-2">How to enable push notifications:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Copy this URL: <code className="bg-muted px-2 py-1 rounded">chrome://settings/privacy</code></li>
                    <li>Paste it in a new Chrome tab</li>
                    <li>Scroll down to &quot;Privacy and security&quot;</li>
                    <li>Find and enable &quot;Use Google services for push messaging&quot;</li>
                  </ol>
                </div>
                <div className="border rounded-md p-4 bg-background">
                  <p className="font-medium mb-2">Alternative method:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Open Chrome settings</li>
                    <li>Click on &quot;Privacy and security&quot;</li>
                    <li>Under &quot;Privacy and security&quot;, find &quot;Site Settings&quot;</li>
                    <li>Find &quot;Additional permissions&quot;</li>
                    <li>Look for &quot;Use Google services for push messaging&quot;</li>
                  </ol>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default NotificationSettings;