const ones = [
  "", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়",
  "দশ", "এগারো", "বারো", "তেরো", "চোদ্দ", "পনেরো", "ষোল", "সতেরো", "আঠারো", "উনিশ",
];

const tens = [
  "", "", "বিশ", "ত্রিশ", "চল্লিশ", "পঞ্চাশ", "ষাট", "সত্তর", "আশি", "নব্বই",
];

function twoDigit(n: number): string {
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return tens[t] + (o ? " " + ones[o] : "");
}

function threeDigit(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  let result = "";
  if (h) result += ones[h] + " শত";
  if (rest) result += (result ? " " : "") + twoDigit(rest);
  return result;
}

export function numberToBanglaWords(num: number): string {
  if (num === 0) return "শূন্য";
  if (num < 0) return "ঋণাত্মক " + numberToBanglaWords(-num);

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rest = num % 1000;

  const parts: string[] = [];
  if (crore) parts.push(threeDigit(crore) + " কোটি");
  if (lakh) parts.push(threeDigit(lakh) + " লক্ষ");
  if (thousand) parts.push(threeDigit(thousand) + " হাজার");
  if (rest) parts.push(threeDigit(rest));

  return parts.join(" ") + " টাকা মাত্র";
}

export function toBanglaDigits(input: string | number): string {
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return String(input).replace(/[0-9]/g, (d) => map[d]);
}

export function formatDateBangla(dateStr: string): string {
  const d = new Date(dateStr);
  return `${toBanglaDigits(d.getDate())}/${toBanglaDigits(d.getMonth() + 1)}/${toBanglaDigits(d.getFullYear())}`;
}
