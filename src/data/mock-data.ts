export const historicalData = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  return {
    date: date.toISOString().slice(0, 10),
    heartRate: Math.floor(Math.random() * 20) + 65, // 65-85 bpm
    oxygenSaturation: parseFloat((96 + Math.random() * 3).toFixed(1)), // 96-99%
    bodyTemperature: parseFloat((36.5 + Math.random() * 1).toFixed(1)), // 36.5-37.5 °C
  };
});

export const devices = [
  {
    id: 1,
    name: 'CardioWatch 5',
    type: 'Smartwatch',
    batteryLevel: 82,
    status: 'Connected',
  },
  {
    id: 2,
    name: 'Respira-Monitor',
    type: 'Heart Monitor',
    batteryLevel: 55,
    status: 'Connected',
  },
  {
    id: 3,
    name: 'FitBand Pro',
    type: 'Wristband',
    batteryLevel: 91,
    status: 'Connected',
  },
  {
    id: 4,
    name: 'HealthChain',
    type: 'Chain',
    batteryLevel: 75,
    status: 'Connected',
  },
];

export const emergencyContacts = [
  { id: 1, name: 'Dr. Evelyn Reed', phone: '(555) 123-4567' },
  { id: 2, name: 'Alex Miller', phone: '(555) 987-6543' },
];

export const vitals = {
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

export const userPreferences =
  'I am a 45-year-old male looking to improve my cardiovascular health and manage stress levels. I prefer light to moderate exercise suggestions.';
