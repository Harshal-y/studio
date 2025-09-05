'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating personalized health insights and recommendations based on user health data.
 *
 * - generatePersonalizedHealthInsights - A function that orchestrates the generation of personalized health insights.
 * - PersonalizedHealthInsightsInput - The input type for the generatePersonalizedHealthInsights function.
 * - PersonalizedHealthInsightsOutput - The output type for the generatePersonalizedHealthInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedHealthInsightsInputSchema = z.object({
  healthData: z
    .string()
    .describe(
      'A string containing the user health data, including vitals, historical trends, and device information.'
    ),
  userPreferences: z
    .string()
    .optional()
    .describe('Optional user preferences or goals related to their health.'),
});
export type PersonalizedHealthInsightsInput = z.infer<
  typeof PersonalizedHealthInsightsInputSchema
>;

const PersonalizedHealthInsightsOutputSchema = z.object({
  insights: z.string().describe('Personalized health insights and recommendations.'),
});
export type PersonalizedHealthInsightsOutput = z.infer<
  typeof PersonalizedHealthInsightsOutputSchema
>;

export async function generatePersonalizedHealthInsights(
  input: PersonalizedHealthInsightsInput
): Promise<PersonalizedHealthInsightsOutput> {
  return generatePersonalizedHealthInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedHealthInsightsPrompt',
  input: {schema: PersonalizedHealthInsightsInputSchema},
  output: {schema: PersonalizedHealthInsightsOutputSchema},
  prompt: `You are an AI health assistant that provides personalized health insights and recommendations based on user health data.

  Analyze the following health data and user preferences (if provided) to generate actionable insights and recommendations. Focus on identifying potential areas for improvement and suggesting lifestyle adjustments.

  Health Data: {{{healthData}}}
  User Preferences: {{{userPreferences}}}

  Provide your analysis and recommendations in a clear, concise, and easy-to-understand manner.
  `,
});

const generatePersonalizedHealthInsightsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedHealthInsightsFlow',
    inputSchema: PersonalizedHealthInsightsInputSchema,
    outputSchema: PersonalizedHealthInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
