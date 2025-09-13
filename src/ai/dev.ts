import { config } from 'dotenv';
config();

import '@/ai/flows/generate-personalized-health-insights.ts';
import '@/ai/flows/generate-health-trend-summaries.ts';
import '@/ai/flows/chat-flow.ts';
import '@/ai/flows/verify-doctor-certificate-flow.ts';
import '@/ai/flows/doctor-directory-flow.ts';
