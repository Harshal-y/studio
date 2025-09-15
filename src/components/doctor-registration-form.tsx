
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState, ChangeEvent, DragEvent, useEffect } from 'react';
import { uploadCertificate } from '@/app/actions';
import { verifyDoctorCertificate } from '@/ai/flows/verify-doctor-certificate-flow';
import { Loader2, UploadCloud } from 'lucide-react';
import { useData } from '@/contexts/data-provider';
import Image from 'next/image';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const formSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    degree: z.string().min(1, 'A degree must be selected.'),
    otherDegree: z.string().optional(),
    experience: z.coerce
      .number()
      .min(0, 'Experience must be a non-negative number.'),
    certificate: z
      .any()
      .refine((files) => files?.length == 1, 'Certificate file is required.')
      .refine(
        (files) => files?.[0]?.size <= MAX_FILE_SIZE,
        `Max file size is 5MB.`
      )
      .refine(
        (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
        'Only .jpg, .jpeg, .png, .webp, and .pdf files are accepted.'
      ),
  })
  .superRefine((data, ctx) => {
    if (data.degree === 'Other' && !data.otherDegree) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['otherDegree'],
        message: 'Please specify your degree.',
      });
    }
  });

const doctorDegrees = [
  'MD (Doctor of Medicine)',
  'DO (Doctor of Osteopathic Medicine)',
  'MBBS (Bachelor of Medicine, Bachelor of Surgery)',
  'PhD (Doctor of Philosophy)',
  'DDS (Doctor of Dental Surgery)',
  'DVM (Doctor of Veterinary Medicine)',
  'Other',
];

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
      otherDegree: '',
      experience: 0,
    },
  });
  
  useEffect(() => {
    const preventDefaults = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false)
    });

    return () => {
       ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.removeEventListener(eventName, preventDefaults, false)
       });
    };
  }, []);

  const { isSubmitting } = form.formState;
  const watchedDegree = form.watch('degree');

  const handleFileSelect = (file: File | null) => {
    if (file) {
      // Manually set the value for react-hook-form
      form.setValue('certificate', [file], { shouldValidate: true });

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        setPreview('pdf');
      } else {
        setPreview(null);
      }
    } else {
      form.resetField('certificate');
      setPreview(null);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0] || null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsVerifying(true);
    const formData = new FormData();
    formData.append('certificate', values.certificate[0]);

    try {
      const { fileDataUri, error: uploadError } =
        await uploadCertificate(formData);

      if (uploadError || !fileDataUri) {
        throw new Error(uploadError || 'Failed to upload certificate.');
      }

      // Simulate verification delay
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 3000 + 2000)
      );

      const verificationResult = await verifyDoctorCertificate({
        certificateDataUri: fileDataUri,
      });

      if (verificationResult.isVerified) {
        const finalDegree =
          values.degree === 'Other' ? values.otherDegree! : values.degree;
        addDoctor({
          id: Date.now(),
          name: values.name,
          degree: finalDegree,
          experience: values.experience,
          isVerified: true,
          verificationDetails: verificationResult.extractedInfo,
        });
        toast({
          title: 'Verification Successful!',
          description:
            'Your profile has been verified and added. Redirecting...',
        });
        setTimeout(() => router.push('/doctor-portal'), 3000);
      } else {
        toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description:
            verificationResult.reason ||
            'Could not verify the certificate. Please try again with a clear file.',
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a degree" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctorDegrees.map((degree) => (
                      <SelectItem key={degree} value={degree}>
                        {degree}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g., 10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {watchedDegree === 'Other' && (
          <FormField
            control={form.control}
            name="otherDegree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Please Specify Degree</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., DM in Cardiology" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="certificate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical License/Certificate</FormLabel>
              <FormControl>
                <div
                  className="relative flex justify-center items-center w-full h-48 border-2 border-dashed rounded-md border-muted-foreground/50 hover:border-primary transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Input
                    type="file"
                    className="absolute w-full h-full opacity-0 cursor-pointer"
                    {...fileRef}
                    onChange={handleFileChange}
                    accept={ACCEPTED_FILE_TYPES.join(',')}
                  />
                  {preview === 'pdf' ? (
                    <div className="text-center text-muted-foreground flex flex-col items-center">
                      <UploadCloud className="w-8 h-8 mb-2 text-primary" />
                      <p>PDF file selected</p>
                      <p className="text-xs">
                        {form.getValues('certificate')?.[0]?.name}
                      </p>
                    </div>
                  ) : preview ? (
                    <Image
                      src={preview}
                      alt="Certificate Preview"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-md"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground flex flex-col items-center pointer-events-none">
                      <UploadCloud className="w-8 h-8 mb-2" />
                      <p>Click to upload or drag & drop</p>
                      <p className="text-xs">Image or PDF (max 5MB)</p>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isVerifying}
        >
          {(isSubmitting || isVerifying) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isVerifying ? 'Verifying Certificate...' : 'Register & Verify'}
        </Button>
      </form>
    </Form>
  );
}
