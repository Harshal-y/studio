'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

let appointments: { doctorId: number, date: string, patientName: string }[] = [];

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
    outputSchema: z.string().describe("A conversational recommendation for a doctor, including their name and specialty. If no suitable doctor is found, this should explain why."),
  },
  async (input) => {
    // In a real app, you would have more complex logic to match doctors.
    // For this example, we'll just recommend the first doctor if symptoms are present.
    if (input.doctors.length > 0 && input.symptoms) {
        const recommendedDoctor = input.doctors[0];
        return `Based on your symptoms, I recommend Dr. ${recommendedDoctor.name}, who is a specialist in ${recommendedDoctor.specialty}. Would you like to book an appointment with them?`;
    }
    return "I couldn't find a suitable doctor based on the information provided. Please provide more details about your symptoms.";
  }
);

export const bookAppointmentTool = ai.defineTool(
  {
    name: 'bookAppointment',
    description: 'Use this tool to book an appointment with a doctor.',
    inputSchema: z.object({
      doctorId: z.number().describe("The ID of the doctor."),
      date: z.string().describe('The date for the appointment (e.g., "YYYY-MM-DD").'),
      patientName: z.string().describe("The name of the patient."),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    appointments.push(input);
    console.log('New appointment booked:', input);
    return `Appointment confirmed for ${input.patientName} with doctor ID ${input.doctorId} on ${input.date}.`;
  }
);

export const viewAppointmentsTool = ai.defineTool(
  {
    name: 'viewAppointments',
    description: "Use this tool to view the user's upcoming appointments.",
    inputSchema: z.object({}),
    outputSchema: z.string(),
  },
  async () => {
    if (appointments.length === 0) {
      return 'You have no upcoming appointments.';
    }
    const appointmentList = appointments.map(
      (appt) => `- Appointment for ${appt.patientName} with doctor ID ${appt.doctorId} on ${appt.date}`
    ).join('\n');
    return `Here are your upcoming appointments:\n${appointmentList}`;
  }
);
