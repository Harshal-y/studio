
import type { User, Doctor, Appointment, Prescription } from '@/contexts/data-provider';

const generateHistoricalData = () =>
  Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().slice(0, 10),
      heartRate: Math.floor(Math.random() * 10) + 65, // 65-75 bpm
      oxygenSaturation: parseFloat((97 + Math.random() * 2).toFixed(1)), // 97-99%
      bodyTemperature: parseFloat((36.5 + Math.random() * 0.5).toFixed(1)), // 36.5-37.0 °C
    };
  });

const baseVitals = {
  heartRate: {
    value: 72,
    unit: 'bpm',
    thresholds: { alert: 100, danger: 120 },
    direction: 'up' as 'up' | 'down',
  },
  oxygenSaturation: {
    value: 98,
    unit: '%',
    thresholds: { alert: 94, danger: 90 },
    direction: 'down' as 'up' | 'down',
  },
  bodyTemperature: {
    value: 36.8,
    unit: '°C',
    thresholds: { alert: 38.0, danger: 39.0 },
    direction: 'up' as 'up' | 'down',
  },
  hydrationLevel: {
    value: 95,
    unit: '%',
    thresholds: { alert: 85, danger: 75 },
    direction: 'down' as 'up' | 'down',
  },
};

export const selfUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@email.com',
  avatar: 'https://picsum.photos/seed/1/100/100',
  isMonitored: false,
  points: 120,
  devices: [
    {
      id: 1,
      name: 'Smartwatch',
      type: 'Watch',
      batteryLevel: 82,
      status: 'Connected',
    },
    {
      id: 2,
      name: 'Health Chain',
      type: 'Chain',
      batteryLevel: 75,
      status: 'Connected',
    },
  ],
  vitals: JSON.parse(JSON.stringify(baseVitals)),
  historicalData: generateHistoricalData(),
};

export const allFamilyMembers: User[] = [
  selfUser,
  {
    id: 2,
    name: 'Jane Doe',
    email: 'jane.doe@email.com',
    avatar: 'https://picsum.photos/seed/2/100/100',
    deviceCode: 'JANE-456',
    isMonitored: true,
    points: 80,
    devices: [
      {
        id: 3,
        name: 'Jane\'s Watch',
        type: 'Watch',
        batteryLevel: 91,
        status: 'Connected',
      },
    ],
    vitals: {
      ...JSON.parse(JSON.stringify(baseVitals)),
      heartRate: { ...baseVitals.heartRate, value: 78 },
    },
    historicalData: generateHistoricalData().map(d => ({...d, heartRate: d.heartRate + 5})),
  },
    {
    id: 3,
    name: 'Junior Doe',
    email: 'junior.doe@email.com',
    avatar: 'https://picsum.photos/seed/3/100/100',
    deviceCode: 'JUNIOR-123',
    isMonitored: false,
    points: 20,
    devices: [
       {
        id: 4,
        name: 'Junior\'s Watch',
        type: 'Watch',
        batteryLevel: 65,
        status: 'Connected',
      },
    ],
    vitals: {
      ...JSON.parse(JSON.stringify(baseVitals)),
      heartRate: { ...baseVitals.heartRate, value: 85 },
      bodyTemperature: { ...baseVitals.bodyTemperature, value: 37.1 },
    },
    historicalData: generateHistoricalData().map(d => ({...d, heartRate: d.heartRate + 15})),
  },
];


export const emergencyContacts = [
  { id: 1, name: 'Dr. Evelyn Reed', phone: '(555) 123-4567' },
  { id: 2, name: 'Alex Miller', phone: '(555) 987-6543' },
];

export const allDoctors: Doctor[] = [
    {
        id: 1,
        name: 'Dr. Emily Carter',
        degree: 'MD, PhD',
        experience: 15,
        isVerified: true,
        specialty: 'Cardiology',
        points: 250,
    },
    {
        id: 2,
        name: 'Dr. Ben Hanson',
        degree: 'MBBS',
        experience: 8,
        isVerified: true,
        specialty: 'Dermatology',
        points: 180,
    }
];

export const userPreferences =
  'I am a 45-year-old male looking to improve my cardiovascular health and manage stress levels. I prefer light to moderate exercise suggestions.';

export const appointments: Appointment[] = [];
export const prescriptions: Prescription[] = [];


// Legacy exports for components that may not be updated yet
export const devices = selfUser.devices;
export const vitals = selfUser.vitals;
export const historicalData = selfUser.historicalData;

// Deprecated: use allFamilyMembers and selfUser
export const users = {
  self: selfUser,
  family: allFamilyMembers,
};

// Deprecated: use allFamilyMembers
export const familyMembers = allFamilyMembers;
