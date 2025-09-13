
'use client';

import { useEffect } from 'react';
import { useData } from '@/contexts/data-provider';
import { useToast } from '@/hooks/use-toast';
import { differenceInMinutes, parse } from 'date-fns';

export function AppointmentReminder() {
  const { appointments } = useData();
  const { toast } = useToast();

  useEffect(() => {
    const checkAppointments = () => {
      const now = new Date();
      appointments.forEach((appt) => {
        const apptDateTime = parse(`${appt.date} ${appt.time}`, 'yyyy-MM-dd HH:mm', new Date());
        const minutesUntil = differenceInMinutes(apptDateTime, now);

        const reminderKey60 = `reminder-60-${appt.id}`;
        const reminderKey30 = `reminder-30-${appt.id}`;

        if (minutesUntil > 59 && minutesUntil <= 60 && !sessionStorage.getItem(reminderKey60)) {
          toast({
            title: 'Appointment Reminder',
            description: `Your appointment with ${appt.doctorName} is in 1 hour.`,
          });
          sessionStorage.setItem(reminderKey60, 'true');
        }

        if (minutesUntil > 29 && minutesUntil <= 30 && !sessionStorage.getItem(reminderKey30)) {
          toast({
            title: 'Appointment Reminder',
            description: `Your appointment with ${appt.doctorName} is in 30 minutes.`,
          });
          sessionStorage.setItem(reminderKey30, 'true');
        }
      });
    };

    const intervalId = setInterval(checkAppointments, 60 * 1000); // Check every minute

    return () => clearInterval(intervalId);
  }, [appointments, toast]);

  return null; // This component does not render anything
}
