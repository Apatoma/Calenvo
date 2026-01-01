export const phonePatterns: Record<string, { pattern: RegExp; format: string; placeholder: string }> = {
  ES: {
    pattern: /^(\+34|0034|34)?[6789]\d{8}$/,
    format: '+34 6XX XXX XXX',
    placeholder: '+34 600000000'
  },
  MX: {
    pattern: /^(\+52|0052|52)?[1-9]\d{9}$/,
    format: '+52 XXX XXX XXXX',
    placeholder: '+52 5500000000'
  },
  AR: {
    pattern: /^(\+54|0054|54)?[2-3679]\d{7,8}$/,
    format: '+54 9 XXX XXX XXXX',
    placeholder: '+54 9 1100000000'
  },
  CO: {
    pattern: /^(\+57|0057|57)?[13]00[0-9]{7}$/,
    format: '+57 3XX XXX XXXX',
    placeholder: '+57 3001000000'
  },
  CL: {
    pattern: /^(\+56|0056|56)?[2-9]\d{8}$/,
    format: '+56 9 XXXX XXXX',
    placeholder: '+56 900000000'
  },
  PE: {
    pattern: /^(\+51|0051|51)?[6789]\d{8}$/,
    format: '+51 9XX XXX XXX',
    placeholder: '+51 900000000'
  },
  BR: {
    pattern: /^(\+55|0055|55)?[1-9]\d{8,9}$/,
    format: '+55 (XX) XXXXX-XXXX',
    placeholder: '+55 11 900000000'
  },
  US: {
    pattern: /^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/,
    format: '+1 (XXX) XXX-XXXX',
    placeholder: '+1 (555) 123-4567'
  },
  DEFAULT: {
    pattern: /^(\+\d{1,3})?[\d\s\-()]{7,}$/,
    format: '+XX XXXXXXXXX',
    placeholder: '+XXXXXXXXXXXX'
  }
};

export function validatePhone(phone: string, countryCode?: string): boolean {
  const cleanPhone = phone.trim();
  const pattern = phonePatterns[countryCode || 'DEFAULT'];
  return pattern.pattern.test(cleanPhone);
}

export function getPhoneFormat(countryCode?: string) {
  return phonePatterns[countryCode || 'DEFAULT'];
}
