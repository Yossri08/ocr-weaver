'use server';
/**
 * @fileOverview A flow for extracting text from an image using OCR.
 *
 * - ocrTextExtraction - A function that handles the OCR text extraction process.
 * - OcrTextExtractionInput - The input type for the ocrTextExtraction function.
 * - OcrTextExtractionOutput - The return type for the ocrTextExtraction function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const OcrTextExtractionInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the image to extract text from.'),
});
export type OcrTextExtractionInput = z.infer<typeof OcrTextExtractionInputSchema>;

const OcrTextExtractionOutputSchema = z.object({
  extractedText: z.string().describe('The extracted text from the image.'),
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
      extractedText: z.string().describe('The extracted text from the image.'),
    }),
  },
  prompt: `You are an OCR expert. Extract the text from the image at the following URL:\n\n{{media url=photoUrl}}\n\nExtracted Text:`, // No Handlebars in this part
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
  return output!;
});

