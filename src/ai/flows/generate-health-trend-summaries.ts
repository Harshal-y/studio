'use server';

/**
 * @fileOverview Generates summaries of health trends, looking for abnormal correlations.
 *
 * - generateHealthTrendSummaries - A function that generates health trend summaries.
 * - GenerateHealthTrendSummariesInput - The input type for the generateHealthTrendSummaries function.
 * - GenerateHealthTrendSummariesOutput - The return type for the generateHealthTrendSummaries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHealthTrendSummariesInputSchema = z.object({
  healthData: z.string().describe('A stringified JSON array of health data objects, each containing vital signs like heart rate, oxygen saturation, body temperature, hydration levels, and timestamps.'),
});
export type GenerateHealthTrendSummariesInput = z.infer<typeof GenerateHealthTrendSummariesInputSchema>;

const GenerateHealthTrendSummariesOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of health trends, including any abnormal correlations found in the health data.'),
});
export type GenerateHealthTrendSummariesOutput = z.infer<typeof GenerateHealthTrendSummariesOutputSchema>;

export async function generateHealthTrendSummaries(input: GenerateHealthTrendSummariesInput): Promise<GenerateHealthTrendSummariesOutput> {
  return generateHealthTrendSummariesFlow(input);
}

const analyzeHealthData = ai.defineTool({
  name: 'analyzeHealthData',
  description: 'Analyzes health data for trends and correlations.',
  inputSchema: z.object({
    healthData: z.string().describe('A stringified JSON array of health data objects.'),
  }),
  outputSchema: z.string().describe('A comprehensive analysis of health trends, including any abnormal correlations found in the health data.'),
}, async (input) => {
  try {
    const healthData = JSON.parse(input.healthData);
    // Basic analysis - replace with actual analysis logic
    let summary = `Analyzed ${healthData.length} health data points.`;
    return summary;
  } catch (e) {
    console.error('Error parsing health data:', e);
    return 'Error analyzing health data.';
  }
});

const prompt = ai.definePrompt({
  name: 'generateHealthTrendSummariesPrompt',
  tools: [analyzeHealthData],
  input: {schema: GenerateHealthTrendSummariesInputSchema},
  output: {schema: GenerateHealthTrendSummariesOutputSchema},
  prompt: `You are an AI health analyst. Analyze the provided health data and generate a summary of the health trends, looking for abnormal correlations.

Health Data: {{{healthData}}}

Use the analyzeHealthData tool to analyze the health data.

Summary:`, 
});

const generateHealthTrendSummariesFlow = ai.defineFlow(
  {
    name: 'generateHealthTrendSummariesFlow',
    inputSchema: GenerateHealthTrendSummariesInputSchema,
    outputSchema: GenerateHealthTrendSummariesOutputSchema,
  },
  async input => {
    const {output} = await prompt({
      healthData: input.healthData,
    });
    return output!;
  }
);
