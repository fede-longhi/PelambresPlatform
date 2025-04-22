"use client";

import { PrintJobModelFile } from "@/app/lib/definitions";
import { useEffect, useState } from "react";

export async function PrintJobModels({ printJobId }: { printJobId: string }) {
    const [models, setModels] = useState<PrintJobModelFile[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      async function fetchModels() {
        try {
          const res = await fetch(`/api/print-jobs/${printJobId}/models`);
          console.log(res);
          const data = await res.json();
          setModels(data);
        } catch (error) {
          console.error('Error fetching models', error);
        } finally {
          setLoading(false);
        }
      }
  
      fetchModels();
    }, [printJobId]);
  
    if (loading) return <p>Cargando modelos...</p>;
    if (models.length === 0) return <p>No hay modelos cargados.</p>;
  
    return (
      <div className="space-y-4">
        {models.map((model) => (
          <div key={model.id} className="border p-4 rounded shadow-sm">
            <h3 className="text-lg font-semibold">{model.name}</h3>
            <p className="text-sm text-gray-500">{model.filename}</p>
            <p className="text-sm">Tamaño: {(model.size / 1024).toFixed(2)} KB</p>
            <p className="text-sm">Subido: {new Date(model.uploaded_at).toLocaleString()}</p>
            <a
              href={model.path}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-blue-600 hover:underline"
            >
              Descargar
            </a>
          </div>
        ))}
      </div>
    );
}