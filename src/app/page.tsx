'use client';

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
import Image from 'next/image';

function OcrResultTable({ extractedText }: { extractedText: string }) {
  const [tableData, setTableData] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (extractedText) {
      try {
        const parsedData = JSON.parse(extractedText);
        if (Array.isArray(parsedData)) {
          setTableData(parsedData);
        } else {
          console.error('Extracted data is not a valid JSON array.');
        }
      } catch (error: any) {
        console.error('Error parsing JSON:', error);
      }
    } else {
      setTableData([]);
    }
  }, [extractedText]);

  const allHeaders = React.useMemo(() => {
    if (tableData.length === 0) return [];
    const headers = new Set<string>();
    tableData.forEach(row => {
      Object.keys(row).forEach(header => headers.add(header));
    });
    return Array.from(headers);
  }, [tableData]);

  return (
    <>
      {tableData.length > 0 ? (
        <div className="overflow-x-auto w-full max-w-6xl">
          <Table>
            <TableCaption>Extracted Data</TableCaption>
            <TableHeader>
              <TableRow>
                {allHeaders.map(header => (
                  <TableHead key={header} className="text-center">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {allHeaders.map(header => (
                    <TableCell key={header} className="text-center">
                      {row[header] ?? '—'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-gray-500">No data extracted or invalid format.</p>
      )}
    </>
  );
}

// Client component
const ClientHome = () => {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [extractedText, setExtractedText] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const { toast } = React.useContext(React.createContext({ toast: (options: any) => { } })); // Mock context

  const handleImageUpload = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleTextExtraction = React.useCallback(async () => {
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

  const handleCopyToClipboard = React.useCallback(() => {
    if (!extractedText) {
      toast({ title: 'No text to copy.' });
      return;
    }

    navigator.clipboard.writeText(extractedText);
    toast({ title: 'Text copied to clipboard!' });
  }, [extractedText, toast]);

  const handleDownloadExcel = React.useCallback(() => {
    if (!extractedText) {
      toast({ title: 'No text to download.' });
      return;
    }

    try {
      const parsedData = JSON.parse(extractedText);
      if (!Array.isArray(parsedData)) {
        throw new Error('Extracted data is not a valid JSON array.');
      }

      const allKeys = Array.from(new Set(parsedData.flatMap(Object.keys)));
      const csvRows = [allKeys.join(',')];

      parsedData.forEach(row => {
        const values = allKeys.map(key => {
          let value = row[key] ?? '';
          // Enclose values in double quotes if they contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`; // Escape double quotes inside the value
          }
          return value;
        });
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

      toast({ title: 'Data downloaded as Excel!' });
    } catch (error: any) {
      console.error('Error converting to CSV:', error);
      toast({
        title: 'Error converting data to Excel.',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  }, [extractedText, toast]);

  return (
    <>
      <div className="flex flex-col items-center justify-start min-h-screen py-8 px-4 space-y-6">
        <Image src="/logo-Medibafth (1).jpg" width={160} height={80} alt="MEDIBAT Logo" className="mb-4" />
        <h1 className="text-3xl font-bold mb-6">Convertir Image en Texte</h1>

        {/* Image Upload */}
        <div>
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
                <Icons.plusCircle className="h-5 w-5" />
                <span>Upload Image</span>
              </div>
            </Button>
          </label>
        </div>

        {/* Image Preview */}
        {imageUrl && (
          <div className="mb-4">
            <img src={imageUrl} alt="Uploaded" className="max-w-md rounded-lg shadow-lg" />
          </div>
        )}

        {/* Text Extraction */}
        <Button onClick={handleTextExtraction} disabled={loading} variant="outline">
          {loading ? 'Extracting data...' : 'Extract data'}
        </Button>

        {/* Display extracted data in a table */}
        <OcrResultTable extractedText={extractedText} />

        {/* Copy & Download buttons */}
        {extractedText && (
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={handleCopyToClipboard} variant="outline">
              <div className="flex items-center gap-2">
                <Icons.copy className="h-5 w-5" />
                <span>Copy to Clipboard</span>
              </div>
            </Button>
            <Button onClick={handleDownloadExcel} variant="outline">
              <div className="flex items-center gap-2">
                <Icons.file className="h-5 w-5" />
                <span>Download Excel</span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </>
  );
};


// Server Component
export default function Home() {
  return (
    <>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <ClientHome />
      <Toaster />
    </>
  );
}
