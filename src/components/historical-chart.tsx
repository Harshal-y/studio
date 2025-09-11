'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { useData } from '@/contexts/data-provider';
import { History } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from './ui/skeleton';

const chartConfig = {
  heartRate: {
    label: 'Heart Rate',
    color: 'hsl(var(--chart-1))',
  },
  oxygenSaturation: {
    label: 'Oxygen Saturation',
    color: 'hsl(var(--chart-2))',
  },
  bodyTemperature: {
    label: 'Body Temp',
    color: 'hsl(var(--chart-3))',
  },
};

export function HistoricalChart() {
  const [isClient, setIsClient] = useState(false);
  const { historicalData, isConnected } = useData();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !isConnected || !historicalData) {
    return (
      <Card className="backdrop-blur-sm bg-background/60 dark:bg-black/60">
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-background/60 dark:bg-black/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="size-6 text-primary" />
          <CardTitle>Historical Trends</CardTitle>
        </div>
        <CardDescription>Last 7 Days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <LineChart data={historicalData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(5)}
              />
              <YAxis
                yAxisId="left"
                stroke="hsl(var(--chart-1))"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--chart-2))"
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                dataKey="heartRate"
                type="monotone"
                stroke="var(--color-heartRate)"
                strokeWidth={2}
                dot={false}
                yAxisId="left"
              />
              <Line
                dataKey="oxygenSaturation"
                type="monotone"
                stroke="var(--color-oxygenSaturation)"
                strokeWidth={2}
                dot={false}
                yAxisId="right"
              />
              <Line
                dataKey="bodyTemperature"
                type="monotone"
                stroke="var(--color-bodyTemperature)"
                strokeWidth={2}
                dot={false}
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
