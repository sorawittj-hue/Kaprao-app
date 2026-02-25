export function formatPrice(price: number, currency = 'THB'): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatCompactPrice(price: number): string {
  return new Intl.NumberFormat('th-TH', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(price)
}

export function formatPriceWithoutCurrency(price: number): string {
  return new Intl.NumberFormat('th-TH').format(price)
}
