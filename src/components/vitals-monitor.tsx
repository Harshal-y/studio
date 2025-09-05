'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { vitals as initialVitals } from '@/data/mock-data';
import { cn } from '@/lib/utils';
import {
  Droplets,
  Heart,
  HeartPulse,
  Thermometer,
  Waves,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { EmergencyAlertDialog } from './emergency-alert-dialog';

type Vital = {
  value: number;
  unit: string;
  thresholds: { alert: number; danger: number };
  direction: 'up' | 'down';
};

type VitalsState = {
  heartRate: Vital;
  oxygenSaturation: Vital;
  bodyTemperature: Vital;
  hydrationLevel: Vital;
};

const iconMap = {
  heartRate: {
    normal: Heart,
    alert: HeartPulse,
    danger: HeartPulse,
  },
  oxygenSaturation: { normal: Waves, alert: Waves, danger: Waves },
  bodyTemperature: {
    normal: Thermometer,
    alert: Thermometer,
    danger: Thermometer,
  },
  hydrationLevel: { normal: Droplets, alert: Droplets, danger: Droplets },
};
const nameMap: Record<keyof VitalsState, string> = {
  heartRate: 'Heart Rate',
  oxygenSaturation: 'Oxygen Saturation',
  bodyTemperature: 'Body Temperature',
  hydrationLevel: 'Hydration',
};

export function VitalsMonitor() {
  const [vitals, setVitals] = useState<VitalsState>(initialVitals);
  const [isEmergency, setIsEmergency] = useState(false);
  const [criticalVital, setCriticalVital] = useState<string | null>(null);

  const getStatus = (
    value: number,
    thresholds: { alert: number; danger: number },
    direction: 'up' | 'down'
  ): 'normal' | 'alert' | 'danger' => {
    if (direction === 'up') {
      if (value >= thresholds.danger) return 'danger';
      if (value >= thresholds.alert) return 'alert';
    } else {
      if (value <= thresholds.danger) return 'danger';
      if (value <= thresholds.alert) return 'alert';
    }
    return 'normal';
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setVitals((prevVitals) => {
        const newVitals = { ...prevVitals };
        let criticalConditionDetected = false;
        let vitalInDanger: string | null = null;

        (Object.keys(newVitals) as Array<keyof VitalsState>).forEach((key) => {
          const vital = newVitals[key];
          let newValue =
            vital.value +
            (Math.random() - 0.4) *
              (key === 'heartRate' ? 2 : key === 'bodyTemperature' ? 0.2 : 0.5);

          if (key === 'heartRate') newValue = Math.round(newValue);
          else newValue = parseFloat(newValue.toFixed(1));
          
          if (newValue < 40) newValue = 40;
          if (newValue > 180 && key === 'heartRate') newValue = 180;
          if (newValue > 100 && key === 'oxygenSaturation') newValue = 100;

          newVitals[key] = { ...vital, value: newValue };

          const status = getStatus(newValue, vital.thresholds, vital.direction);
          if (status === 'danger') {
            criticalConditionDetected = true;
            vitalInDanger = `${nameMap[key]} is ${newValue}${vital.unit}`;
          }
        });

        if (criticalConditionDetected && !isEmergency) {
          setIsEmergency(true);
          setCriticalVital(vitalInDanger);
        }

        return newVitals;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isEmergency]);

  const statusClasses = {
    normal: 'text-green-400',
    alert: 'text-yellow-400',
    danger: 'text-red-500',
  };

  const renderVital = (key: keyof VitalsState) => {
    const vital = vitals[key];
    const status = getStatus(vital.value, vital.thresholds, vital.direction);
    const Icon = iconMap[key][status] || iconMap[key]['normal'];

    return (
      <div
        key={key}
        className="flex items-center gap-4 rounded-lg p-4 transition-colors duration-300"
      >
        <div className={cn('relative transition-all', statusClasses[status])}>
          <Icon className="size-8" />
          {status !== 'normal' && (
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span
                className={cn(
                  'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                  status === 'alert' ? 'bg-yellow-400' : 'bg-red-400'
                )}
              ></span>
              <span
                className={cn(
                  'relative inline-flex rounded-full h-3 w-3',
                  status === 'alert' ? 'bg-yellow-500' : 'bg-red-500'
                )}
              ></span>
            </span>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{nameMap[key]}</p>
          <p className="text-2xl font-bold">
            {vital.value}
            <span className="text-base font-medium text-muted-foreground">
              {' '}
              {vital.unit}
            </span>
          </p>
        </div>
      </div>
    );
  };

  const onAlertSent = () => {
    setIsEmergency(false);
    setCriticalVital(null);
  }

  const onAlertCancelled = () => {
    setIsEmergency(false);
    setCriticalVital(null);
  }

  return (
    <>
      <EmergencyAlertDialog
        open={isEmergency}
        onOpenChange={setIsEmergency}
        onAlertSent={onAlertSent}
        onAlertCancelled={onAlertCancelled}
        criticalVital={criticalVital}
      />
      <Card className="backdrop-blur-sm bg-background/60 dark:bg-black/60">
        <CardHeader>
          <CardTitle>Live Vitals</CardTitle>
          <CardDescription>
            Real-time data from your connected devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Object.keys(vitals).map((key) =>
              renderVital(key as keyof VitalsState)
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
