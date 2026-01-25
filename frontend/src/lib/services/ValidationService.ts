export class ValidationService {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una mayúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una minúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('Debe contener al menos un número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Debe contener al menos un carácter especial');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateRequired(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  static validateRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  static validateDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  static async validateCSVFormat(file: File): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validar tipo de archivo
    if (!file.name.endsWith('.csv')) {
      errors.push('El archivo debe tener extensión .csv');
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.push('El archivo no debe superar 5MB');
    }

    // Leer y validar contenido
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        errors.push('El archivo debe contener al menos una fila de encabezados y una fila de datos');
      }

      // Validar que todas las filas tengan el mismo número de columnas
      const headerCols = lines[0].split(',').length;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').length;
        if (cols !== headerCols) {
          errors.push(`La fila ${i + 1} tiene ${cols} columnas, se esperaban ${headerCols}`);
          break;
        }
      }
    } catch (error) {
      errors.push('Error al leer el archivo');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static validateNumber(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }
}