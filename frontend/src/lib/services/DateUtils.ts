import { format, parse, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, differenceInDays, getWeek, getQuarter } from 'date-fns';
import { es } from 'date-fns/locale';

export class DateUtils {
  static formatDate(date: Date, formatStr: string = 'dd/MM/yyyy'): string {
    return format(date, formatStr, { locale: es });
  }

  static parseDate(dateString: string, formatStr: string = 'dd/MM/yyyy'): Date {
    return parse(dateString, formatStr, new Date(), { locale: es });
  }

  static getDateRange(preset: 'today' | 'week' | 'month' | 'quarter' | 'year'): { start: Date; end: Date } {
    const now = new Date();

    switch (preset) {
      case 'today':
        return { start: now, end: now };
      
      case 'week':
        return {
          start: startOfWeek(now, { locale: es }),
          end: endOfWeek(now, { locale: es })
        };
      
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      
      case 'quarter':
        return {
          start: startOfQuarter(now),
          end: endOfQuarter(now)
        };
      
      case 'year':
        return {
          start: startOfYear(now),
          end: endOfYear(now)
        };
      
      default:
        return { start: subDays(now, 30), end: now };
    }
  }

  static isWithinRange(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end;
  }

  static getDaysDifference(date1: Date, date2: Date): number {
    return differenceInDays(date1, date2);
  }

  static getWeekNumber(date: Date): number {
    return getWeek(date, { locale: es });
  }

  static getQuarter(date: Date): number {
    return getQuarter(date);
  }

  static formatRelative(date: Date): string {
    const now = new Date();
    const days = this.getDaysDifference(now, date);

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
    if (days < 365) return `Hace ${Math.floor(days / 30)} meses`;
    return `Hace ${Math.floor(days / 365)} años`;
  }
}