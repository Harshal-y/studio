import { DoctorRegistrationForm } from '@/components/doctor-registration-form';
import { Logo } from '@/components/logo';
import { DataProvider } from '@/contexts/data-provider';

export default function RegisterDoctorPage() {
  return (
    <DataProvider>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>
          <h1 className="mb-2 text-center text-3xl font-bold">
            Doctor Registration
          </h1>
          <p className="mb-8 text-center text-muted-foreground">
            Join our network of trusted medical professionals.
          </p>
          <DoctorRegistrationForm />
        </div>
      </div>
    </DataProvider>
  );
}
