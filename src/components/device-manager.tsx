'use client';

import { Link2, MonitorSmartphone, Watch } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { devices } from '@/data/mock-data';

export function DeviceManager() {
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Smartwatch':
        return <Watch className="size-6 text-muted-foreground" />;
      case 'Heart Monitor':
        return <MonitorSmartphone className="size-6 text-muted-foreground" />;
      case 'Wristband':
        return <Watch className="size-6 text-muted-foreground" />;
      case 'Chain':
        return <Link2 className="size-6 text-muted-foreground" />;
      default:
        return <Watch className="size-6 text-muted-foreground" />;
    }
  };

  return (
    <Card className="flex-1 backdrop-blur-sm bg-background/60 dark:bg-black/60">
      <CardHeader>
        <CardTitle>Device Management</CardTitle>
        <CardDescription>Monitor your connected devices</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {devices.map((device) => (
          <div key={device.id} className="flex items-center gap-4">
            {getDeviceIcon(device.type)}
            <div className="flex-1">
              <p className="font-medium">{device.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {device.status === 'Connected' ? 'Connected' : 'Disconnected'}
                </span>
                <span
                  className={`size-2 rounded-full ${
                    device.status === 'Connected'
                      ? 'bg-green-500'
                      : 'bg-destructive'
                  }`}
                />
              </div>
            </div>
            <div className="w-24">
              <Progress
                value={device.batteryLevel}
                aria-label={`${device.batteryLevel}% battery`}
              />
              <p className="text-xs text-center text-muted-foreground mt-1">
                {device.batteryLevel}%
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
