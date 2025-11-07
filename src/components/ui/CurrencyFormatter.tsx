import React from 'react';

interface CurrencyFormatterProps {
  amount: number;
  currency?: string;
  className?: string;
  showPlusSign?: boolean;
}

const CurrencyFormatter: React.FC<CurrencyFormatterProps> = ({
  amount,
  currency = 'USD',
  className = '',
  showPlusSign = false
}) => {
  const formatCurrency = (value: number, currencyCode: string) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    });
  };

  const formattedAmount = formatCurrency(Math.abs(amount), currency);
  
  let displayAmount = formattedAmount;
  if (amount < 0) {
    displayAmount = `-${formattedAmount}`;
  } else if (amount > 0 && showPlusSign) {
    displayAmount = `+${formattedAmount}`;
  }

  return (
    <span className={className}>
      {displayAmount}
    </span>
  );
};

export default CurrencyFormatter;