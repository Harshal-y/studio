
// This file does NOT have 'use server'. It only defines tools.

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { appointments } from './appointment-flow';

export const findDoctorsTool = ai.defineTool(
  {
    name: 'findDoctors',
    description:
      "Use this tool to find a doctor based on the user's symptoms, issue, and medical history.",
    inputSchema: z.object({
        doctors: z.array(z.any()).describe('A list of available verified doctors.'),
        symptoms: z.string().describe("The user's current symptoms."),
        issue: z.string().describe("The user's primary health issue."),
        history: z.string().optional().describe("The user's relevant medical history."),
    }),
    outputSchema: z.object({
        recommendation: z.string().describe("A conversational recommendation for a doctor, including their name and specialty. If no suitable doctor is found, this should explain why."),
        recommendedDoctorId: z.number().optional().describe("The ID of the recommended doctor, if one is found."),
    }),
  },
  async (input) => {
    // In a real app, you would have more complex logic to match doctors.
    // For this example, we'll just recommend the first doctor if symptoms are present.
    if (input.doctors.length > 0 && (input.symptoms || input.issue)) {
        const recommendedDoctor = input.doctors[0];
        return {
            recommendation: `Based on your information, I recommend Dr. ${recommendedDoctor.name}, who is a specialist in ${recommendedDoctor.specialty || 'General Medicine'}.`,
            recommendedDoctorId: recommendedDoctor.id,
        }
    }
    return {
        recommendation: "I couldn't find a suitable doctor based on the information provided. Please provide more details about your symptoms or issue."
    };
  }
);

export const bookAppointmentTool = ai.defineTool(
  {
    name: 'bookAppointment',
    description: 'Use this tool to book an appointment with a doctor.',
    inputSchema: z.object({
      doctorId: z.number().describe("The ID of the doctor."),
      doctorName: z.string().describe("The name of the doctor."),
      date: z.string().describe('The date for the appointment (e.g., "YYYY-MM-DD").'),
      time: z.string().describe('The time for the appointment (e.g., "HH:MM").'),
      patientName: z.string().describe("The name of the patient."),
      issue: z.string().describe("The primary health issue for the appointment."),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        message: z.string(),
        appointment: z.any().optional(),
    }),
  },
  async (input) => {
    const newAppointment = { ...input, id: Date.now() };
    console.log('New appointment booked:', newAppointment);
    
    return { 
        success: true,
        message: `Appointment confirmed for ${input.patientName} with Dr. ${input.doctorName} on ${input.date} at ${input.time}.`,
        appointment: newAppointment,
    };
  }
);

export const viewAppointmentsTool = ai.defineTool(
  {
    name: 'viewAppointments',
    description: "Do not use this tool. This is a placeholder.",
    inputSchema: z.object({}),
    outputSchema: z.array(z.any()),
  },
  async () => {
    // In a real app, you would filter by user ID
    return appointments;
  }
);
