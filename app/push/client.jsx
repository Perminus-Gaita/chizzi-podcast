"use client";
import React from 'react';

import PushNotifications from '@/components/PushNotifications';
import PWAStatusChecker from '@/components/PWAStatusChecker';

export default function Push() {
  return (
    <>
      <PushNotifications />
      <PWAStatusChecker />
    </>
  );
}
