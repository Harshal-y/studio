

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useData } from '@/contexts/data-provider';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  bookAppointment,
  viewAppointments,
} from '@/ai/flows/appointment-flow';
import { Loader2, Sparkles } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from './ui/carousel';

interface AppointmentManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  issue: z.string().min(2, 'Please describe your health issue.'),
  symptoms: z.string().optional(),
  history: z.string().optional(),
  doctorId: z.string().min(1, 'Please select a doctor.'),
  date: z.date({ required_error: 'Please select a date.' }),
  time: z.string().min(1, 'Please select a time.'),
});

const hours = Array.from({ length: 9 }, (_, i) => (i + 9).toString().padStart(2, '0')); // 09 to 17
const minutes = ['00', '30'];


function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [hourApi, setHourApi] = useState<CarouselApi>();
  const [minuteApi, setMinuteApi] = useState<CarouselApi>();

  const [selectedHour, selectedMinute] = value.split(':');

  useEffect(() => {
    if (!hourApi) return;
    const currentHourIndex = hours.indexOf(selectedHour);
    if (currentHourIndex !== -1) {
      hourApi.scrollTo(currentHourIndex);
    }
    const onSelect = () => {
        const newHour = hours[hourApi.selectedScrollSnap()];
        if(newHour) {
            onChange(`${newHour}:${selectedMinute}`);
        }
    }
    hourApi.on('select', onSelect);
    return () => { hourApi.off('select', onSelect); };
  }, [hourApi, selectedHour, selectedMinute, onChange]);

  useEffect(() => {
    if (!minuteApi) return;
     const currentMinuteIndex = minutes.indexOf(selectedMinute);
    if (currentMinuteIndex !== -1) {
      minuteApi.scrollTo(currentMinuteIndex);
    }
     const onSelect = () => {
        const newMinute = minutes[minuteApi.selectedScrollSnap()];
        if(newMinute) {
            onChange(`${selectedHour}:${newMinute}`);
        }
    }
    minuteApi.on('select', onSelect);
    return () => { minuteApi.off('select', onSelect); };
  }, [minuteApi, selectedHour, selectedMinute, onChange]);

  return (
    <div className="flex items-center justify-center gap-2">
      <Carousel
        setApi={setHourApi}
        opts={{ align: 'center' }}
        orientation="vertical"
        className="w-full"
      >
        <CarouselContent className="-mt-1 h-32">
          {hours.map((hour, index) => (
            <CarouselItem key={index} className="pt-1 basis-1/3">
              <div className="flex items-center justify-center h-full">
                <Button
                  variant={selectedHour === hour ? 'default' : 'ghost'}
                  className="w-full text-lg"
                  onClick={() => hourApi?.scrollTo(index)}
                  type="button"
                >
                  {hour}
                </Button>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <span className="text-2xl font-bold">:</span>
       <Carousel
        setApi={setMinuteApi}
        opts={{ align: 'center' }}
        orientation="vertical"
        className="w-full"
      >
        <CarouselContent className="-mt-1 h-32">
          {minutes.map((minute, index) => (
            <CarouselItem key={index} className="pt-1 basis-1/3">
              <div className="flex items-center justify-center h-full">
                <Button
                  variant={selectedMinute === minute ? 'default' : 'ghost'}
                  className="w-full text-lg"
                  onClick={() => minuteApi?.scrollTo(index)}
                  type="button"
                >
                  {minute}
                </Button>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

export function AppointmentManager({
  open,
  onOpenChange,
}: AppointmentManagerProps) {
  const { doctors, currentUser, addAppointment, setAppointmentChatbotOpen } =
    useData();
  const { toast } = useToast();
  const [isRecommending, setIsRecommending] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      issue: '',
      symptoms: '',
      history: '',
      time: '12:00', // Default to a common time
    },
  });

  const verifiedDoctors = doctors.filter((d) => d.isVerified);

  const handleGetRecommendation = async () => {
    setAppointmentChatbotOpen(true);
    onOpenChange(false); // Close the current dialog
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUser) return;
    setIsBooking(true);
    try {
      const selectedDoctor = doctors.find(
        (d) => d.id === parseInt(values.doctorId, 10)
      );
      if (!selectedDoctor) {
        toast({ variant: 'destructive', title: 'Doctor not found.' });
        setIsBooking(false);
        return;
      }

      const result = await bookAppointment({
        doctorId: parseInt(values.doctorId, 10),
        doctorName: selectedDoctor.name,
        date: format(values.date, 'yyyy-MM-dd'),
        time: values.time,
        patientName: currentUser.name,
        issue: values.issue,
      });

      if (result.appointment) {
        addAppointment(result.appointment);
      }

      toast({
        title: 'Appointment Booked!',
        description: result.message,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Booking Error',
        description: 'Could not book the appointment. Please try again.',
      });
    } finally {
      setIsBooking(false);
    }
  }

  const fetchAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const result = await viewAppointments();
      setUpcomingAppointments(result);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch appointments.',
      });
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAppointments();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Appointment Manager</DialogTitle>
          <DialogDescription>
            Book a new appointment or view your upcoming ones.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="book" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="book">Book Appointment</TabsTrigger>
            <TabsTrigger value="view" onClick={fetchAppointments}>
              View Appointments
            </TabsTrigger>
          </TabsList>
          <TabsContent value="book">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 pt-4"
              >
                <FormField
                  control={form.control}
                  name="issue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Health Issue</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Annual Checkup, Skin Rash"
                          {...field}
                        />
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
                      <FormLabel>Symptoms (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your symptoms..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="history"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relevant Medical History (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Allergies, Past Surgeries"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor</FormLabel>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {verifiedDoctors.map((doc) => (
                              <SelectItem key={doc.id} value={String(doc.id)}>
                                {doc.name} - {doc.degree}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGetRecommendation}
                          disabled={isRecommending}
                        >
                          {isRecommending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          <span className="ml-2 hidden sm:inline">
                            AI Help
                          </span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date <
                                new Date(
                                  new Date().setDate(new Date().getDate() - 1)
                                )
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <div className="p-2 border rounded-md">
                            <TimePicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isBooking}>
                  {isBooking ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isBooking ? 'Booking...' : 'Book Appointment'}
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="view">
            <div className="space-y-4 pt-4">
              {isLoadingAppointments ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appt) => (
                  <div key={appt.id} className="p-4 border rounded-lg">
                    <p className="font-semibold">Dr. {appt.doctorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {appt.issue}
                    </p>
                    <p className="text-sm mt-2">
                      {format(new Date(appt.date), 'EEEE, MMMM d, yyyy')} at{' '}
                      {appt.time}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  You have no upcoming appointments.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
