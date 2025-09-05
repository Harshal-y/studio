'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/hooks/use-location';
import { emergencyContacts, vitals } from '@/data/mock-data';
import { useEffect, useState } from 'react';

const COUNTDOWN_SECONDS = 120; // 2 minutes

interface EmergencyAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAlertSent: () => void;
  onAlertCancelled: () => void;
  criticalVital: string | null;
  isManualTrigger?: boolean;
}

export function EmergencyAlertDialog({
  open,
  onOpenChange,
  onAlertSent,
  onAlertCancelled,
  criticalVital,
  isManualTrigger = false,
}: EmergencyAlertDialogProps) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const { toast } = useToast();
  const { location, error: locationError } = useLocation();

  useEffect(() => {
    if (open) {
      setCountdown(COUNTDOWN_SECONDS);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleConfirmSend();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [open]);

  const handleConfirmSend = () => {
    if (locationError) {
      toast({
        variant: 'destructive',
        title: 'Error: Could not get location',
        description: locationError,
      });
      onAlertCancelled(); // Close dialog even if there's an error
      return;
    }

    const vitalsSummary = `Heart Rate: ${vitals.heartRate.value}, O2: ${vitals.oxygenSaturation.value}, Temp: ${vitals.bodyTemperature.value}`;
    const locationInfo = location
      ? `at Lat: ${location.latitude.toFixed(
          4
        )}, Lon: ${location.longitude.toFixed(4)}`
      : 'with no location data.';
    
    let description = `Alert sent to emergency contacts with vitals (${vitalsSummary}) ${locationInfo}`;
    if(criticalVital) {
        description = `Critical condition detected: ${criticalVital}. ` + description;
    }


    toast({
      title: 'Emergency Alert Sent',
      description: description,
    });
    onAlertSent();
  };

  const handleCancel = () => {
    onAlertCancelled();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isManualTrigger
              ? 'Confirm Emergency Alert'
              : 'Critical Alert Detected!'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isManualTrigger
              ? 'An emergency alert will be sent to your contacts with your current vitals and location.'
              : `A critical vital sign has been detected (${
                  criticalVital || 'N/A'
                }). An alert will be sent automatically.`}
            <div className="text-center text-6xl font-bold my-4 text-destructive">
              {formatTime(countdown)}
            </div>
            Unless you cancel, an alert will be sent to your emergency contacts.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={handleCancel}>
              Cancel Alert
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleConfirmSend}>
              Send Alert Now
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
