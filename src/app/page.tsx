'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { ModeToggle } from '@/components/mode-toggle';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      {/* Mode toggle en haut à droite */}
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      {/* Logo et titre */}
      <img src="/logo-Medibafth (1).jpg" alt="MEDIBAT Logo" className="h-20 mb-6" />
      <h1 className="text-3xl font-bold mb-8 text-center">Choisissez une option d'extraction</h1>

      {/* Boutons de navigation */}
      <div className="flex flex-col items-center gap-6 w-full max-w-xs">
        {/* Extraction de tableau */}
        <Link href="/extract-table">
          <Button className="w-full flex items-center justify-center gap-2" variant="outline">
            <Icons.file className="h-4 w-4" />
            <span>Extract Table</span>
          </Button>
        </Link>

        {/* Extraction de texte simple */}
        <Link href="/simple-text-extraction">
          <Button className="w-full flex items-center justify-center gap-2" variant="outline">
            <Icons.file className="h-4 w-4" />
            <span>Simple Text Extraction</span>
          </Button>
        </Link>
      </div>
    </main>
  );
}
