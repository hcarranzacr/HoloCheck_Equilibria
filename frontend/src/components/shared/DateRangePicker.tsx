import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
import { es } from 'date-fns/locale';

interface DateRangePickerProps {
  value: { start: Date; end: Date };
  onChange: (range: { start: Date; end: Date }) => void;
  presets?: ('today' | 'week' | 'month' | 'quarter' | 'year')[];
  maxRange?: number;
}

export function DateRangePicker({
  value,
  onChange,
  presets = ['today', 'week', 'month', 'quarter', 'year']
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePreset = (preset: string) => {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (preset) {
      case 'today':
        start = now;
        break;
      case 'week':
        start = subDays(now, 7);
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'quarter':
        start = startOfQuarter(now);
        end = endOfQuarter(now);
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default:
        start = subDays(now, 30);
    }

    onChange({ start, end });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value.start && value.end ? (
            <>
              {format(value.start, 'dd MMM yyyy', { locale: es })} -{' '}
              {format(value.end, 'dd MMM yyyy', { locale: es })}
            </>
          ) : (
            <span>Seleccionar rango</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex flex-wrap gap-2">
            {presets.includes('today') && (
              <Button variant="outline" size="sm" onClick={() => handlePreset('today')}>
                Hoy
              </Button>
            )}
            {presets.includes('week') && (
              <Button variant="outline" size="sm" onClick={() => handlePreset('week')}>
                Última semana
              </Button>
            )}
            {presets.includes('month') && (
              <Button variant="outline" size="sm" onClick={() => handlePreset('month')}>
                Este mes
              </Button>
            )}
            {presets.includes('quarter') && (
              <Button variant="outline" size="sm" onClick={() => handlePreset('quarter')}>
                Este trimestre
              </Button>
            )}
            {presets.includes('year') && (
              <Button variant="outline" size="sm" onClick={() => handlePreset('year')}>
                Este año
              </Button>
            )}
          </div>
        </div>
        <Calendar
          mode="range"
          selected={{ from: value.start, to: value.end }}
          onSelect={(range) => {
            if (range?.from && range?.to) {
              onChange({ start: range.from, end: range.to });
            }
          }}
          locale={es}
        />
      </PopoverContent>
    </Popover>
  );
}