
'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { WifiOff, MessageSquare } from 'lucide-react';
import { useData } from '@/contexts/data-provider';

const SMS_NUMBER = '+15551234567'; // A placeholder number
const SMS_BODY = "Hello, I need a telemedicine consultation. My name is ";

export function OfflineConsultation() {
  const [isOffline, setIsOffline] = useState(false);
  const { currentUser } = useData();

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    // Set initial state
    if (typeof window !== 'undefined') {
        setIsOffline(!window.navigator.onLine);
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleSmsConsultation = () => {
    const userName = currentUser?.name || '[Your Name]';
    const message = `${SMS_BODY}${userName}.`;
    window.location.href = `sms:${SMS_NUMBER}?body=${encodeURIComponent(message)}`;
  }

  if (!isOffline) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <WifiOff className="h-5 w-5 mr-3" />
                <div>
                    <AlertTitle>You are currently offline</AlertTitle>
                    <AlertDescription>
                        Internet connection is not available. You can consult a doctor via SMS.
                    </AlertDescription>
                </div>
            </div>
            <Button variant="secondary" onClick={handleSmsConsultation}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Consult via SMS
            </Button>
        </div>
    </Alert>
  );
}
