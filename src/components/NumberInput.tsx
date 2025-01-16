import React, { useState, useEffect } from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  format?: 'currency' | 'percentage';
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  prefix,
  suffix,
  format = 'currency'
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused && value > 0) {
      if (format === 'currency') {
        setDisplayValue(formatCurrency(value));
      } else {
        setDisplayValue(formatPercentage(value));
      }
    }
  }, [value, format, isFocused]);

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPercentage = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setDisplayValue('');
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value > 0) {
      if (format === 'currency') {
        setDisplayValue(formatCurrency(value));
      } else {
        setDisplayValue(formatPercentage(value));
      }
    } else {
      setDisplayValue('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Remove todos os caracteres não numéricos exceto vírgula
    inputValue = inputValue.replace(/[^\d,]/g, '');
    
    // Garante que só existe uma vírgula
    const parts = inputValue.split(',');
    if (parts.length > 2) {
      inputValue = parts[0] + ',' + parts[1];
    }

    // Formata o número com pontos de milhar
    let numericPart = inputValue.split(',')[0];
    if (numericPart.length > 3) {
      numericPart = numericPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    // Reconstrói o valor com a parte decimal
    if (inputValue.includes(',')) {
      inputValue = numericPart + ',' + inputValue.split(',')[1];
    } else {
      inputValue = numericPart;
    }

    setDisplayValue(inputValue);

    // Converte para número e chama o onChange
    const numericValue = Number(inputValue.replace(/\./g, '').replace(',', '.'));
    onChange(numericValue);
  };

  return (
    <div className="relative rounded-md shadow-sm">
      {prefix && (
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm">{prefix}</span>
        </div>
      )}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`block w-full rounded-md border-gray-300 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
          prefix ? 'pl-7' : 'pl-3'
        } ${suffix ? 'pr-8' : 'pr-3'}`}
        placeholder={format === 'currency' ? '0,00' : '0,00%'}
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm">{suffix}</span>
        </div>
      )}
    </div>
  );
};