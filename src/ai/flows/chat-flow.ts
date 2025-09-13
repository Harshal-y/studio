'use server';
/**
 * @fileOverview A conversational AI flow for the TrackWell health assistant.
 *
 * - chat - A function that handles the chatbot conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { findDoctorsTool, bookAppointmentTool, viewAppointmentsTool } from './appointment-tool';
import { Doctor } from '@/contexts/data-provider';

const ChatInputSchema = z.object({
  prompt: z.string().describe("The user\'s message to the chatbot."),
  history: z
    .array(z.object({role: z.enum(['user', 'model']), content: z.string()}))
    .optional()
    .describe('The history of the conversation.'),
  doctors: z.array(z.any()).optional().describe('A list of available verified doctors.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe("The chatbot\'s response to the user."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  tools: [findDoctorsTool, bookAppointmentTool, viewAppointmentsTool],
  prompt: `You are a friendly and helpful AI assistant for the TrackWell health monitoring app.

Your goal is to answer user questions about their health data, the app's features, or general health topics. You can also help users find doctors, book appointments, and view their existing appointments.

Use the provided conversation history to maintain context.

If the user asks to find a doctor, use the 'findDoctors' tool.
If the user asks to book an appointment, use the 'bookAppointment' tool. You will likely need to ask clarifying questions to get the required doctorId and date.
If the user asks to see their appointments, use the 'viewAppointments' tool.

{{#if history}}
Conversation History:
{{#each history}}
{{#if (eq this.role 'user')}}
User: {{{this.content}}}
{{/if}}
{{#if (eq this.role 'model')}}
Assistant: {{{this.content}}}
{{/if}}
{{/each}}
{{/if}}

User's new message: {{{prompt}}}

Assistant's response:
`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {response: output!.response};
  }
);
