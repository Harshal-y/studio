import { DeviceManager } from './device-manager';
import { EmergencyContacts } from './emergency-contacts';
import { HealthInsights } from './health-insights';
import { HistoricalChart } from './historical-chart';
import { TrendAnalysis } from './trend-analysis';
import { VitalsMonitor } from './vitals-monitor';

export function Dashboard() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
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
  );
}
