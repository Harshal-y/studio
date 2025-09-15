
'use client';

import { viewAppointments, viewPrescriptions } from '@/ai/flows/appointment-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData, Appointment, Prescription } from '@/contexts/data-provider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, isPast } from 'date-fns';
import { Calendar, Download, FileText, Stethoscope } from 'lucide-react';
import { useEffect, useState } from 'react';

const formatTime12h = (time24: string) => {
    if (!time24) return 'N/A';
    const [hour, minute] = time24.split(':');
    const date = new Date();
    date.setHours(parseInt(hour, 10));
    date.setMinutes(parseInt(minute, 10));
    return format(date, 'hh:mm a');
};


function AppointmentsTab() {
    const { appointments: initialAppointments } = useData();
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchAppointments() {
            try {
                const cloudAppointments = await viewAppointments();
                // Combine local and cloud, removing duplicates
                const all = [...initialAppointments, ...cloudAppointments];
                const uniqueAppointments = all.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i)
                setAppointments(uniqueAppointments);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error fetching appointments' });
            } finally {
                setLoading(false);
            }
        }
        fetchAppointments();
    }, [initialAppointments, toast]);

    if (loading) {
        return <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    }

    return (
        <div className="space-y-4">
            {appointments.length === 0 ? (
                 <p className="text-center text-muted-foreground py-8">
                  You have no appointments.
                </p>
            ) : (
                [...appointments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(appt => (
                     <Card key={appt.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg">Dr. {appt.doctorName}</CardTitle>
                                    <CardDescription>{appt.issue}</CardDescription>
                                </div>
                                <Badge variant={isPast(new Date(appt.date)) ? 'secondary' : 'default'}>
                                    {isPast(new Date(appt.date)) ? 'Completed' : 'Upcoming'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>{format(new Date(appt.date), 'EEEE, MMMM d, yyyy')} at {formatTime12h(appt.time)}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}

function PrescriptionsTab() {
    const { prescriptions: initialPrescriptions } = useData();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchPrescriptions() {
            try {
                const cloudPrescriptions = await viewPrescriptions();
                const all = [...initialPrescriptions, ...cloudPrescriptions];
                const uniquePrescriptions = all.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i)
                setPrescriptions(uniquePrescriptions);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error fetching prescriptions' });
            } finally {
                setLoading(false);
            }
        }
        fetchPrescriptions();
    }, [initialPrescriptions, toast]);

    const downloadPrescription = (prescription: any) => {
        const prescriptionText = `
    -----------------------------------------
          PRESCRIPTION
    -----------------------------------------
    Prescription ID: ${prescription.id}
    Date: ${format(new Date(prescription.date), 'PPP')}
    
    Patient: ${prescription.patientName}
    Doctor: ${prescription.doctorName}
    
    -----------------------------------------
    Medications:
    ${prescription.medications.map((med: any) => `
    - ${med.name} (${med.dosage})
      Frequency: ${med.frequency}
    `).join('')}
    -----------------------------------------
    
    Disclaimer: ${prescription.disclaimer}
        `;
        const blob = new Blob([prescriptionText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prescription-${prescription.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    }

    return (
        <div className="space-y-4">
            {prescriptions.length === 0 ? (
                 <p className="text-center text-muted-foreground py-8">
                  You have no prescriptions.
                </p>
            ) : (
                 [...prescriptions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(presc => (
                     <Card key={presc.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg">Prescription from Dr. {presc.doctorName}</CardTitle>
                                    <CardDescription>
                                        Issued on {format(new Date(presc.date), 'PPP')}
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="icon" onClick={() => downloadPrescription(presc)}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <p className="font-semibold mb-2">Medications:</p>
                             <ul className="list-disc pl-5 space-y-1 text-sm">
                                {presc.medications.map((med: any, i: number) => (
                                    <li key={i}>{med.name} {med.dosage} - {med.frequency}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}

function ReportsTab() {
    return (
        <div className="text-center text-muted-foreground py-16">
            <FileText className="mx-auto h-12 w-12" />
            <p className="mt-4">Health report functionality is coming soon.</p>
        </div>
    )
}


export default function RecordsPage() {
    return (
        <div className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 space-y-4">
            <header>
                <h1 className="text-2xl font-bold">Health Records</h1>
                <p className="text-muted-foreground">Your complete medical history in one place.</p>
            </header>
            <Tabs defaultValue="appointments" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="appointments">
                        <Stethoscope className="mr-2 h-4 w-4" />
                        Appointments
                    </TabsTrigger>
                    <TabsTrigger value="prescriptions">
                        <FileText className="mr-2 h-4 w-4" />
                        Prescriptions
                    </TabsTrigger>
                    <TabsTrigger value="reports">
                        <FileText className="mr-2 h-4 w-4" />
                        Reports
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="appointments">
                   <AppointmentsTab />
                </TabsContent>
                <TabsContent value="prescriptions">
                    <PrescriptionsTab />
                </TabsContent>
                <TabsContent value="reports">
                    <ReportsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
