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
  prompt: z.string().describe('The user\'s message to the chatbot.'),
  history: z
    .array(z.object({role: z.enum(['user', 'model']), content: z.string()}))
    .optional()
    .describe('The history of the conversation.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s response to the user.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a friendly and helpful AI assistant for the TrackWell health monitoring app.

Your goal is to answer user questions about their health data, the app's features, or general health topics. Be concise and encouraging.

Use the provided conversation history to maintain context.

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
