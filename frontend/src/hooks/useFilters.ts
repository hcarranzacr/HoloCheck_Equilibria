import { useState, useMemo } from 'react';

export interface FilterConfig {
  key: string;
  type: 'text' | 'select' | 'date' | 'number';
  label?: string;
}

export type FilterValues = Record<string, any>;

export function useFilters<T extends Record<string, any>>(
  data: T[],
  filterConfig: FilterConfig[]
) {
  const [filters, setFilters] = useState<FilterValues>({});

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === '') return true;

        const itemValue = item[key];
        const config = filterConfig.find(f => f.key === key);

        if (!config) return true;

        switch (config.type) {
          case 'text':
            return String(itemValue)
              .toLowerCase()
              .includes(String(value).toLowerCase());
          
          case 'select':
            return itemValue === value;
          
          case 'number':
            return Number(itemValue) === Number(value);
          
          case 'date':
            // Comparación básica de fechas
            return new Date(itemValue).toDateString() === new Date(value).toDateString();
          
          default:
            return true;
        }
      });
    });
  }, [data, filters, filterConfig]);

  const setFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  return {
    filteredData,
    filters,
    setFilter,
    resetFilters
  };
}