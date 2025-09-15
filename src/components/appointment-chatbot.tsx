
'use client';

import { appointmentFlow } from '@/ai/flows/appointment-flow';
import { translateText } from '@/ai/flows/translate-text-flow';
import { Bot, Download, Languages, Paperclip, Send, User, X } from 'lucide-react';
import { FormEvent, useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { useData } from '@/contexts/data-provider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { format } from 'date-fns';
import { useLocation } from '@/hooks/use-location';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Separator } from './ui/separator';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

type Message = {
  role: 'user' | 'model';
  content: string;
  prescription?: any;
  labTest?: any;
  photoDataUri?: string;
};

const initialMessages: Message[] = [
    {
        role: 'model',
        content: "Hi there! I can help you find a doctor, generate a prescription, or order a lab test based on your doctor's instructions. How can I help?"
    }
]

function PrescriptionCard({ prescription, onDownload, onFindNearby }: { prescription: any, onDownload: (p: any) => void, onFindNearby: (t: 'pharmacy' | 'labs') => void }) {
    const [translatedMeds, setTranslatedMeds] = useState<any[] | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const { toast } = useToast();
    
    const languages = ["Spanish", "Hindi", "French", "German", "Mandarin"];

    const handleTranslate = async (language: string) => {
        setIsTranslating(true);
        try {
            const medicationsText = prescription.medications.map((med: any) => `- ${med.name} ${med.dosage} - ${med.frequency}`).join('\n');
            const result = await translateText({
                text: medicationsText,
                targetLanguage: language
            });
            const translatedLines = result.translatedText.split('\n');

            // This is a simple parser. It might not be perfect for all languages.
            const newTranslatedMeds = translatedLines.map((line, index) => {
                const originalMed = prescription.medications[index];
                // Remove the leading '-' if it exists
                const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                return {
                    ...originalMed,
                    translatedLine: cleanedLine
                };
            });

            setTranslatedMeds(newTranslatedMeds);
        } catch (error) {
            console.error("Translation error:", error);
            toast({ variant: 'destructive', title: 'Translation failed', description: 'Could not translate the prescription.' });
        } finally {
            setIsTranslating(false);
        }
    };
    
    const displayedMeds = translatedMeds || prescription.medications;

    return (
        <Card className="max-w-[80%] w-full">
            <CardHeader>
                <CardTitle className="text-base">Prescription Generated</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
                <p><span className="font-semibold">Patient:</span> {prescription.patientName}</p>
                <p><span className="font-semibold">Doctor:</span> {prescription.doctorName}</p>
                <p className="font-semibold mt-2">Medications:</p>
                <ul className="list-disc pl-5 space-y-1">
                    {displayedMeds.map((med: any, i: number) => (
                        <li key={i}>
                            {translatedMeds ? med.translatedLine : `${med.name} ${med.dosage} - ${med.frequency}`}
                        </li>
                    ))}
                </ul>
                {isTranslating && <Skeleton className="h-5 w-full mt-1" />}

                <div className="flex gap-2 pt-4">
                    <Button className="flex-1" variant="outline" onClick={() => onDownload(prescription)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="flex-1" variant="outline" disabled={isTranslating}>
                                <Languages className="mr-2 h-4 w-4" />
                                {isTranslating ? 'Translating...' : 'Translate'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {languages.map(lang => (
                                <DropdownMenuItem key={lang} onSelect={() => handleTranslate(lang)}>
                                    {lang}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-2">
                    <Button asChild>
                        <Link href="https://www.1mg.com" target="_blank">Order Online</Link>
                    </Button>
                     <Button onClick={() => onFindNearby('pharmacy')}>
                        Find Nearby
                     </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export function AppointmentChatbot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAppointmentChatbotOpen, setAppointmentChatbotOpen, doctors, currentUser, addPrescription, addLabTest } = useData();
  const { location, error: locationError } = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTo({
        top: scrollAreaViewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, loading]);
  
  useEffect(() => {
    if (!isAppointmentChatbotOpen) {
        // Reset to initial state when closed
        setTimeout(() => {
            setMessages(initialMessages);
            setPhoto(null);
            setInput('');
        }, 300);
    }
  }, [isAppointmentChatbotOpen]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !photo) return;

    setLoading(true);
    const userMessage: Message = { role: 'user', content: input, photoDataUri: photo || undefined };
    
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');
    setPhoto(null);

    try {
      const result = await appointmentFlow({
        prompt: input,
        doctors: doctors,
        patientName: currentUser?.name,
        photoDataUri: photo || undefined,
      });
      const modelMessage: Message = { role: 'model', content: result.response, prescription: result.prescription, labTest: result.labTest };
      if (result.prescription) {
        addPrescription(result.prescription);
      }
      if (result.labTest) {
        addLabTest(result.labTest);
      }
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        role: 'model',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleFindNearby = (type: 'pharmacy' | 'labs') => {
    if (locationError) {
        toast({
            variant: 'destructive',
            title: 'Location Error',
            description: locationError
        });
        return;
    }
    if (location) {
        const query = type === 'pharmacy' ? 'pharmacy' : 'diagnostic labs';
        const url = `https://www.google.com/maps/search/${query}/@${location.latitude},${location.longitude},15z`;
        window.open(url, '_blank');
    } else {
         toast({
            title: 'Finding Location...',
            description: 'Please wait while we determine your location.'
        });
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <Dialog open={isAppointmentChatbotOpen} onOpenChange={setAppointmentChatbotOpen}>
      <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col p-0">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
        />
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                AI Appointment Helper
            </DialogTitle>
            <DialogDescription>
                Describe your symptoms to find a doctor or provide instructions from your doctor.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6">
            <ScrollArea className="h-full" viewportRef={scrollAreaViewportRef}>
              <div className="space-y-4 pr-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex flex-col gap-2 ${
                      message.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className={`flex gap-2 w-full ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                        {message.role === 'model' && (
                          <Bot className="h-6 w-6 text-primary flex-shrink-0" />
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {message.content}
                           {message.photoDataUri && (
                                <div className="mt-2">
                                <Image src={message.photoDataUri} alt="User upload" width={200} height={200} className="rounded-md" />
                                </div>
                            )}
                        </div>
                        {message.role === 'user' && (
                          <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                        )}
                    </div>
                    {message.prescription && (
                        <PrescriptionCard 
                            prescription={message.prescription} 
                            onDownload={downloadPrescription}
                            onFindNearby={handleFindNearby}
                        />
                    )}
                    {message.labTest && (
                         <Card className="max-w-[80%] w-full">
                            <CardHeader>
                                <CardTitle className="text-base">Lab Test Ordered</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <p><span className="font-semibold">Patient:</span> {message.labTest.patientName}</p>
                                <p><span className="font-semibold">Doctor:</span> {message.labTest.doctorName}</p>
                                <p><span className="font-semibold">Test:</span> {message.labTest.testName}</p>
                                <p className="text-xs text-muted-foreground mt-2">You can view and manage this test in your Health Records.</p>
                                <Button className="mt-4 w-full" variant="outline" onClick={() => handleFindNearby('labs')}>
                                    Find Nearby Labs
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                  </div>
                ))}
                {loading && (
                   <div className="flex gap-2">
                    <Bot className="h-6 w-6 text-primary flex-shrink-0" />
                    <Skeleton className="h-10 w-3/4" />
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          <div className="p-6 pt-2 border-t">
             {photo && (
                <div className="mb-2 relative w-24 h-24">
                    <Image src={photo} alt="Preview" layout="fill" objectFit="cover" className="rounded-md" />
                     <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setPhoto(null)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
               <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                    <Paperclip className="h-5 w-5" />
                </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., 'I have a sore throat...' or 'Prescribe...'"
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading || (!input.trim() && !photo)}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
      </DialogContent>
    </Dialog>
  );
}
