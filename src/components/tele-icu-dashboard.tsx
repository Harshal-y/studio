
'use client';

import { useData, User, VitalsState, Doctor } from "@/contexts/data-provider";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Droplets, Heart, HeartPulse, Monitor, Thermometer, Waves, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { useEffect, useState } from "react";
import { DoctorProfileDialog } from "./doctor-profile-dialog";
import { format } from "date-fns";

const iconMap = {
  heartRate: Heart,
  oxygenSaturation: Waves,
  bodyTemperature: Thermometer,
  hydrationLevel: Droplets,
};

const nameMap: Record<keyof Omit<VitalsState, 'heartRate' | 'oxygenSaturation' | 'bodyTemperature' | 'hydrationLevel'>, string> = {
};


function VitalsGrid({ vitals }: { vitals: VitalsState }) {
    if (!vitals) return null;
    
    const renderVital = (key: keyof VitalsState) => {
        const vital = vitals[key];
        const Icon = iconMap[key as keyof typeof iconMap] || HeartPulse;
        const name = nameMap[key as keyof typeof nameMap] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        return (
            <div key={key} className="flex items-center gap-2">
                <Icon className="size-5 text-muted-foreground" />
                <div>
                    <p className="text-xs text-muted-foreground">{name}</p>
                    <p className="text-md font-bold">
                        {vital.value}
                        <span className="text-xs font-medium text-muted-foreground">
                        {' '}
                        {vital.unit}
                        </span>
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 gap-4 mt-4">
            {Object.keys(vitals).map(key => renderVital(key as keyof VitalsState))}
        </div>
    )
}

function PatientCard({ patient, onToggleMonitor }: { patient: User, onToggleMonitor: (id: number) => void }) {
    const [currentVitals, setCurrentVitals] = useState(patient.vitals);

    useEffect(() => {
        if (!patient.isMonitored) return;

        const interval = setInterval(() => {
            setCurrentVitals(prevVitals => {
                const newVitals = { ...prevVitals };
                (Object.keys(newVitals) as Array<keyof VitalsState>).forEach((key) => {
                    const vital = newVitals[key];
                    const fluctuation = (Math.random() - 0.5) * (key === 'heartRate' ? 2 : 0.2);
                    let newValue = vital.value + fluctuation;

                     if (key === 'heartRate') {
                        newValue = Math.max(50, Math.min(180, Math.round(newValue)));
                    } else if (key === 'oxygenSaturation') {
                        newValue = Math.max(85, Math.min(100, parseFloat(newValue.toFixed(1))));
                    } else if (key === 'bodyTemperature') {
                        newValue = Math.max(36.0, Math.min(41.0, parseFloat(newValue.toFixed(1))));
                    } else if (key === 'hydrationLevel') {
                        newValue = Math.max(70, Math.min(100, parseFloat(newValue.toFixed(1))));
                    }
                    newVitals[key] = { ...vital, value: newValue };
                });
                return newVitals;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [patient.isMonitored]);


    const isCritical = (vitals: VitalsState): boolean => {
         if (vitals.heartRate.value > vitals.heartRate.thresholds.danger) return true;
         if (vitals.oxygenSaturation.value < vitals.oxygenSaturation.thresholds.danger) return true;
         if (vitals.bodyTemperature.value > vitals.bodyTemperature.thresholds.danger) return true;
         return false;
    }

    return (
        <Card className={cn(
            "transition-all",
            patient.isMonitored && "ring-2 ring-primary",
            patient.isMonitored && isCritical(currentVitals) && "ring-destructive animate-pulse"
            )}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={patient.avatar} alt={patient.name} />
                            <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">{patient.name}</CardTitle>
                            <CardDescription>{patient.email}</CardDescription>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Monitor</span>
                        <Switch
                            checked={patient.isMonitored}
                            onCheckedChange={() => onToggleMonitor(patient.id)}
                            aria-label={`Monitor ${patient.name}`}
                         />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {patient.isMonitored ? (
                    <VitalsGrid vitals={currentVitals} />
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>Enable monitoring to see live vitals.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const [hour, minute] = time24.split(':');
    const date = new Date();
    date.setHours(parseInt(hour, 10));
    date.setMinutes(parseInt(minute, 10));
    return format(date, 'hh:mm a');
};

export function TeleIcuDashboard() {
    const { allUsers, toggleMonitoring, currentDoctor, appointments } = useData();
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

    const monitoredPatients = allUsers.filter(u => u.isMonitored);
    const otherPatients = allUsers.filter(u => !u.isMonitored);

    const doctorAppointments = appointments.filter(appt => appt.doctorId === currentDoctor?.id);


    return (
        <>
        <DoctorProfileDialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen} />
        <div className="p-4 sm:p-6 md:p-8">
            <header className="flex items-center justify-between pb-4 border-b">
                <Logo />
                <div className="flex items-center gap-4">
                    {currentDoctor && (
                        <div className="text-right">
                            <p className="font-semibold">{currentDoctor.name}</p>
                            <p className="text-sm text-muted-foreground">{currentDoctor.specialty}</p>
                        </div>
                    )}
                    <Button variant="outline" onClick={() => setIsProfileDialogOpen(true)}>Update Profile</Button>
                </div>
            </header>

            <main className="py-8 grid gap-12 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Monitored Patients</h2>
                        {monitoredPatients.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2">
                                {monitoredPatients.map(patient => (
                                    <PatientCard key={patient.id} patient={patient} onToggleMonitor={toggleMonitoring} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No patients are currently being monitored.</p>
                        )}
                    </section>
                    
                    <section className="mt-12">
                        <h2 className="text-xl font-semibold mb-4">All Patients</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            {otherPatients.map(patient => (
                            <PatientCard key={patient.id} patient={patient} onToggleMonitor={toggleMonitoring} />
                            ))}
                        </div>
                    </section>
                </div>
                <div className="lg:col-span-1">
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <CalendarDays className="size-5" />
                                    Upcoming Schedule
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {doctorAppointments.length > 0 ? (
                                    doctorAppointments.map(appt => (
                                        <div key={appt.id} className="p-4 border rounded-lg">
                                            <p className="font-semibold">{appt.patientName}</p>
                                            <p className="text-sm text-muted-foreground">{appt.issue}</p>
                                            <p className="text-sm mt-2">
                                            {format(new Date(appt.date), 'EEEE, MMMM d, yyyy')} at {formatTime12h(appt.time)}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                    You have no upcoming appointments.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </main>
        </div>
        </>
    )
}
