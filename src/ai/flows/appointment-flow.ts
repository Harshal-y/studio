
'use server';
/**
 * @fileOverview An AI flow that recommends doctors and books appointments.
 *
 * - appointmentFlow - A function that handles the doctor recommendation and appointment booking process.
 * - AppointmentFlowInput - The input type for the appointmentFlow function.
 * - AppointmentFlowOutput - The return type for the appointmentFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { findDoctorsTool, bookAppointmentTool, viewAppointmentsTool } from './appointment-tool';

export let appointments: { id: number, doctorId: number, doctorName: string, date: string, time: string, patientName: string, issue: string }[] = [];


const AppointmentFlowInputSchema = z.object({
  symptoms: z.string().optional().describe("The user's current symptoms."),
  issue: z.string().optional().describe("The user's primary health issue."),
  history: z.string().optional().describe("The user's relevant medical history."),
  doctors: z.array(z.any()).describe('A list of available verified doctors.'),
  prompt: z.string().describe('The user\'s raw text input.'),
});
export type AppointmentFlowInput = z.infer<typeof AppointmentFlowInputSchema>;

const AppointmentFlowOutputSchema = z.object({
  response: z
    .string()
    .describe(
      'A conversational response to the user. This could be a recommendation, a confirmation, or a question.'
    ),
});
export type AppointmentFlowOutput = z.infer<typeof AppointmentFlowOutputSchema>;


const prompt = ai.definePrompt({
  name: 'appointmentPrompt',
  input: { schema: AppointmentFlowInputSchema },
  output: { schema: AppointmentFlowOutputSchema },
  tools: [findDoctorsTool, bookAppointmentTool, viewAppointmentsTool],
  prompt: `You are a helpful AI assistant in a healthcare app. Your role is to help users find doctors and book appointments.

You have access to two tools:
- 'findDoctors': Recommends a doctor based on symptoms.
- 'bookAppointment': Books an appointment with a specified doctor on a specific date.

Analyze the user's prompt to determine their intent.

- If they want to find a doctor, use the 'findDoctors' tool. Use the provided symptoms, issue, and history from the user input.
- If they want to book an appointment, use the 'bookAppointment' tool. You will need a doctor's ID and a date. If you don't have this information, ask the user for it.
- If they ask to view appointments, you should tell them to use the "View Appointments" tab.

The user's input is:
{{#if symptoms}}Symptoms: {{{symptoms}}}{{/if}}
{{#if issue}}Issue: {{{issue}}}{{/if}}
{{#if history}}Medical History: {{{history}}}{{/if}}
User's message: {{{prompt}}}

Your response should be conversational and helpful. Do not mention the 'viewAppointments' tool.
`,
});


export const appointmentFlow = ai.defineFlow(
  {
    name: 'appointmentFlow',
    inputSchema: AppointmentFlowInputSchema,
    outputSchema: AppointmentFlowOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return { response: output!.response };
  }
);


// Wrapper functions for tools to be called from client components

export async function bookAppointment(input: z.infer<typeof bookAppointmentTool.inputSchema>) {
    const result = await bookAppointmentTool(input);
    if (result.success && result.appointment) {
        appointments.push(result.appointment);
    }
    return result;
}

export async function viewAppointments() {
    return await viewAppointmentsTool({});
}
