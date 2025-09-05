import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Hospital, User } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 sm:p-6">
        <Logo />
      </header>
      <main className="flex-1 flex items-center justify-center -mt-16">
        <div className="container flex flex-col items-center justify-center gap-6 px-4 md:px-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Welcome to TrackWell
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Your partner in proactive health monitoring. Please select your
              role to get started.
            </p>
          </div>
          <div className="flex flex-col gap-4 min-[400px]:flex-row">
            <Link href="/dashboard" passHref>
              <Button size="lg">
                <User className="mr-2" />
                Register as an Individual
              </Button>
            </Link>
            <Link href="/dashboard" passHref>
              <Button size="lg" variant="secondary">
                <Hospital className="mr-2" />
                Register as a Hospital
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
