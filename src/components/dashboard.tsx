
'use client';

import { DeviceManager } from './device-manager';
import { EmergencyContacts } from './emergency-contacts';
import { HealthInsights } from './health-insights';
import { HistoricalChart } from './historical-chart';
import { TrendAnalysis } from './trend-analysis';
import { VitalsMonitor } from './vitals-monitor';
import { useData } from '@/contexts/data-provider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Activity } from 'lucide-react';
import { OfflineConsultation } from './offline-consultation';

export function Dashboard() {
  const { isConnected } = useData();

  if (!isConnected) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <div className="lg:col-span-4">
            <OfflineConsultation />
        </div>
        <div className="col-span-1 lg:col-span-1">
          <DeviceManager />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <Card className="h-full flex items-center justify-center backdrop-blur-sm bg-background/60 dark:bg-black/60">
            <CardHeader className="text-center">
              <Activity className="size-12 mx-auto text-muted-foreground" />
              <CardTitle className="mt-4">Connect a device</CardTitle>
              <CardContent>
                <p className="text-muted-foreground">
                  Please connect a device to start monitoring your vitals.
                </p>
              </CardContent>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <div className="lg:col-span-4">
            <OfflineConsultation />
        </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-4">
        <VitalsMonitor />
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <HistoricalChart />
      </div>
      <div className="col-span-1 flex flex-col gap-4 md:gap-8">
        <DeviceManager />
        <EmergencyContacts />
      </div>
      <div className="col-span-1 md:col-span-1 lg:col-span-2">
        <HealthInsights />
      </div>
      <div className="col-span-1 md:col-span-1 lg:col-span-2">
        <TrendAnalysis />
      </div>
    </div>
    </>
  );
}
