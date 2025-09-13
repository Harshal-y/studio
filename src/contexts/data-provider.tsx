
'use client';

import {
  users,
  familyMembers
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

type User = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  devices: Device[];
  vitals: VitalsState;
  historicalData: HistoricalData[];
};

interface DataContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  devices: Device[];
  vitals: VitalsState | null;
  historicalData: HistoricalData[] | null;
  isConnected: boolean;
  setVitals: React.Dispatch<React.SetStateAction<VitalsState | null>>;
  toggleDeviceConnection: (deviceId: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(users.self);
  const [devices, setDevices] = useState<Device[]>([]);
  const [vitals, setVitals] = useState<VitalsState | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[] | null>(
    null
  );

  useEffect(() => {
    if (currentUser) {
      const initialDevices = currentUser.devices.map((d) => ({
        ...d,
        status: 'Disconnected' as 'Disconnected',
      }));
      setDevices(initialDevices);
    }
  }, [currentUser]);

  const isConnected = useMemo(
    () => devices.some((d) => d.status === 'Connected'),
    [devices]
  );

  useEffect(() => {
    if (isConnected && currentUser) {
      // Deep copy to prevent mutation of original mock data
      setVitals(JSON.parse(JSON.stringify(currentUser.vitals)));
      setHistoricalData(JSON.parse(JSON.stringify(currentUser.historicalData)));
    } else {
      setVitals(null);
      setHistoricalData(null);
    }
  }, [isConnected, currentUser]);

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
    currentUser,
    setCurrentUser,
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
