'use client';

import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ocrTextExtraction } from '@/ai/flows/ocr-text-extraction';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { ModeToggle } from '@/components/mode-toggle';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";
import * as React from 'react';
import { useRouter } from 'next/navigation'; // ← Ajouté pour la navigation

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter(); // ← Ajouté

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleTextExtraction = useCallback(async () => {
    if (!imageUrl) {
      toast({ title: 'Please upload an image first.' });
      return;
    }

    setLoading(true);
    try {
      const result = await ocrTextExtraction({ photoUrl: imageUrl });
      setExtractedText(result.extractedData);
      toast({ title: 'Text extracted successfully!' });
    } catch (error: any) {
      console.error('Error extracting text:', error);
      toast({
        title: 'Error extracting text.',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [imageUrl, toast]);

  const handleCopyToClipboard = useCallback(() => {
    if (!extractedText) {
      toast({ title: 'No text to copy.' });
      return;
    }
    navigator.clipboard.writeText(extractedText);
    toast({ title: 'Text copied to clipboard!' });
  }, [extractedText, toast]);

  const handleDownloadCSV = useCallback(() => {
    if (!extractedText) {
      toast({ title: 'No text to download.' });
      return;
    }

    try {
      const parsedData = JSON.parse(extractedText);
      if (!Array.isArray(parsedData)) {
        throw new Error('Extracted data is not a valid JSON array.');
      }

      const csvRows = [];
      if (parsedData.length > 0) {
        const headers = Object.keys(parsedData[0]);
        csvRows.push(headers.join(','));
        parsedData.forEach(row => {
          const values = headers.map(header => row[header] ?? '');
          csvRows.push(values.join(','));
        });

        const csvData = csvRows.join('\n');
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'extracted_data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({ title: 'Data downloaded as CSV!' });
      } else {
        toast({
          title: 'No data to download.',
          description: 'The extracted JSON array is empty.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error converting to CSV:', error);
      toast({
        title: 'Error converting data to CSV.',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  }, [extractedText, toast]);

  const parsedData = useMemo(() => {
    if (!extractedText) return [];
    try {
      return JSON.parse(extractedText);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      toast({
        title: 'Error parsing extracted text.',
        description: 'The extracted text is not in the expected JSON format.',
        variant: 'destructive',
      });
      return [];
    }
  }, [extractedText, toast]);

  const isValidTableData = Array.isArray(parsedData) && parsedData.every(item => typeof item === 'object' && item !== null);

  const allHeaders = useMemo(() => {
    if (!isValidTableData || parsedData.length === 0) return [];
    return Object.keys(parsedData[0]);
  }, [parsedData, isValidTableData]);

  return (
    <>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="flex flex-col items-center justify-start min-h-screen py-8 px-4">
        <img src="/logo-Medibafth.jpg" alt="MEDIBAT Logo" className="h-20 mb-6" />
        <h1 className="text-2xl font-bold mb-4">sheet extraction</h1>

        {/* Upload Image */}
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button asChild variant="outline">
              <div className="flex items-center gap-2">
                <Icons.plusCircle className="h-4 w-4" />
                <span>Upload Image</span>
              </div>
            </Button>
          </label>
        </div>

        {/* Image Preview */}
        {imageUrl && (
          <div className="mb-4">
            <img src={imageUrl} alt="Uploaded" className="max-w-md rounded-md shadow-md" />
          </div>
        )}

        {/* Extract Text Button */}
        <div className="mb-4">
          <Button onClick={handleTextExtraction} disabled={loading} variant="outline">
            {loading ? 'Extracting data...' : 'Extract data'}
          </Button>
        </div>

        {/* Table Output */}
        {extractedText && isValidTableData && parsedData.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableCaption>Extracted data</TableCaption>
              <TableHeader>
                <TableRow>
                  {allHeaders.map(header => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.map((row, index) => (
                  <TableRow key={index}>
                    {allHeaders.map(header => (
                      <TableCell key={header}>
                        {row[header] !== undefined ? row[header] : ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p>No text extracted yet or invalid data format.</p>
        )}

        {/* Buttons Copy + Download */}
        {extractedText && (
          <div className="mb-4 flex gap-2">
            <Button onClick={handleCopyToClipboard} variant="outline">
              <div className="flex items-center gap-2">
                <Icons.copy className="h-4 w-4" />
                <span>Copy to Clipboard</span>
              </div>
            </Button>
            <Button onClick={handleDownloadCSV} variant="outline">
              <div className="flex items-center gap-2">
                <Icons.file className="h-4 w-4" />
                <span>Download as CSV</span>
              </div>
            </Button>
          </div>
        )}

        {/* New Button to navigate to simple text extraction */}
        
      </div>
      <Toaster />
    </>
  );
}
