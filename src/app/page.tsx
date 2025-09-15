import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Stethoscope, User } from 'lucide-react';
import { Logo } from '@/components/logo';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Image
        src="https://picsum.photos/seed/5/1920/1080"
        alt="Healthcare technology background"
        fill
        className="absolute inset-0 -z-10 object-cover opacity-20"
        data-ai-hint="medicine"
      />
      <header className="p-4 sm:p-6">
        <Logo />
      </header>
      <main className="flex-1 flex items-center justify-center -mt-16">
        <div className="container flex flex-col items-center justify-center gap-6 px-4 text-center md:px-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Proactive Health Monitoring
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Your partner in leveraging real-time data for personalized health
              insights. Please select your role to begin.
            </p>
          </div>
          <div className="flex flex-col gap-4 min-[400px]:flex-row">
            <Link href="/register" passHref>
              <Button size="lg">
                <User className="mr-2" />
                Individual User
              </Button>
            </Link>
            <Link href="/doctor-portal" passHref>
              <Button size="lg" variant="secondary">
                <Stethoscope className="mr-2" />
                For Medical Professionals
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
