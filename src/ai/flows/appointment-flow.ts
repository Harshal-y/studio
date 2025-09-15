
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
import { findDoctorsTool, bookAppointmentTool, viewAppointmentsTool, generatePrescriptionTool, viewPrescriptionsTool } from './appointment-tool';

let appointments: { id: number, doctorId: number, doctorName: string, date: string, time: string, patientName: string, issue: string }[] = [];
let prescriptions: any[] = [];


const AppointmentFlowInputSchema = z.object({
  symptoms: z.string().optional().describe("The user's current symptoms."),
  issue: z.string().optional().describe("The user's primary health issue."),
  history: z.string().optional().describe("The user's relevant medical history."),
  doctors: z.array(z.any()).describe('A list of available verified doctors.'),
  prompt: z.string().describe('The user\'s raw text input.'),
  patientName: z.string().optional().describe("The patient's name for the prescription."),
});
export type AppointmentFlowInput = z.infer<typeof AppointmentFlowInputSchema>;

const AppointmentFlowOutputSchema = z.object({
  response: z
    .string()
    .describe(
      'A conversational response to the user. This could be a recommendation, a confirmation, or a question.'
    ),
  prescription: z.any().optional().describe("The generated prescription object, if any.")
});
export type AppointmentFlowOutput = z.infer<typeof AppointmentFlowOutputSchema>;


const prompt = ai.definePrompt({
  name: 'appointmentPrompt',
  input: { schema: AppointmentFlowInputSchema },
  output: { schema: AppointmentFlowOutputSchema },
  tools: [findDoctorsTool, bookAppointmentTool, viewAppointmentsTool, generatePrescriptionTool, viewPrescriptionsTool],
  prompt: `You are a helpful AI assistant in a healthcare app. Your role is to help users find doctors, book appointments, and generate prescriptions based on a doctor's instructions.
You have access to several tools:
- 'findDoctors': Recommends a doctor based on symptoms.
- 'bookAppointment': Books an appointment with a specified doctor on a specific date.
- 'generatePrescription': Creates a prescription document. Use this ONLY when a doctor provides explicit medication details in the prompt.
- 'viewAppointments': Retrieves a list of the user's appointments.
- 'viewPrescriptions': Retrieves a list of the user's prescriptions.

Analyze the user's prompt to determine their intent.
- If they want to find a doctor, use the 'findDoctors' tool.
- If they want to book an appointment, use the 'bookAppointment' tool.
- If the prompt contains information from a doctor about specific medicines, use the 'generatePrescription' tool. You must have the patient's name, doctor's name, and at least one medication with dosage. If you are missing information, ask for it. For example, if a doctor says "Prescribe Crocin 500mg twice a day", you should ask for the patient's name. Assume the doctor is the one interacting with you.
- If they ask to view appointments, use the 'viewAppointments' tool.
- If they ask to view prescriptions, use the 'viewPrescriptions' tool.

The user's input is:
{{#if symptoms}}Symptoms: {{{symptoms}}}{{/if}}{#if issue}}Issue: {{{issue}}}{{/if}}{#if history}}Medical History: {{{history}}}{{/if}}
User's message: {{{prompt}}}
Your response should be conversational and helpful.`,
});


const internalAppointmentFlow = ai.defineFlow(
  {
    name: 'appointmentFlow',
    inputSchema: AppointmentFlowInputSchema,
    outputSchema: AppointmentFlowOutputSchema,
  },
  async (input) => {
    const { output, history } = await prompt(input);

    const prescriptionToolCall = history.find(m => m.role === 'model' && m.content.some(p => p.toolRequest?.name === 'generatePrescription'));
    
    if (prescriptionToolCall) {
        const prescriptionToolResponse = history.find(m => m.role === 'tool' && m.content.some(p => p.toolResponse?.name === 'generatePrescription'));
        if (prescriptionToolResponse) {
             const prescription = prescriptionToolResponse.content[0].toolResponse!.response;
             prescriptions.push(prescription); // Save the prescription
             return { response: output!.response, prescription: prescription };
        }
    }
   
    return { response: output!.response };
  }
);

// Export an async wrapper function
export async function appointmentFlow(input: AppointmentFlowInput): Promise<AppointmentFlowOutput> {
  return internalAppointmentFlow(input);
}


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

export async function viewPrescriptions() {
    return await viewPrescriptionsTool({});
}
