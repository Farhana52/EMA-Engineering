const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertBelowThousand(n: number): string {
  let str = '';
  if (n >= 100) {
    str += ones[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n > 0) {
    if (n < 20) {
      str += ones[n] + ' ';
    } else {
      str += tens[Math.floor(n / 10)] + ' ';
      if (n % 10 > 0) {
        str += ones[n % 10] + ' ';
      }
    }
  }
  return str.trim();
}

/**
 * Converts a numerical amount to South Asian / Bangladeshi Taka in words.
 * Standard format: Crore, Lakh, Thousand, Hundred.
 * Example: 70000 -> "Seventy Thousand Taka Only."
 */
export function numberToWordsTaka(num: number): string {
  if (isNaN(num) || num <= 0) {
    return 'Zero Taka Only.';
  }

  const integerPart = Math.floor(num);
  let remaining = integerPart;

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;

  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;

  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;

  const belowThousand = remaining;

  const parts: string[] = [];

  if (crore > 0) {
    parts.push(convertBelowThousand(crore) + ' Crore');
  }
  if (lakh > 0) {
    parts.push(convertBelowThousand(lakh) + ' Lakh');
  }
  if (thousand > 0) {
    parts.push(convertBelowThousand(thousand) + ' Thousand');
  }
  if (belowThousand > 0) {
    parts.push(convertBelowThousand(belowThousand));
  }

  const result = parts.join(' ').trim();
  return result ? `${result} Taka Only.` : 'Zero Taka Only.';
}
