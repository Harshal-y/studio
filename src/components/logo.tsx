import { Activity } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="TrackWell app logo">
      <Activity className="size-7 text-primary" />
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        TrackWell
      </h1>
    </div>
  );
}
