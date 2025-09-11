import { RegistrationForm } from '@/components/registration-form';
import { Logo } from '@/components/logo';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-2 text-center text-3xl font-bold">
          Create Your Account
        </h1>
        <p className="mb-8 text-center text-muted-foreground">
          Start your journey to better health monitoring.
        </p>
        <RegistrationForm />
      </div>
    </div>
  );
}
