'use client';

import * as React from 'react';
import { Button, MicroLabel, BicameralHeading } from '@/components/primitives';
import { RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('App Route Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--color-cream-100)] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-10 rounded-[var(--radius-card)] shadow-xl space-y-6">
        <MicroLabel className="text-[var(--color-gold-600)]">CUSTODIAL NOTICE</MicroLabel>
        
        <BicameralHeading italicPart="Something" romanPart="went wrong" size="md" align="center" />
        
        <p className="font-sans text-sm text-[var(--color-text-500)] leading-relaxed">
          The requested heritage view encountered a temporary loading condition. Please refresh or try again.
        </p>

        <div className="pt-2 flex justify-center">
          <Button
            variant="primary"
            size="md"
            onClick={() => reset()}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
