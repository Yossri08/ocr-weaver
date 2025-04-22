'use server';
/**
 * @fileOverview A flow for extracting text from an image using OCR and returning data as JSON.
 *
 * - ocrTextExtraction - A function that handles the OCR text extraction process.
 * - OcrTextExtractionInput - The input type for the ocrTextExtraction function.
 * - OcrTextExtractionOutput - The return type for the ocrTextExtraction function, now a JSON string.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const OcrTextExtractionInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the image to extract text from.'),
});
export type OcrTextExtractionInput = z.infer<typeof OcrTextExtractionInputSchema>;

const OcrTextExtractionOutputSchema = z.object({
  extractedData: z.string().describe('The extracted data from the image, formatted as a JSON string.'),
});
export type OcrTextExtractionOutput = z.infer<typeof OcrTextExtractionOutputSchema>;

export async function ocrTextExtraction(input: OcrTextExtractionInput): Promise<OcrTextExtractionOutput> {
  return ocrTextExtractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ocrTextExtractionPrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the image to extract text from.'),
    }),
  },
  output: {
    schema: z.object({
      extractedData: z.string().describe('The extracted data from the image, formatted as a JSON string.'),
    }),
  },
  prompt: `You are an expert OCR and data structuring specialist. Analyze the image at the following URL:\n\n{{media url=photoUrl}}\n\nIdentify if there is a table in the image. If a table is present, extract the data and structure it into a JSON array of objects. Each object should represent a row in the table, with keys corresponding to the column headers. Ensure the JSON is valid and parsable.\n\nIf no table is present, extract the relevant text from the image and return it as a JSON string with a single key "text".\n\nOutput (JSON format):`,
});

const ocrTextExtractionFlow = ai.defineFlow<
  typeof OcrTextExtractionInputSchema,
  typeof OcrTextExtractionOutputSchema
>({
  name: 'ocrTextExtractionFlow',
  inputSchema: OcrTextExtractionInputSchema,
  outputSchema: OcrTextExtractionOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return {extractedData: output!.extractedData};
});
