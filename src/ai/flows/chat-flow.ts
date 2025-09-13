
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

const ChatInputSchema = z.object({
  prompt: z.string().describe("The user's message to the chatbot."),
  history: z
    .array(z.object({role: z.enum(['user', 'model']), content: z.string()}))
    .optional()
    .describe('The history of the conversation.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe("The chatbot's response to the user."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a friendly and helpful AI assistant for the TrackWell health monitoring app. Your goal is to have a natural, helpful conversation with the user.

You can answer questions about the app's features or discuss general health and wellness topics in a conversational way.

IMPORTANT: You are an AI assistant, not a medical professional. You MUST NOT provide any medical advice, diagnosis, or recommend any specific medicine or medication. If the user asks for medical advice or mentions specific medications, you MUST decline and advise them to consult a qualified doctor or healthcare provider.

Do not answer questions about booking, viewing, or managing appointments. Instead, instruct the user to use the "Appointment Manager" button.

{{#if history}}
Conversation History:
{{#each history}}
{{this.role}}: {{{this.content}}}
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
