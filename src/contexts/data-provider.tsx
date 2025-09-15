

'use client';

import { allFamilyMembers, selfUser as defaultSelfUser, allDoctors, appointments as mockAppointments } from '@/data/mock-data';
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

export type User = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  deviceCode?: string;
  devices: Device[];
  vitals: VitalsState;
  historicalData: HistoricalData[];
  isMonitored?: boolean;
};

export type Doctor = {
    id: number;
    name: string;
    degree: string;
    experience: number;
    isVerified: boolean;
    verificationDetails?: any;
    specialty?: string;
};

export type Appointment = {
    id: number;
    doctorId: number;
    doctorName: string;
    date: string;
    time: string;
    patientName: string;
    issue: string;
};

interface DataContextType {
  currentUser: User | null;
  selfUser: User | null;
  setCurrentUser: (user: User) => void;
  familyMembers: User[];
  addFamilyMember: (member: User) => void;
  allUsers: User[];
  toggleMonitoring: (userId: number) => void;
  devices: Device[];
  vitals: VitalsState | null;
  historicalData: HistoricalData[] | null;
  isConnected: boolean;
  setVitals: React.Dispatch<React.SetStateAction<VitalsState | null>>;
  toggleDeviceConnection: (deviceId: number) => void;
  doctors: Doctor[];
  addDoctor: (doctor: Doctor) => void;
  currentDoctor: Doctor | null;
  updateCurrentDoctor: (doctor: Partial<Doctor>) => void;
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  isChatbotOpen: boolean;
  setChatbotOpen: (open: boolean) => void;
  isAppointmentChatbotOpen: boolean;
  setAppointmentChatbotOpen: (open: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [selfUser, setSelfUser] = useState<User | null>(defaultSelfUser);
  const [currentUser, setCurrentUser] = useState<User | null>(defaultSelfUser);
  const [familyMembers, setFamilyMembers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>(allFamilyMembers);
  const [devices, setDevices] = useState<Device[]>([]);
  const [vitals, setVitals] = useState<VitalsState | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[] | null>(
    null
  );
  const [doctors, setDoctors] = useState<Doctor[]>(allDoctors);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(allDoctors[0] || null);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [isChatbotOpen, setChatbotOpen] = useState(false);
  const [isAppointmentChatbotOpen, setAppointmentChatbotOpen] = useState(false);


   useEffect(() => {
    if (typeof window !== 'undefined') {
      const deviceCode = localStorage.getItem('deviceCode');
      const newUserRaw = localStorage.getItem('newUser');
      
      if (deviceCode && newUserRaw && selfUser) {
        const newUserDetails = JSON.parse(newUserRaw);
        const updatedSelfUser = {
          ...selfUser,
          name: newUserDetails.name,
          email: newUserDetails.email,
          deviceCode: deviceCode,
        };
        setSelfUser(updatedSelfUser);
        setCurrentUser(updatedSelfUser);
        
        // Clean up localStorage
        localStorage.removeItem('deviceCode');
        localStorage.removeItem('newUser');
      }
    }
    // Initialize family members with selfUser
    if(selfUser) {
      setFamilyMembers([selfUser]);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      // Set devices for the current user, initially all disconnected
      const initialDevices = currentUser.devices.map((d) => ({
        ...d,
        status: 'Disconnected' as 'Disconnected',
      }));
      setDevices(initialDevices);
       // When user switches, disconnect all devices
      setVitals(null);
      setHistoricalData(null);
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
  
  const addFamilyMember = (member: User) => {
    if (!familyMembers.some(m => m.id === member.id)) {
      setFamilyMembers(prev => [...prev, member]);
    }
     if (!allUsers.some(m => m.id === member.id)) {
      setAllUsers(prev => [...prev, member]);
    }
  };

  const addDoctor = (doctor: Doctor) => {
    if (!doctors.some(d => d.name === doctor.name)) {
        setDoctors(prev => [...prev, doctor]);
    }
  }
  
  const addAppointment = (appointment: Appointment) => {
      setAppointments(prev => [...prev, appointment]);
  }

  const toggleMonitoring = (userId: number) => {
    setAllUsers(prevUsers => 
        prevUsers.map(user => 
            user.id === userId ? { ...user, isMonitored: !user.isMonitored } : user
        )
    )
  }

  const updateCurrentDoctor = (doctorUpdate: Partial<Doctor>) => {
    if (currentDoctor) {
        setCurrentDoctor(prev => prev ? { ...prev, ...doctorUpdate } : null);
        setDoctors(prevDocs => prevDocs.map(d => d.id === currentDoctor.id ? { ...d, ...doctorUpdate } : d));
    }
  }

  const value = {
    currentUser,
    selfUser,
    setCurrentUser,
    familyMembers,
    addFamilyMember,
    allUsers,
    toggleMonitoring,
    devices,
    vitals,
    historicalData,
    isConnected,
    setVitals,
    toggleDeviceConnection,
    doctors,
    addDoctor,
    currentDoctor,
    updateCurrentDoctor,
    appointments,
    addAppointment,
    isChatbotOpen,
    setChatbotOpen,
    isAppointmentChatbotOpen,
    setAppointmentChatbotOpen
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
