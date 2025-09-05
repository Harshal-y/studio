'use client';

import { generateHealthTrendSummaries } from '@/ai/flows/generate-health-trend-summaries';
import { historicalData } from '@/data/mock-data';
import { LineChart, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Skeleton } from './ui/skeleton';

export function TrendAnalysis() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);

    const healthDataString = JSON.stringify(historicalData);

    try {
      const result = await generateHealthTrendSummaries({
        healthData: healthDataString,
      });
      setSummary(result.summary);
    } catch (e) {
      setError('Failed to generate trend summary. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col backdrop-blur-sm bg-background/60 dark:bg-black/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <LineChart className="size-6 text-primary" />
          <CardTitle>Trend Analysis Tool</CardTitle>
        </div>
        <CardDescription>
          Generate a summary of health trends and correlations.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {summary && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {summary}
          </p>
        )}
        {!loading && !summary && !error && (
          <div className="text-center text-muted-foreground text-sm flex-1 flex flex-col items-center justify-center">
            <p>Click the button to generate your trend analysis.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerateSummary}
          disabled={loading}
          className="w-full"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {loading ? 'Analyzing...' : 'Analyze Trends'}
        </Button>
      </CardFooter>
    </Card>
  );
}
