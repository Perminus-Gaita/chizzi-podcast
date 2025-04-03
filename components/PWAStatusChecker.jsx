import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, AlertCircle, Download } from 'lucide-react';

export default function PWAStatusChecker() {
  const [isClient, setIsClient] = useState(false);
  const [status, setStatus] = useState({
    // We can only reliably detect if we're RUNNING as a PWA
    isStandalone: false,
    // We can reliably detect if installation is possible
    canInstall: false,
    // We can detect if it was just installed in this session
    wasJustInstalled: false,
    notificationPermission: 'default',
    serviceWorkerSupported: false,
    pushManagerSupported: false,
    serviceWorkerRegistered: false
  });
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    setIsClient(true);
    checkPWAStatus();

    // Listen for the beforeinstallprompt event
    const handleInstallPrompt = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setStatus(prev => ({ ...prev, canInstall: true }));
    };

    // Listen for successful installation in current session
    const handleAppInstalled = () => {
      setStatus(prev => ({ ...prev, wasJustInstalled: true, canInstall: false }));
      setDeferredPrompt(null);
      // Store in session storage that we installed in this session
      sessionStorage.setItem('pwaInstalled', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check display mode
    const displayModeQuery = window.matchMedia('(display-mode: standalone)');
    const fullscreenQuery = window.matchMedia('(display-mode: fullscreen)');
    const minimalUiQuery = window.matchMedia('(display-mode: minimal-ui)');

    const handleDisplayModeChange = () => {
      checkStandaloneMode();
    };

    displayModeQuery.addListener(handleDisplayModeChange);
    fullscreenQuery.addListener(handleDisplayModeChange);
    minimalUiQuery.addListener(handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      displayModeQuery.removeListener(handleDisplayModeChange);
      fullscreenQuery.removeListener(handleDisplayModeChange);
      minimalUiQuery.removeListener(handleDisplayModeChange);
    };
  }, []);

  const checkStandaloneMode = () => {
    const isStandalone = (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.navigator.standalone === true
    );

    setStatus(prev => ({ ...prev, isStandalone }));
  };

  const checkPWAStatus = async () => {
    if (typeof window === 'undefined') return;

    try {
      // Check if running in standalone mode
      checkStandaloneMode();

      // Check if we installed in this browser session
      const wasInstalledThisSession = sessionStorage.getItem('pwaInstalled') === 'true';

      // Check service worker and push support
      const serviceWorkerSupported = 'serviceWorker' in navigator;
      const pushManagerSupported = 'PushManager' in window;

      // Check service worker registration
      let serviceWorkerRegistered = false;
      if (serviceWorkerSupported) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        serviceWorkerRegistered = registrations.length > 0;
      }

      // Get notification permission status
      const notificationPermission = Notification.permission;

      setStatus(prev => ({
        ...prev,
        notificationPermission,
        serviceWorkerSupported,
        pushManagerSupported,
        serviceWorkerRegistered
      }));

    } catch (error) {
      console.error('Error checking PWA status:', error);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      
      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null);
      setStatus(prev => ({ ...prev, canInstall: false }));

      // Recheck status after installation attempt
      checkPWAStatus();
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const StatusBadge = ({ isActive, label }) => (
    <Badge variant={isActive ? "default" : "secondary"} className="flex items-center gap-1">
      {isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {label}
    </Badge>
  );

  if (!isClient) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          PWA Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Installation Status</p>
            <div className="space-y-2">
              {/* Current runtime mode - this we can detect reliably */}
              <Badge 
                variant={status.isStandalone ? "default" : "secondary"}
                className="flex items-center gap-1 w-full justify-center"
              >
                {status.isStandalone ? (
                  <>
                    <Check className="w-3 h-3" />
                    Currently running as PWA
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    Running in browser
                  </>
                )}
              </Badge>
              
              {/* Installation status - only reliable within the session it was installed */}
              {status.wasJustInstalled ? (
                <Badge 
                  variant="default"
                  className="flex items-center gap-1 w-full justify-center"
                >
                  <Check className="w-3 h-3" />
                  Installed in this session
                </Badge>
              ) : status.canInstall ? (
                <Badge 
                  variant="secondary"
                  className="flex items-center gap-1 w-full justify-center"
                >
                  <Download className="w-3 h-3" />
                  Available to install
                </Badge>
              ) : (
                <Badge 
                  variant="secondary"
                  className="flex items-center gap-1 w-full justify-center"
                >
                  <AlertCircle className="w-3 h-3" />
                  Installation status unknown
                </Badge>
              )}
              {status.canInstall && (
                <Button 
                  onClick={handleInstallClick}
                  className="w-full flex items-center gap-2"
                  variant="outline"
                >
                  <Download className="w-4 h-4" />
                  Install App
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Notification Permission</p>
            <Badge 
              variant={
                status.notificationPermission === 'granted' ? 'default' : 
                status.notificationPermission === 'denied' ? 'destructive' : 
                'secondary'
              }
              className="flex items-center gap-1"
            >
              {status.notificationPermission === 'granted' && <Check className="w-3 h-3" />}
              {status.notificationPermission === 'denied' && <X className="w-3 h-3" />}
              {status.notificationPermission === 'default' && <AlertCircle className="w-3 h-3" />}
              {status.notificationPermission.charAt(0).toUpperCase() + 
               status.notificationPermission.slice(1)}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Service Worker Support</p>
            <div className="flex flex-col gap-2">
              <StatusBadge 
                isActive={status.serviceWorkerSupported} 
                label="Service Worker API" 
              />
              <StatusBadge 
                isActive={status.pushManagerSupported} 
                label="Push Manager API" 
              />
              <StatusBadge 
                isActive={status.serviceWorkerRegistered} 
                label="Service Worker Registered" 
              />
            </div>
          </div>
        </div>

        {status.canInstall && (
          <p className="text-sm text-muted-foreground mt-4">
            This app can be installed on your device for a better experience.
            Click the Install button above to add it to your device.
          </p>
        )}

        {status.notificationPermission === 'default' && (
          <p className="text-sm text-muted-foreground">
            Notification permissions &apos; been requested yet. Enable notifications
            to receive updates.
          </p>
        )}
      </CardContent>
    </Card>
  );
}