import { Dashboard } from '@/components/dashboard';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Dashboard />
      </main>
    </div>
  );
}
