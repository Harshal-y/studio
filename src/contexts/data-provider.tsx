
'use client';

import {
  vitals as initialVitalsData,
  historicalData as initialHistoricalData,
  devices as initialDevices,
} from '@/data/mock-data';
import { VitalsState } from '@/components/vitals-monitor';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
} from 'react';

type Device = {
  id: number;
  name: string;
  type: string;
  batteryLevel: number;
  status: 'Connected' | 'Disconnected';
};

type HistoricalData = {
  date: string;
  heartRate: number;
  oxygenSaturation: number;
  bodyTemperature: number;
};

interface DataContextType {
  devices: Device[];
  vitals: VitalsState | null;
  historicalData: HistoricalData[] | null;
  isConnected: boolean;
  setVitals: React.Dispatch<React.SetStateAction<VitalsState | null>>;
  toggleDeviceConnection: (deviceId: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(
    initialDevices.map((d) => ({ ...d, status: 'Disconnected' }))
  );
  const [vitals, setVitals] = useState<VitalsState | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[] | null>(
    null
  );

  const isConnected = useMemo(
    () => devices.some((d) => d.status === 'Connected'),
    [devices]
  );

  useEffect(() => {
    if (isConnected) {
      // Deep copy to prevent mutation of original mock data
      setVitals(JSON.parse(JSON.stringify(initialVitalsData)));
      setHistoricalData(JSON.parse(JSON.stringify(initialHistoricalData)));
    } else {
      setVitals(null);
      setHistoricalData(null);
    }
  }, [isConnected]);

  const toggleDeviceConnection = (deviceId: number) => {
    setDevices((prevDevices) =>
      prevDevices.map((device) =>
        device.id === deviceId
          ? {
              ...device,
              status:
                device.status === 'Connected' ? 'Disconnected' : 'Connected',
            }
          : device
      )
    );
  };

  const value = {
    devices,
    vitals,
    historicalData,
    isConnected,
    setVitals,
    toggleDeviceConnection,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
