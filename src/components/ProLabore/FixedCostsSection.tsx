import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface FixedCostsSectionProps {
  costs: {
    monthly: number;
    proLabore: number;
  };
  onCostChange: (key: string, value: number) => void;
}

export const FixedCostsSection: React.FC<FixedCostsSectionProps> = ({ costs, onCostChange }) => {
  const totalCosts = Object.values(costs).reduce((a, b) => a + b, 0);

  const formatInputCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleInputChange = (key: string, value: string) => {
    const numericValue = value.replace(/\D/g, '');
    onCostChange(key, Number(numericValue) / 100);
  };

  return (
    <div className="space-y-2">
      <div className="border border-gray-200 rounded-lg p-2">
        <div className="flex items-center">
          <label className="w-3/5 text-sm font-medium text-gray-700 truncate pr-2">
            Custos Mensais
          </label>
          <div className="w-2/5">
            <input
              type="text"
              value={formatInputCurrency(costs.monthly)}
              onChange={(e) => handleInputChange('monthly', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="R$ 0,00"
            />
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-2">
        <div className="flex items-center">
          <label className="w-3/5 text-sm font-medium text-gray-700 truncate pr-2">
            Pró-Labore Atual
          </label>
          <div className="w-2/5">
            <input
              type="text"
              value={formatInputCurrency(costs.proLabore)}
              onChange={(e) => handleInputChange('proLabore', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="R$ 0,00"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200">
        <p className="text-lg font-semibold text-gray-900">
          Total: {formatCurrency(totalCosts)}
        </p>
      </div>
    </div>
  );
};