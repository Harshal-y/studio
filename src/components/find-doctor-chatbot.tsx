
'use client';

import { findDoctor, FindDoctorInput } from '@/ai/flows/doctor-directory-flow';
import { Bot, Send, Stethoscope, User, X } from 'lucide-react';
import { FormEvent, useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Skeleton } from './ui/skeleton';
import { useData } from '@/contexts/data-provider';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

export function FindDoctorChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [issue, setIssue] = useState('');
  const [history, setHistory] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const { doctors } = useData();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || !issue.trim()) return;

    setLoading(true);
    setRecommendation('');

    try {
        const verifiedDoctors = doctors.filter(d => d.isVerified);
        const input: FindDoctorInput = {
            symptoms,
            issue,
            history,
            doctors: verifiedDoctors.map(({id, name, degree, experience}) => ({id, name, specialty: degree, experience})),
        };
      const result = await findDoctor(input);
      setRecommendation(result.recommendation);
    } catch (error) {
      setRecommendation('Sorry, I encountered an error while finding a doctor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSymptoms('');
    setIssue('');
    setHistory('');
    setRecommendation('');
  }

  const handleOpenChange = (open: boolean) => {
    if(!open) {
        resetForm();
    }
    setIsOpen(open);
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg"
          size="icon"
          variant="secondary"
        >
          <Stethoscope className="h-6 w-6" />
          <span className="sr-only">Find a Doctor</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-96 p-0 border-none ml-2 mb-2"
        sideOffset={16}
      >
        <Card className="flex flex-col shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              <CardTitle>Find a Doctor</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
               <CardDescription>
                Describe your health concern, and our AI will suggest a suitable specialist.
              </CardDescription>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="issue">Primary Issue</Label>
                <Input
                  id="issue"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="e.g., Skin rash, Chronic headache"
                  disabled={loading}
                  required
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="symptoms">Symptoms</Label>
                <Textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms in detail..."
                  disabled={loading}
                  required
                  rows={3}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="history">Medical History (Optional)</Label>
                <Textarea
                  id="history"
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  placeholder="Any relevant past conditions or treatments..."
                  disabled={loading}
                  rows={2}
                />
              </div>

               {loading && (
                  <div className="space-y-2 pt-4">
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                )}

              {recommendation && !loading && (
                <div className="pt-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        AI Recommendation
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{recommendation}</p>
                </div>
              )}

            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Finding Doctor...' : 'Find Doctor'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
