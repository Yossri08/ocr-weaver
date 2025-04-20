'use client';

import {useState, useCallback} from 'react';
import {useToast} from '@/hooks/use-toast';
import {ocrTextExtraction} from '@/ai/flows/ocr-text-extraction';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Icons} from '@/components/icons';

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

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-8 px-4">
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
          <Button asChild>
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
        <Button onClick={handleTextExtraction} disabled={loading}>
          {loading ? 'Extracting...' : 'Extract Text'}
        </Button>
      </div>

      {/* Text Display */}
      <div className="mb-4 w-full max-w-md">
        <Textarea
          value={extractedText}
          readOnly
          placeholder="Extracted text will appear here..."
          className="w-full h-40 rounded-md shadow-sm resize-none"
        />
      </div>

      {/* Copy to Clipboard Button */}
      {extractedText && (
        <div>
          <Button onClick={handleCopyToClipboard}>
            <div className="flex items-center gap-2">
              <Icons.copy className="h-4 w-4" />
              <span>Copy to Clipboard</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
