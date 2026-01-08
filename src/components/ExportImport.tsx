import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { WheelConfig, WheelExportData } from '@/types/wheel';

interface ExportImportProps {
  wheelConfig: WheelConfig;
  onImport: (config: WheelConfig) => void;
}

export function ExportImport({ wheelConfig, onImport }: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const exportData: WheelExportData = {
      version: '1.0',
      wheel: wheelConfig,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = wheelConfig.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `${safeName}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as WheelExportData;

        if (!data.wheel || !data.wheel.name || !Array.isArray(data.wheel.items)) {
          throw new Error('Invalid wheel data structure');
        }

        onImport(data.wheel);
      } catch (error) {
        console.error('Failed to import wheel:', error);
        alert('Failed to import wheel. Please check the file format.');
      }
    };
    reader.readAsText(file);

    e.target.value = '';
  };

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="flex-1 bg-[#222] border-[#333] text-[#999] hover:text-white hover:bg-[#2a2a2a] font-medium"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Export
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleImportClick}
        className="flex-1 bg-[#222] border-[#333] text-[#999] hover:text-white hover:bg-[#2a2a2a] font-medium"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
