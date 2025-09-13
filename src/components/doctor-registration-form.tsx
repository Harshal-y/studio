'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState, ChangeEvent } from 'react';
import { uploadCertificate } from '@/app/actions';
import { verifyDoctorCertificate } from '@/ai/flows/verify-doctor-certificate-flow';
import { Loader2, UploadCloud } from 'lucide-react';
import { useData } from '@/contexts/data-provider';
import Image from 'next/image';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  degree: z.string().min(2, 'Degree is required.'),
  experience: z.coerce
    .number()
    .min(0, 'Experience must be a positive number.'),
  certificate: z
    .any()
    .refine((files) => files?.length == 1, 'Certificate image is required.')
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
});

export function DoctorRegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { addDoctor } = useData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      degree: '',
      experience: 0,
    },
  });

  const { isSubmitting } = form.formState;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsVerifying(true);
    const formData = new FormData();
    formData.append('certificate', values.certificate[0]);

    try {
      const { fileDataUri, error: uploadError } = await uploadCertificate(formData);

      if (uploadError || !fileDataUri) {
        throw new Error(uploadError || 'Failed to upload certificate.');
      }
      
      const verificationResult = await verifyDoctorCertificate({ certificateDataUri: fileDataUri });

      if (verificationResult.isVerified) {
        addDoctor({
            id: Date.now(),
            name: values.name,
            degree: values.degree,
            experience: values.experience,
            isVerified: true,
            verificationDetails: verificationResult.extractedInfo
        });
        toast({
          title: 'Verification Successful!',
          description: 'Your profile has been verified and added to our network.',
        });
         setTimeout(() => router.push('/dashboard'), 3000);
      } else {
        toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description: verificationResult.reason || 'Could not verify the certificate. Please try again with a clear image.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description:
          'Something went wrong during the verification process. Please try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  }
  
  const fileRef = form.register('certificate');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Dr. John Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="degree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Highest Degree</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., MD, MBBS" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="certificate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical Certificate</FormLabel>
              <FormControl>
                <div className="relative flex justify-center items-center w-full h-48 border-2 border-dashed rounded-md border-muted-foreground/50 hover:border-primary transition-colors">
                    <Input 
                        type="file" 
                        className="absolute w-full h-full opacity-0 cursor-pointer"
                        {...fileRef}
                        onChange={handleFileChange}
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    />
                    {preview ? (
                         <Image src={preview} alt="Certificate Preview" fill objectFit="contain" className="rounded-md" />
                    ) : (
                        <div className="text-center text-muted-foreground flex flex-col items-center">
                            <UploadCloud className="w-8 h-8 mb-2" />
                            <p>Click to upload or drag & drop</p>
                            <p className="text-xs">PNG, JPG, WEBP (max 5MB)</p>
                        </div>
                    )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting || isVerifying}>
          {(isSubmitting || isVerifying) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isVerifying ? 'Verifying Certificate...' : 'Register & Verify'}
        </Button>
      </form>
    </Form>
  );
}
