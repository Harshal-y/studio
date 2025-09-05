'use client';

import { generatePersonalizedHealthInsights } from '@/ai/flows/generate-personalized-health-insights';
import { historicalData, userPreferences } from '@/data/mock-data';
import { Bot, Sparkles } from 'lucide-react';
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

export function HealthInsights() {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInsights = async () => {
    setLoading(true);
    setError(null);
    setInsights(null);

    const healthDataString = JSON.stringify(historicalData.slice(-7)); // Use last 7 days

    try {
      const result = await generatePersonalizedHealthInsights({
        healthData: healthDataString,
        userPreferences: userPreferences,
      });
      setInsights(result.insights);
    } catch (e) {
      setError('Failed to generate insights. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col backdrop-blur-sm bg-background/60 dark:bg-black/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="size-6 text-primary" />
          <CardTitle>Personalized Health Insights</CardTitle>
        </div>
        <CardDescription>
          AI-powered recommendations based on your health data.
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
        {insights && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {insights}
          </p>
        )}
        {!loading && !insights && !error && (
          <div className="text-center text-muted-foreground text-sm flex-1 flex flex-col items-center justify-center">
            <p>Click the button to generate your personalized insights.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerateInsights}
          disabled={loading}
          className="w-full"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {loading ? 'Generating...' : 'Generate Insights'}
        </Button>
      </CardFooter>
    </Card>
  );
}
