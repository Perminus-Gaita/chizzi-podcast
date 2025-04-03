'use client';

import { useState, useEffect } from 'react';

function urlBase64ToUint8Array(base64String) {
  try {
    if (!base64String) {
      throw new Error('VAPID key is empty or undefined');
    }
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    console.log('Processed base64:', base64);
    
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

export default function PushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [message, setMessage] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      console.log('Starting service worker registration...');
      
      // Unregister any existing service workers first
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('Existing registrations:', registrations.length);
      for (let reg of registrations) {
        await reg.unregister();
        console.log('Unregistered existing service worker');
      }

      // Register new service worker
      console.log('Registering new service worker...');
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered:', reg);
      
      // Wait for the service worker to be ready
      console.log('Waiting for service worker to be ready...');
      await navigator.serviceWorker.ready;
      console.log('Service worker is ready');
      
      setRegistration(reg);
      
      console.log('Checking for existing subscription...');
      const existingSubscription = await reg.pushManager.getSubscription();
      console.log('Existing subscription:', existingSubscription);
      
      if (existingSubscription) {
        console.log('Found existing subscription, updating state');
        setSubscription(existingSubscription);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      console.error('Full error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  }

  async function subscribeToNotifications() {
    try {
      // Check browser compatibility first
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Workers are not supported');
      }
      if (!('PushManager' in window)) {
        throw new Error('Push notifications are not supported');
      }

      console.log('Button clicked, checking registration:', registration);
      
      if (!registration) {
        console.error('Service Worker not registered yet');
        return;
      }

      // Check service worker state
      console.log('Service Worker state:', registration.active ? 'active' : 'inactive');

      // Unsubscribe from any existing subscriptions
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        console.log('Found existing subscription, unsubscribing...');
        await existingSub.unsubscribe();
        console.log('Successfully unsubscribed from existing subscription');
      }

      // Check and request notification permission
      console.log('Current notification permission:', Notification.permission);
      if (Notification.permission === 'default') {
        console.log('Requesting notification permission...');
        const permission = await Notification.requestPermission();
        console.log('Permission result:', permission);
        if (permission !== 'granted') {
          throw new Error('Permission not granted for notifications');
        }
      } else if (Notification.permission === 'denied') {
        throw new Error('Notification permission was denied');
      }

      // Verify VAPID key
      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        throw new Error('VAPID public key is not set');
      }
      console.log('VAPID key exists:', !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
      console.log('VAPID key length:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.length);

      // Subscribe to push
      console.log('Preparing to subscribe to push manager...');
      
      const applicationServerKey = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
      console.log('Application Server Key (first 10 bytes):', applicationServerKey.slice(0, 10));
      
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      };
      
      console.log('Subscribing with options:', subscribeOptions);
      
      try {
        const sub = await registration.pushManager.subscribe(subscribeOptions);
        console.log('Push subscription successfully created:', sub);

        // Convert the subscription to a plain object
        const subscriptionJson = sub.toJSON();
        console.log('Subscription JSON:', subscriptionJson);

        // Send to server
        console.log('Sending subscription to server...');
        const response = await fetch('/api/push', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscriptionJson)
        });

        console.log('Server response status:', response.status);
        console.log('Server response OK:', response.ok);

        if (response.ok) {
          console.log('Successfully subscribed to push notifications');
          setSubscription(sub);
          setIsSubscribed(true);
        } else {
          const errorText = await response.text();
          throw new Error(`Failed to save subscription on server: ${errorText}`);
        }
      } catch (subscribeError) {
        console.error('Error during push subscription:', subscribeError);
        throw subscribeError;
      }

    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      console.error('Full error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Reset subscription state on error
      setIsSubscribed(false);
      setSubscription(null);

      // Re-throw error to be handled by the UI
      throw error;
    }
  }

  async function sendNotification() {
    if (!message.trim()) return;

    try {
      const response = await fetch('/api/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          message
        })
      });

      if (response.ok) {
        setMessage('');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Only render the component on the client side
  if (!isClient) {
    return null;
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return <div>Push notifications are not supported in this browser.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Push Notifications</h2>
      
      {!isSubscribed ? (
        <button
          onClick={subscribeToNotifications}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!registration}
        >
          Enable Push Notifications
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              className="border p-2 rounded flex-1"
            />
            <button
              onClick={sendNotification}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Send Notification
            </button>
          </div>
        </div>
      )}
    </div>
  );
}