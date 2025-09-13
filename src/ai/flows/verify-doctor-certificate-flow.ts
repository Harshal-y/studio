'use server';
/**
 * @fileOverview Verifies a doctor's certificate using AI.
 *
 * - verifyDoctorCertificate - A function that verifies a doctor's certificate.
 * - VerifyDoctorCertificateInput - The input type for the verifyDoctorCertificate function.
 * - VerifyDoctorCertificateOutput - The return type for the verifyDoctorCertificate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyDoctorCertificateInputSchema = z.object({
  certificateDataUri: z
    .string()
    .describe(
      "A photo of the doctor's certificate, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VerifyDoctorCertificateInput = z.infer<
  typeof VerifyDoctorCertificateInputSchema
>;

const VerifyDoctorCertificateOutputSchema = z.object({
  isVerified: z.boolean().describe('Whether the certificate is verified.'),
  extractedInfo: z
    .object({
      name: z.string().optional().describe('The name of the doctor.'),
      institution: z.string().optional().describe('The issuing institution.'),
      date: z.string().optional().describe('The date of issuance.'),
    })
    .optional()
    .describe('Extracted information from the certificate.'),
  reason: z
    .string()
    .optional()
    .describe('The reason for the verification status.'),
});
export type VerifyDoctorCertificateOutput = z.infer<
  typeof VerifyDoctorCertificateOutputSchema
>;

export async function verifyDoctorCertificate(
  input: VerifyDoctorCertificateInput
): Promise<VerifyDoctorCertificateOutput> {
  return verifyDoctorCertificateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyDoctorCertificatePrompt',
  input: {schema: VerifyDoctorCertificateInputSchema},
  output: {schema: VerifyDoctorCertificateOutputSchema},
  prompt: `You are an expert in verifying medical certifications. Analyze the provided certificate image.

  1.  Determine if the document appears to be a legitimate medical certificate.
  2.  Extract the doctor's full name, the name of the issuing institution, and the date of issuance.
  3.  Based on your analysis, set 'isVerified' to true if it seems legitimate, or false otherwise.
  4.  If 'isVerified' is false, provide a brief reason.

  Certificate Image: {{media url=certificateDataUri}}`,
});

const verifyDoctorCertificateFlow = ai.defineFlow(
  {
    name: 'verifyDoctorCertificateFlow',
    inputSchema: VerifyDoctorCertificateInputSchema,
    outputSchema: VerifyDoctorCertificateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
