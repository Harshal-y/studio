
'use client';

import { chat } from '@/ai/flows/chat-flow';
import { Bot, Send, User, X } from 'lucide-react';
import { FormEvent, useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Skeleton } from './ui/skeleton';
import { useData } from '@/contexts/data-provider';

type Message = {
  role: 'user' | 'model';
  content: string;
};

const initialMessages: Message[] = [
    {
        role: 'model',
        content: "Hi there! I can help you find a doctor based on your symptoms. What are you experiencing?"
    }
]

export function AppointmentChatbot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  const { isAppointmentChatbotOpen, setAppointmentChatbotOpen } = useData();

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
        setTimeout(() => setMessages(initialMessages), 300);
    }
  }, [isAppointmentChatbotOpen]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    const userMessage: Message = { role: 'user', content: input };
    
    // Pass user's message and doctor list to the specialized appointment flow
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');

    try {
      const result = await chat({
        prompt: input,
        history: messages,
      });
      const modelMessage: Message = { role: 'model', content: result.response };
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

  return (
    <Dialog open={isAppointmentChatbotOpen} onOpenChange={setAppointmentChatbotOpen}>
      <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                AI Appointment Helper
            </DialogTitle>
            <DialogDescription>
                Describe your symptoms, and I'll help you find the right doctor.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6">
            <ScrollArea className="h-full" viewportRef={scrollAreaViewportRef}>
              <div className="space-y-4 pr-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${
                      message.role === 'user' ? 'justify-end' : ''
                    }`}
                  >
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
                    </div>
                     {message.role === 'user' && (
                      <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />
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
          <div className="p-6 pt-2">
            <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., 'I have a sore throat and a fever...'"
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
      </DialogContent>
    </Dialog>
  );
}
