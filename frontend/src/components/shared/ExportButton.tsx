import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useActivityLogger } from '@/hooks/useActivityLogger';

interface ExportButtonProps {
  data: any[];
  filename: string;
  format: 'csv' | 'pdf' | 'excel';
  columns?: string[];
  onExport?: () => void;
}

export function ExportButton({
  data,
  filename,
  format,
  columns,
  onExport
}: ExportButtonProps) {
  const { logExport } = useActivityLogger();

  const handleExport = async () => {
    try {
      if (format === 'csv') {
        exportToCSV(data, filename, columns);
      }
      
      // Log de exportación
      await logExport(format, `${filename}.${format}`, data.length);
      
      onExport?.();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const exportToCSV = (data: any[], filename: string, columns?: string[]) => {
    if (data.length === 0) return;

    const keys = columns || Object.keys(data[0]);
    const csvContent = [
      keys.join(','),
      ...data.map(row =>
        keys.map(key => {
          const value = row[key];
          // Escapar comillas y comas
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="w-4 h-4 mr-2" />
      Exportar {format.toUpperCase()}
    </Button>
  );
}