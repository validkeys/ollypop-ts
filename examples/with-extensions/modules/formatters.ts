export const formatters = {
  currency: (amount: number, currency = 'USD') => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency 
    }).format(amount),
    
  date: (date: Date) => 
    new Intl.DateTimeFormat('en-US').format(date),
    
  percentage: (value: number, decimals = 2) =>
    `${(value * 100).toFixed(decimals)}%`
};

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';
