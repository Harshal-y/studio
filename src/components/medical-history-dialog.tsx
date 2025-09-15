
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { viewAppointments, viewLabTests, viewPrescriptions } from '@/ai/flows/appointment-flow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData, Appointment, Prescription, LabTest, User } from '@/contexts/data-provider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, isPast } from 'date-fns';
import { Calendar, Download, FileText, FlaskConical, Stethoscope, MapPin, Upload } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';


const formatTime12h = (time24: string) => {
    if (!time24) return 'N/A';
    const [hour, minute] = time24.split(':');
    const date = new Date();
    date.setHours(parseInt(hour, 10));
    date.setMinutes(parseInt(minute, 10));
    return format(date, 'hh:mm a');
};

function AppointmentsTab({ patientName, appointments: allAppointments, loading }: { patientName: string, appointments: Appointment[], loading: boolean }) {
    const appointments = useMemo(() => allAppointments.filter(a => a.patientName === patientName), [allAppointments, patientName]);

    if (loading) {
        return <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
    }

    return (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {appointments.length === 0 ? (
                 <p className="text-center text-muted-foreground py-8">No appointments found.</p>
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

function PrescriptionsTab({ patientName, prescriptions: allPrescriptions, loading }: { patientName: string, prescriptions: Prescription[], loading: boolean }) {
     const prescriptions = useMemo(() => allPrescriptions.filter(p => p.patientName === patientName), [allPrescriptions, patientName]);

    const downloadPrescription = (prescription: any) => {
        const a = document.createElement('a');
        a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(prescription, null, 2))}`;
        a.download = `prescription-${prescription.id}.txt`;
        a.click();
    };

    if (loading) {
        return <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
    }

    return (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {prescriptions.length === 0 ? (
                 <p className="text-center text-muted-foreground py-8">No prescriptions found.</p>
            ) : (
                 [...prescriptions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(presc => (
                     <Card key={presc.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg">From Dr. {presc.doctorName}</CardTitle>
                                    <CardDescription>Issued on {format(new Date(presc.date), 'PPP')}</CardDescription>
                                </div>
                                <Button variant="outline" size="icon" onClick={() => downloadPrescription(presc)}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
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

function LabReportsTab({ patientName, labTests: allLabTests, loading }: { patientName: string, labTests: LabTest[], loading: boolean }) {
    const labTests = useMemo(() => allLabTests.filter(t => t.patientName === patientName), [allLabTests, patientName]);

    if (loading) {
        return <div className="space-y-4"><Skeleton className="h-24 w-full" /></div>
    }

    return (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {labTests.length === 0 ? (
                 <p className="text-center text-muted-foreground py-8">No lab tests found.</p>
            ) : (
                 [...labTests].sort((a,b) => new Date(b.dateOrdered).getTime() - new Date(a.dateOrdered).getTime()).map(test => (
                     <Card key={test.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg">{test.testName}</CardTitle>
                                    <CardDescription>Ordered by Dr. {test.doctorName} on {format(new Date(test.dateOrdered), 'PPP')}</CardDescription>
                                </div>
                                <Badge variant={test.status === 'Ordered' ? 'outline' : 'secondary'}>{test.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                             {test.reportUrl ? (
                                <Button asChild variant="outline" className="w-full">
                                    <a href={test.reportUrl} target="_blank" rel="noopener noreferrer">
                                        <Download className="mr-2 h-4 w-4" />
                                        View Report
                                    </a>
                                </Button>
                             ) : (
                                <p className="text-sm text-muted-foreground text-center">Report not yet uploaded.</p>
                             )}
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}

interface MedicalHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: User;
}

export function MedicalHistoryDialog({ open, onOpenChange, patient }: MedicalHistoryDialogProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [labTests, setLabTests] = useState<LabTest[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!open) return;
        
        async function fetchAllRecords() {
            setLoading(true);
            try {
                const [apptRes, prescRes, labRes] = await Promise.all([
                    viewAppointments(),
                    viewPrescriptions(),
                    viewLabTests()
                ]);
                setAppointments(apptRes);
                setPrescriptions(prescRes);
                setLabTests(labRes);
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Error fetching records' });
            } finally {
                setLoading(false);
            }
        }
        
        fetchAllRecords();
    }, [open, toast]);

    return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Medical History for {patient.name}</DialogTitle>
          <DialogDescription>
            A complete overview of the patient's recorded medical history.
          </DialogDescription>
        </DialogHeader>
            <Tabs defaultValue="appointments" className="w-full pt-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="appointments"><Stethoscope className="mr-2 h-4 w-4" />Appointments</TabsTrigger>
                    <TabsTrigger value="prescriptions"><FileText className="mr-2 h-4 w-4" />Prescriptions</TabsTrigger>
                    <TabsTrigger value="reports"><FlaskConical className="mr-2 h-4 w-4" />Lab Reports</TabsTrigger>
                </TabsList>
                <TabsContent value="appointments" className="mt-4">
                   <AppointmentsTab patientName={patient.name} appointments={appointments} loading={loading} />
                </TabsContent>
                <TabsContent value="prescriptions" className="mt-4">
                    <PrescriptionsTab patientName={patient.name} prescriptions={prescriptions} loading={loading} />
                </TabsContent>
                <TabsContent value="reports" className="mt-4">
                    <LabReportsTab patientName={patient.name} labTests={labTests} loading={loading} />
                </TabsContent>
            </Tabs>
      </DialogContent>
    </Dialog>
  );
}
