'use client';

import {useState, useCallback} from 'react';
import {useToast} from '@/hooks/use-toast';
import {ocrTextExtraction} from '@/ai/flows/ocr-text-extraction';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Icons} from '@/components/icons';
import {Card, CardHeader, CardContent} from '@/components/ui/card';
import {ModeToggle} from '@/components/mode-toggle';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

function convertTextToCsv(text: string): string {
  const rows = text.split('\n').map(row => {
    const cells = row.split(',').map(cell => `"${cell.replace(/"/g, '""')}"`);
    return cells.join(',');
  });
  return rows.join('\n');
}

function downloadCSV(text: string) {
  const csvData = convertTextToCsv(text);
  const blob = new Blob([csvData], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'extracted_text.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const {toast} = useToast();

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
      toast({
        title: 'Please upload an image first.',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await ocrTextExtraction({photoUrl: imageUrl});
      setExtractedText(result.extractedText);
      toast({
        title: 'Text extracted successfully!',
      });
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
      toast({
        title: 'No text to copy.',
      });
      return;
    }

    navigator.clipboard.writeText(extractedText);
    toast({
      title: 'Text copied to clipboard!',
    });
  }, [extractedText, toast]);

  const handleDownloadCSV = useCallback(() => {
    downloadCSV(extractedText);
    toast({
      title: 'Text downloaded as CSV!',
    });
  }, [extractedText, toast]);

  const parsedData = extractedText
    .split('\n')
    .map(row => row.split(',').map(cell => cell.trim()));

  return (
    <>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="flex flex-col items-center justify-start min-h-screen py-8 px-4">
        <img src="https://firebasestorage.googleapis.com/v0/b/fir-studio.appspot.com/o/medibat.png?alt=media&token=b259795d-3b64-493a-be24-19504446ba34" alt="MEDIBAT Logo" className="h-20 mb-4" />
        <h1 className="text-2xl font-bold mb-4">OCR Weaver</h1>

        {/* Image Upload */}
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button asChild variant={'outline'}>
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
            <img src={imageUrl} alt="Uploaded Image" className="max-w-md rounded-md shadow-md" />
          </div>
        )}

        {/* Text Extraction Button */}
        <div className="mb-4">
          <Button onClick={handleTextExtraction} disabled={loading} variant={'outline'}>
            {loading ? 'Extracting...' : 'Extract Text'}
          </Button>
        </div>

        {/* Text Display */}
        <div className="mb-4 w-full max-w-md">
          <Card>
            <CardHeader>
            </CardHeader>
            <CardContent>
              {parsedData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {parsedData[0].map((header, index) => (
                        <TableHead key={index}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(1).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Textarea
                  value={extractedText}
                  readOnly
                  placeholder="Extracted text will appear here..."
                  className="w-full h-40 rounded-md shadow-sm resize-none"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Copy to Clipboard Button */}
        {extractedText && (
          <div className="flex gap-2">
            <Button onClick={handleCopyToClipboard} variant={'outline'}>
              <div className="flex items-center gap-2">
                <Icons.copy className="h-4 w-4" />
                <span>Copy to Clipboard</span>
              </div>
            </Button>
            <Button onClick={handleDownloadCSV} variant={'outline'}>
              <div className="flex items-center gap-2">
                <Icons.file className="h-4 w-4" />
                <span>Download CSV</span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
