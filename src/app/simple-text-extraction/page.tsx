'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ocrTextExtraction } from '@/ai/flows/ocr-text-extraction';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { Icons } from '@/components/icons';
import { ModeToggle } from '@/components/mode-toggle';

export default function SimpleTextExtraction() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      setExtractedText(result.extractedText || result.extractedData); // brut
      toast({ title: 'Text extracted successfully!' });
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error extracting text.',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [imageUrl, toast]);

  return (
    <>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="flex flex-col items-center justify-start min-h-screen py-8 px-4 space-y-6">
        <h1 className="text-2xl font-bold">Extraction de texte simple</h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="simple-upload"
        />
        <label htmlFor="simple-upload">
          <Button asChild variant="outline">
            <div className="flex items-center gap-2">
              <Icons.plusCircle className="h-4 w-4" />
              <span>Upload Image</span>
            </div>
          </Button>
        </label>

        {imageUrl && <img src={imageUrl} alt="Uploaded" className="max-w-md rounded shadow" />}

        <Button onClick={handleTextExtraction} disabled={loading} variant="outline">
          {loading ? 'Extracting...' : 'Extract Simple Text'}
        </Button>

        {extractedText && (
          <textarea
            value={extractedText}
            readOnly
            rows={10}
            className="w-full max-w-3xl p-3 border rounded"
          />
        )}
      </div>
      <Toaster />
    </>
  );
}
