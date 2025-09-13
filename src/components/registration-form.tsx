
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from '@/hooks/use-location';
import { Checkbox } from './ui/checkbox';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  dob: z
    .date({
      required_error: 'A date of birth is required.',
    })
    .refine(
      (date) => {
        const today = new Date();
        const sixteenYearsAgo = new Date(
          today.getFullYear() - 16,
          today.getMonth(),
          today.getDate()
        );
        return date <= sixteenYearsAgo;
      },
      { message: 'You must be at least 16 years old.' }
    ),
  bloodGroup: z.string({
    required_error: 'Please select a blood group.',
  }),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
  contactPermission: z.boolean().default(false).optional(),
});

function DateOfBirthPicker({
  value,
  onChange,
}: {
  value: Date | undefined;
  onChange: (date: Date) => void;
}) {
  const [day, setDay] = useState<string | undefined>(
    value ? String(value.getDate()) : undefined
  );
  const [month, setMonth] = useState<string | undefined>(
    value ? String(value.getMonth()) : undefined
  );
  const [year, setYear] = useState<string | undefined>(
    value ? String(value.getFullYear()) : undefined
  );

  useEffect(() => {
    if (day && month && year) {
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum)) {
        const newDate = new Date(yearNum, monthNum, dayNum);
        if (value?.getTime() !== newDate.getTime()) {
          onChange(newDate);
        }
      }
    }
  }, [day, month, year, onChange, value]);

  const currentYear = new Date().getFullYear();
  const startYear = 1900;
  const endYear = currentYear;

  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) =>
    String(startYear + i)
  ).reverse();
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i),
    label: new Date(0, i).toLocaleString('default', { month: 'long' }),
  }));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select value={day} onValueChange={setDay}>
        <SelectTrigger>
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={year} onValueChange={setYear}>
        <SelectTrigger>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function RegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  // This will trigger the browser's location permission prompt on component mount
  useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const deviceCode = `${values.name
      .split(' ')[0]
      .toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    toast({
      title: 'Registration Successful!',
      description: `You are now being redirected to your dashboard.`,
      duration: 5000,
    });

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      // We'll use localStorage to pass the device code to the dashboard
      if (typeof window !== 'undefined') {
        localStorage.setItem('deviceCode', deviceCode);
        localStorage.setItem('newUser', JSON.stringify(values));
      }
      router.push('/dashboard');
    }, 3000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <DateOfBirthPicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bloodGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Group</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                      (group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="(555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactPermission"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Allow access to contacts</FormLabel>
                <FormDescription>
                  This allows the app to access your contacts for the emergency
                  alert system.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>
    </Form>
  );
}
