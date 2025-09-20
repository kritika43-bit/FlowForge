/**
 * Currency utilities for FlowForge
 * Handles currency formatting, conversion, and display in Indian Rupees
 */

/**
 * Current exchange rate (USD to INR)
 * In a real application, this would be fetched from an API
 */
const USD_TO_INR_RATE = 83.25; // Approximate rate as of 2025

/**
 * Currency configuration
 */
export const CURRENCIES = {
  INR: {
    symbol: '₹',
    code: 'INR',
    name: 'Indian Rupee',
    decimals: 2,
  },
  USD: {
    symbol: '$',
    code: 'USD',
    name: 'US Dollar',
    decimals: 2,
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro',
    decimals: 2,
  },
};

/**
 * Get user's preferred currency from settings
 */
export function getPreferredCurrency() {
  if (typeof window === 'undefined') return 'INR';
  
  try {
    const settings = localStorage.getItem('flowforge-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.preferences?.currency || 'INR';
    }
  } catch (error) {
    console.warn('Failed to get preferred currency from settings:', error);
  }
  
  return 'INR';
}

/**
 * Convert USD amount to INR
 */
export function convertUsdToInr(usdAmount) {
  if (typeof usdAmount === 'string') {
    // Remove $ sign and commas, then parse
    const cleanAmount = parseFloat(usdAmount.replace(/[$,]/g, ''));
    if (isNaN(cleanAmount)) return 0;
    return cleanAmount * USD_TO_INR_RATE;
  }
  
  if (typeof usdAmount === 'number') {
    return usdAmount * USD_TO_INR_RATE;
  }
  
  return 0;
}

/**
 * Convert any amount to user's preferred currency
 */
export function convertToCurrency(amount, fromCurrency = 'USD', toCurrency = null) {
  const targetCurrency = toCurrency || getPreferredCurrency();
  
  // If already in target currency, return as is
  if (fromCurrency === targetCurrency) {
    return typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
  }
  
  // For now, we only handle USD to INR conversion
  if (fromCurrency === 'USD' && targetCurrency === 'INR') {
    return convertUsdToInr(amount);
  }
  
  // Add more conversion logic here as needed
  return typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
}

/**
 * Format amount as currency string
 */
export function formatCurrency(amount, currency = null, options = {}) {
  const targetCurrency = currency || getPreferredCurrency();
  const currencyConfig = CURRENCIES[targetCurrency] || CURRENCIES.INR;
  
  const {
    showSymbol = true,
    showCode = false,
    decimals = currencyConfig.decimals,
    useIndianNumbering = targetCurrency === 'INR',
  } = options;
  
  // Ensure amount is a number
  let numericAmount = amount;
  if (typeof amount === 'string') {
    numericAmount = parseFloat(amount.replace(/[^0-9.-]/g, ''));
  }
  
  if (isNaN(numericAmount)) {
    numericAmount = 0;
  }
  
  // Format the number
  let formattedNumber;
  
  if (useIndianNumbering && targetCurrency === 'INR') {
    // Indian numbering system (lakhs and crores)
    formattedNumber = formatIndianCurrency(numericAmount, decimals);
  } else {
    // Standard international formatting
    formattedNumber = numericAmount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  
  // Build the final string
  let result = '';
  
  if (showSymbol) {
    result += currencyConfig.symbol;
  }
  
  result += formattedNumber;
  
  if (showCode) {
    result += ` ${currencyConfig.code}`;
  }
  
  return result;
}

/**
 * Format number in Indian numbering system
 */
function formatIndianCurrency(amount, decimals = 2) {
  const numStr = amount.toFixed(decimals);
  const [integerPart, decimalPart] = numStr.split('.');
  
  // Handle Indian numbering (lakhs and crores)
  const lastThreeDigits = integerPart.slice(-3);
  const otherDigits = integerPart.slice(0, -3);
  
  let formattedInteger;
  if (otherDigits !== '') {
    formattedInteger = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThreeDigits;
  } else {
    formattedInteger = lastThreeDigits;
  }
  
  return decimals > 0 ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

/**
 * Convert and format currency in one step
 */
export function convertAndFormat(amount, fromCurrency = 'USD', toCurrency = null, options = {}) {
  const convertedAmount = convertToCurrency(amount, fromCurrency, toCurrency);
  return formatCurrency(convertedAmount, toCurrency, options);
}

/**
 * Parse currency string to numeric value
 */
export function parseCurrency(currencyString) {
  if (typeof currencyString === 'number') {
    return currencyString;
  }
  
  if (typeof currencyString === 'string') {
    // Remove all currency symbols and formatting
    const cleanString = currencyString.replace(/[₹$€,\s]/g, '');
    const parsed = parseFloat(cleanString);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
}

/**
 * Get currency symbol for display
 */
export function getCurrencySymbol(currency = null) {
  const targetCurrency = currency || getPreferredCurrency();
  return CURRENCIES[targetCurrency]?.symbol || '₹';
}

/**
 * Utility to convert legacy USD data to INR
 */
export function migrateCurrencyData(data) {
  if (Array.isArray(data)) {
    return data.map(item => migrateCurrencyData(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const migratedData = { ...data };
    
    // Common currency field names to convert
    const currencyFields = [
      'cost', 'price', 'amount', 'value', 'total', 'subtotal',
      'estimatedCost', 'actualCost', 'unitCost', 'totalCost',
      'hourlyRate', 'salary', 'budget', 'revenue', 'expense',
    ];
    
    for (const field of currencyFields) {
      if (migratedData[field]) {
        // Check if it's a USD string (starts with $)
        if (typeof migratedData[field] === 'string' && migratedData[field].startsWith('$')) {
          const convertedAmount = convertUsdToInr(migratedData[field]);
          migratedData[field] = formatCurrency(convertedAmount, 'INR');
        }
      }
    }
    
    // Recursively process nested objects
    for (const key in migratedData) {
      if (typeof migratedData[key] === 'object' && migratedData[key] !== null) {
        migratedData[key] = migrateCurrencyData(migratedData[key]);
      }
    }
    
    return migratedData;
  }
  
  return data;
}

/**
 * Format currency for different contexts
 */
export const currencyFormatters = {
  /**
   * Compact format for tables and cards
   */
  compact: (amount, currency = null) => {
    const targetCurrency = currency || getPreferredCurrency();
    const numericAmount = parseCurrency(amount);
    
    if (numericAmount >= 10000000) { // 1 crore
      return formatCurrency(numericAmount / 10000000, targetCurrency, { decimals: 1 }) + 'Cr';
    } else if (numericAmount >= 100000) { // 1 lakh
      return formatCurrency(numericAmount / 100000, targetCurrency, { decimals: 1 }) + 'L';
    } else if (numericAmount >= 1000) { // 1 thousand
      return formatCurrency(numericAmount / 1000, targetCurrency, { decimals: 1 }) + 'K';
    }
    
    return formatCurrency(numericAmount, targetCurrency);
  },
  
  /**
   * Full format for detailed views
   */
  full: (amount, currency = null) => {
    return formatCurrency(amount, currency, { 
      showSymbol: true, 
      showCode: false,
      useIndianNumbering: true 
    });
  },
  
  /**
   * Input format for forms
   */
  input: (amount, currency = null) => {
    const numericAmount = parseCurrency(amount);
    return numericAmount.toFixed(2);
  },
  
  /**
   * Display format with currency code
   */
  display: (amount, currency = null) => {
    return formatCurrency(amount, currency, { 
      showSymbol: true, 
      showCode: true,
      useIndianNumbering: true 
    });
  },
};

/**
 * Currency context for React components
 */
export const currencyUtils = {
  format: formatCurrency,
  convert: convertToCurrency,
  convertAndFormat,
  parse: parseCurrency,
  symbol: getCurrencySymbol,
  formatters: currencyFormatters,
  migrate: migrateCurrencyData,
};
