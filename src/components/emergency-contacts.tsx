'use client';

import { Siren, User } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/hooks/use-location';
import { emergencyContacts, vitals } from '@/data/mock-data';
import { useState } from 'react';
import { EmergencyAlertDialog } from './emergency-alert-dialog';

export function EmergencyContacts() {
  const [isManualAlert, setIsManualAlert] = useState(false);
  const { toast } = useToast();
  const { location, error: locationError } = useLocation();

  const handleSendAlert = () => {
    if (locationError) {
      toast({
        variant: 'destructive',
        title: 'Error: Could not get location',
        description: locationError,
      });
      return;
    }
    const vitalsSummary = `Heart Rate: ${vitals.heartRate.value}, O2: ${vitals.oxygenSaturation.value}, Temp: ${vitals.bodyTemperature.value}`;
    const locationInfo = location
      ? `at Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(
          4
        )}`
      : 'with no location data.';

    toast({
      title: 'Emergency Alert Sent',
      description: `Alert sent to emergency contacts with vitals (${vitalsSummary}) ${locationInfo}`,
    });
    setIsManualAlert(false);
  };


  return (
    <>
      <EmergencyAlertDialog
        open={isManualAlert}
        onOpenChange={setIsManualAlert}
        onAlertSent={handleSendAlert}
        onAlertCancelled={() => setIsManualAlert(false)}
        criticalVital={null}
        isManualTrigger={true}
      />
      <Card className="flex-1 backdrop-blur-sm bg-background/60 dark:bg-black/60">
        <CardHeader>
          <CardTitle>Emergency</CardTitle>
          <CardDescription>
            Alert your contacts in case of an emergency.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {emergencyContacts.map((contact) => (
            <div key={contact.id} className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted">
                <User className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">{contact.phone}</p>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setIsManualAlert(true)}
          >
            <Siren className="mr-2 h-4 w-4" />
            Send Emergency Alert
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
