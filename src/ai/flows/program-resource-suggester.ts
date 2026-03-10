'use server';
/**
 * @fileOverview A Genkit flow for suggesting courses, clubs, and campus resources
 * based on a user's undergraduate program.
 *
 * - suggestProgramResources - A function that handles the resource suggestion process.
 * - ProgramResourceSuggesterInput - The input type for the suggestProgramResources function.
 * - ProgramResourceSuggesterOutput - The return type for the suggestProgramResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const ProgramResourceSuggesterInputSchema = z.object({
  undergraduateProgram: z.string().describe('The user\'s selected undergraduate program.'),
});
export type ProgramResourceSuggesterInput = z.infer<typeof ProgramResourceSuggesterInputSchema>;

// Output Schema
const ProgramResourceSuggesterOutputSchema = z.object({
  courses: z.array(z.string()).describe('A list of suggested courses relevant to the program.'),
  clubs: z.array(z.string()).describe('A list of suggested clubs relevant to the program.'),
  campusResources: z.array(z.string()).describe('A list of suggested campus resources relevant to the program.'),
});
export type ProgramResourceSuggesterOutput = z.infer<typeof ProgramResourceSuggesterOutputSchema>;

// Wrapper function
export async function suggestProgramResources(
  input: ProgramResourceSuggesterInput
): Promise<ProgramResourceSuggesterOutput> {
  return programResourceSuggesterFlow(input);
}

// Define the prompt
const programResourcePrompt = ai.definePrompt({
  name: 'programResourcePrompt',
  input: {schema: ProgramResourceSuggesterInputSchema},
  output: {schema: ProgramResourceSuggesterOutputSchema},
  prompt: `You are an intelligent assistant that helps university students discover relevant opportunities.
Based on the provided undergraduate program, suggest courses, clubs, and campus resources that would be beneficial or interesting for a student in that program.
Provide at least 3 suggestions for each category. If you cannot think of a specific suggestion, you can make a reasonable, plausible suggestion.

Undergraduate Program: {{{undergraduateProgram}}}`,
});

// Define the flow
const programResourceSuggesterFlow = ai.defineFlow(
  {
    name: 'programResourceSuggesterFlow',
    inputSchema: ProgramResourceSuggesterInputSchema,
    outputSchema: ProgramResourceSuggesterOutputSchema,
  },
  async (input) => {
    const {output} = await programResourcePrompt(input);
    return output!;
  }
);
