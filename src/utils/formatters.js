/**
 * Format number as Indonesian Rupiah currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Rp 0';
  }
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format date to Indonesian format
 * @param {Date|string} date - Date to format
 * @param {boolean} includeTime - Include time in format
 * @returns {string} Formatted date string
 */
export function formatDate(date, includeTime = false) {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }
  
  if (includeTime) {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(dateObj);
  }
  
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
}

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Parse currency string to number
 * @param {string} currencyStr - Currency string to parse
 * @returns {number} Parsed number
 */
export function parseCurrency(currencyStr) {
  if (!currencyStr) return 0;
  
  // Remove currency symbol and separators
  const cleaned = currencyStr.toString().replace(/[Rp.,\s]/g, '');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? 0 : num;
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
}

/**
 * Get stock color based on quantity
 * @param {number} stock - Stock quantity
 * @returns {string} Color class name
 */
export function getStockColor(stock) {
  if (stock > 10) return 'text-stock-high';
  if (stock >= 5) return 'text-stock-medium';
  return 'text-stock-low';
}

/**
 * Get stock badge variant
 * @param {number} stock - Stock quantity
 * @returns {string} Badge variant
 */
export function getStockBadgeVariant(stock) {
  if (stock > 10) return 'default'; // Green/success
  if (stock >= 5) return 'secondary'; // Yellow/warning
  return 'destructive'; // Red/danger
}
