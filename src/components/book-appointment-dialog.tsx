'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useData } from '@/contexts/data-provider';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { findDoctor } from '@/ai/flows/doctor-directory-flow';
import { Skeleton } from './ui/skeleton';

const appointmentSchema = z.object({
  doctorType: z.string().optional(),
  issue: z.string().min(1, 'Please describe the issue.'),
  symptoms: z.string().min(1, 'Please list your symptoms.'),
  history: z.string().optional(),
  locality: z.string().min(1, 'Please provide your locality.'),
  doctorId: z.string().min(1, 'Please select a doctor.'),
});

interface BookAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookAppointmentDialog({ open, onOpenChange }: BookAppointmentDialogProps) {
  const { toast } = useToast();
  const { doctors } = useData();
  const [isFindingDoctor, setIsFindingDoctor] = useState(false);
  const [recommendation, setRecommendation] = useState('');

  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorType: '',
      issue: '',
      symptoms: '',
      history: '',
      locality: '',
      doctorId: '',
    },
  });

  const { isSubmitting } = form.formState;

  const handleFindDoctor = async () => {
    const { issue, symptoms, history } = form.getValues();
    if (!issue || !symptoms) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out the issue and symptoms fields first.',
      });
      return;
    }

    setIsFindingDoctor(true);
    setRecommendation('');

    try {
      const verifiedDoctors = doctors.filter((d) => d.isVerified);
      const result = await findDoctor({
        issue,
        symptoms,
        history,
        doctors: verifiedDoctors.map(({ id, name, degree, experience }) => ({
          id,
          name,
          specialty: degree,
          experience,
        })),
      });
      setRecommendation(result.recommendation);
      if (result.doctorId) {
        form.setValue('doctorId', String(result.doctorId));
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not get a recommendation. Please try again.',
      });
    } finally {
      setIsFindingDoctor(false);
    }
  };


  function onSubmit(values: z.infer<typeof appointmentSchema>) {
    console.log(values);
    toast({
      title: 'Appointment Booked!',
      description: 'Your appointment request has been sent successfully.',
    });
    form.reset();
    onOpenChange(false);
  }

  const verifiedDoctors = doctors.filter(d => d.isVerified);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book an Appointment</DialogTitle>
          <DialogDescription>
            Fill out the form below to request an appointment with one of our
            verified doctors. Not sure who to pick? Use our AI to find a match.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto px-1"
          >
            <FormField
              control={form.control}
              name="issue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Issue</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Annual Checkup, Skin rash" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symptoms</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Feeling tired, occasional headaches"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="history"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical History (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Diagnosed with high blood pressure in 2020"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleFindDoctor}
                disabled={isFindingDoctor}
              >
                {isFindingDoctor ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Get AI Recommendation
              </Button>
              {isFindingDoctor && (
                 <div className="space-y-2 pt-2">
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-5 w-full" />
                  </div>
              )}
              {recommendation && !isFindingDoctor && (
                 <div className="pt-2">
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md flex items-start gap-2">
                       <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                       <p>{recommendation}</p>
                    </div>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="locality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Locality / Area</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Downtown, Springfield" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Doctor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified doctor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {verifiedDoctors.length > 0 ? (
                        verifiedDoctors.map((doc) => (
                          <SelectItem key={doc.id} value={String(doc.id)}>
                            {doc.name} ({doc.degree}) - {doc.experience} years
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-center text-muted-foreground">
                            No verified doctors available yet.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Book Appointment
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
