
// This file does NOT have 'use server'. It only defines tools.

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// This state is now managed in appointment-flow.ts
// We are passing it in here to avoid circular dependencies and 'use server' issues.
let _appointments: any[] = []; 
let _prescriptions: any[] = [];
let _labTests: any[] = [];

const findDoctorsTool = ai.defineTool(
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
    // For this example, we'll recommend the first doctor if symptoms are present.
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

const bookAppointmentTool = ai.defineTool(
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
    _appointments.push(newAppointment); // This will be managed in the main flow
    console.log('New appointment booked:', newAppointment);
    
    return { 
        success: true,
        message: `Appointment confirmed for ${input.patientName} with Dr. ${input.doctorName} on ${input.date} at ${input.time}.`,
        appointment: newAppointment,
    };
  }
);

const viewAppointmentsTool = ai.defineTool(
  {
    name: 'viewAppointments',
    description: "Use this tool to view the user's upcoming and past appointments.",
    inputSchema: z.object({}),
    outputSchema: z.array(z.any()),
  },
  async () => {
    // This now returns a local copy. State is managed in appointment-flow.ts
    return _appointments;
  }
);

const generatePrescriptionTool = ai.defineTool(
  {
    name: 'generatePrescription',
    description: 'Use this tool to generate a prescription for a patient.',
    inputSchema: z.object({
      patientName: z.string().describe("The full name of the patient."),
      doctorName: z.string().describe("The full name of the prescribing doctor."),
      date: z.string().describe('The date of the prescription (e.g., "YYYY-MM-DD").'),
      medications: z.array(z.object({
        name: z.string().describe("The name of the medication."),
        dosage: z.string().describe("The dosage instructions (e.g., '500mg')."),
        frequency: z.string().describe("How often to take the medication (e.g., 'Twice a day')."),
      })).describe("A list of prescribed medications.")
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    console.log('Generating prescription:', input);
    const newPrescription = {
        ...input,
        id: `PRES-${Date.now()}`,
        status: 'Generated',
        disclaimer: 'This is a digitally generated prescription. Please consult your pharmacist.'
    };
    _prescriptions.push(newPrescription);
    return newPrescription;
  }
);

const viewPrescriptionsTool = ai.defineTool(
  {
    name: 'viewPrescriptions',
    description: "Use this tool to view the user's prescriptions.",
    inputSchema: z.object({}),
    outputSchema: z.array(z.any()),
  },
  async () => {
    return _prescriptions;
  }
);

const orderLabTestTool = ai.defineTool(
  {
    name: 'orderLabTest',
    description: 'Use this tool to order a lab test for a patient.',
    inputSchema: z.object({
      patientName: z.string().describe("The full name of the patient."),
      testName: z.string().describe("The name of the lab test to be ordered."),
      doctorName: z.string().describe("The name of the doctor ordering the test."),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    console.log('Ordering lab test:', input);
    const newLabTest = {
      id: `TEST-${Date.now()}`,
      ...input,
      dateOrdered: new Date().toISOString().split('T')[0],
      status: 'Ordered', // Initial status
      reportUrl: null,
    };
    _labTests.push(newLabTest);
    return newLabTest;
  }
);


export { findDoctorsTool, bookAppointmentTool, viewAppointmentsTool, generatePrescriptionTool, viewPrescriptionsTool, orderLabTestTool };
