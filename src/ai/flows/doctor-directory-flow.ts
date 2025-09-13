'use server';
/**
 * @fileOverview An AI flow that recommends doctors to patients based on their symptoms.
 *
 * - findDoctor - A function that handles the doctor recommendation process.
 * - FindDoctorInput - The input type for the findDoctor function.
 * - FindDoctorOutput - The return type for the findDoctor function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Doctor } from '@/contexts/data-provider';

const FindDoctorInputSchema = z.object({
  symptoms: z.string().describe("The user's current symptoms."),
  issue: z.string().describe("The user's primary health issue."),
  history: z.string().optional().describe("The user's relevant medical history."),
  doctors: z.array(z.any()).describe('A list of available verified doctors.'),
});
export type FindDoctorInput = z.infer<typeof FindDoctorInputSchema>;

const FindDoctorOutputSchema = z.object({
  recommendation: z
    .string()
    .describe(
      'A conversational recommendation for a doctor, including their name and specialty. If no suitable doctor is found, this should explain why.'
    ),
  doctorId: z.number().optional().describe("The ID of the recommended doctor."),
});
export type FindDoctorOutput = z.infer<typeof FindDoctorOutputSchema>;

export async function findDoctor(
  input: FindDoctorInput
): Promise<FindDoctorOutput> {
  return doctorDirectoryFlow(input);
}

const findDoctorsTool = ai.defineTool(
  {
    name: 'findDoctors',
    description:
      'Provides a list of available doctors to recommend to the user.',
    inputSchema: z.object({
        doctors: z.array(z.any()),
    }),
    outputSchema: z.array(z.any()),
  },
  async (input) => {
    return input.doctors;
  }
);


const prompt = ai.definePrompt({
  name: 'doctorDirectoryPrompt',
  input: { schema: FindDoctorInputSchema },
  output: { schema: FindDoctorOutputSchema },
  tools: [findDoctorsTool],
  prompt: `You are a helpful AI assistant in a healthcare app. Your role is to recommend a doctor to a user based on their symptoms.

You have access to a tool called 'findDoctors' which contains a list of available doctors.

Analyze the user's symptoms, issue, and medical history to understand their needs. Then, use the 'findDoctors' tool to find the most suitable doctor from the list.

The user's input is:
Symptoms: {{{symptoms}}}
Issue: {{{issue}}}
{{#if history}}
Medical History: {{{history}}}
{{/if}}

Your recommendation should be conversational and helpful. Explain why you are recommending a particular doctor. If you find a suitable doctor, provide their name and set the doctorId in the output. If no doctor seems suitable, explain that and suggest they consult a general physician.
`,
});


const doctorDirectoryFlow = ai.defineFlow(
  {
    name: 'doctorDirectoryFlow',
    inputSchema: FindDoctorInputSchema,
    outputSchema: FindDoctorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
