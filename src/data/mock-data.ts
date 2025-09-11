export const historicalData = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  return {
    date: date.toISOString().slice(0, 10),
    heartRate: Math.floor(Math.random() * 10) + 65, // 65-75 bpm
    oxygenSaturation: parseFloat((97 + Math.random() * 2).toFixed(1)), // 97-99%
    bodyTemperature: parseFloat((36.5 + Math.random() * 0.5).toFixed(1)), // 36.5-37.0 °C
  };
});

export const devices = [
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
