

'use client';

import Link from 'next/link';
import {
  Activity,
  Bot,
  CalendarPlus,
  Copy,
  FileText,
  HeartPulse,
  History,
  LogOut,
  Menu,
  PanelLeft,
  PlusCircle,
  Settings,
  Star,
  Users,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DataProvider, useData } from '@/contexts/data-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { AddFamilyMemberDialog } from '@/components/add-family-member-dialog';
import { useToast } from '@/hooks/use-toast';
import { AIChatBot } from '@/components/ai-chat-bot';
import { useRouter, usePathname } from 'next/navigation';
import { AppointmentManager } from '@/components/appointment-manager';
import { AppointmentReminder } from '@/components/appointment-reminder';
import { AppointmentChatbot } from '@/components/appointment-chatbot';
import { cn } from '@/lib/utils';


function ProfileSwitcher() {
  const { currentUser, setCurrentUser, familyMembers, selfUser } = useData();
  const [isAddFamilyDialogOpen, setIsAddFamilyDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  if (!currentUser) return null;

  const copyToClipboard = () => {
    if (currentUser?.deviceCode) {
      navigator.clipboard.writeText(currentUser.deviceCode);
      toast({
        title: 'Copied!',
        description: 'Device code copied to clipboard.',
      });
    }
  };
  
  const otherFamilyMembers = familyMembers.filter(m => m.id !== selfUser?.id);

  const handleLogout = () => {
    router.push('/');
  }

  return (
    <>
    <AddFamilyMemberDialog open={isAddFamilyDialogOpen} onOpenChange={setIsAddFamilyDialogOpen} />
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage
              src={currentUser.avatar}
              alt={currentUser.name}
              data-ai-hint="person face"
            />
            <AvatarFallback>
              {currentUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {currentUser.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-2 py-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> Points
            </span>
            <span className="font-semibold text-foreground">{currentUser.points || 0}</span>
        </div>


        {selfUser?.deviceCode && (
           <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Your Device Code</DropdownMenuLabel>
             <div className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground">
                <span>{selfUser.deviceCode}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyToClipboard}>
                    <Copy className="h-3 w-3" />
                </Button>
            </div>
           </>
        )}

        <DropdownMenuSeparator />
        
        {selfUser && (
          <>
            <DropdownMenuLabel>Your Account</DropdownMenuLabel>
            <DropdownMenuItem
            onClick={() => setCurrentUser(selfUser)}
            disabled={selfUser.id === currentUser.id}
            >
            {selfUser.name}
            </DropdownMenuItem>
          </>
        )}

        {otherFamilyMembers.length > 0 && (
            <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Family Members</DropdownMenuLabel>
                {otherFamilyMembers.map((member) => (
                    <DropdownMenuItem
                    key={member.id}
                    onClick={() => setCurrentUser(member)}
                    disabled={member.id === currentUser.id}
                    >
                    {member.name}
                    </DropdownMenuItem>
                ))}
            </>
        )}


         <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setIsAddFamilyDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Family Member
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
}


function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const [isAppointmentManagerOpen, setIsAppointmentManagerOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: HeartPulse, label: 'Dashboard' },
    { href: '/dashboard/records', icon: FileText, label: 'Records' },
    { href: '#', icon: Bot, label: 'AI Insights' },
    { href: '#', icon: Users, label: 'Family' },
  ];

  return (
    <>
    <AppointmentManager open={isAppointmentManagerOpen} onOpenChange={setIsAppointmentManagerOpen} />
    <AppointmentReminder />
    <AppointmentChatbot />
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Activity className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">TrackWell</span>
          </Link>
          <TooltipProvider>
            {navItems.map((item) => (
                <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                        <Link
                        href={item.href}
                        className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                            pathname === item.href && "bg-accent text-accent-foreground"
                        )}
                        >
                        <item.icon className="h-5 w-5" />
                        <span className="sr-only">{item.label}</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:static sm:h-auto sm:justify-end sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Logo />
                 {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                        pathname === item.href && "text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground justify-start text-lg font-medium"
                  onClick={() => setIsAppointmentManagerOpen(true)}
                >
                  <CalendarPlus className="h-5 w-5" />
                  Book Appointment
                </Button>
                <Link
                  href="/dashboard/records"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <FileText className="h-5 w-5" />
                  Records
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="relative flex-1 md:grow-0">
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="hidden sm:flex"
              onClick={() => setIsAppointmentManagerOpen(true)}
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
            <ProfileSwitcher />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        <AIChatBot />
      </div>
    </div>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DataProvider>
  );
}
