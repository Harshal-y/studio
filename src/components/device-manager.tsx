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
import { useData } from '@/contexts/data-provider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

export function DeviceManager() {
  const { devices, toggleDeviceConnection } = useData();

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
      <CardContent className="flex flex-col gap-6">
        {devices.map((device) => (
          <div key={device.id} className="flex items-center gap-4">
            {getDeviceIcon(device.type)}
            <div className="flex-1">
              <p className="font-medium">{device.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <p>{device.status}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24">
                <Progress
                  value={device.batteryLevel}
                  aria-label={`${device.batteryLevel}% battery`}
                />
                <p className="text-xs text-center text-muted-foreground mt-1">
                  {device.batteryLevel}%
                </p>
              </div>
              <Switch
                id={`device-toggle-${device.id}`}
                checked={device.status === 'Connected'}
                onCheckedChange={() => toggleDeviceConnection(device.id)}
                aria-label={`Toggle connection for ${device.name}`}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
