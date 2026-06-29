'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

export default function TempPasswordDisplay({ tempPassword }: { tempPassword: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-medium text-amber-900">Contraseña temporal</p>
      <p className="mt-1 font-mono text-lg tracking-wide text-amber-950">{tempPassword}</p>
      <p className="mt-2 text-xs text-amber-800">
        Guardala ahora. El usuario deberá cambiarla en el primer ingreso. No se volverá a mostrar.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={handleCopy}
      >
        {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
        {copied ? 'Copiada' : 'Copiar'}
      </Button>
    </div>
  );
}
