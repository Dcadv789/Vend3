import React from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface ResultsSectionProps {
  preliminaryCalculation: number;
  maximumRecommended: number;
  currentProLabore: number;
  userName: string;
  monthlyFixedCosts: number;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  preliminaryCalculation,
  maximumRecommended,
  currentProLabore,
  userName,
  monthlyFixedCosts,
}) => {
  const recommendedProLabore = maximumRecommended * 0.7;
  const financialReserve = monthlyFixedCosts * 12;
  
  const getDiagnosisInfo = (current: number, recommended: number, maximum: number) => {
    if (current <= recommended) {
      return {
        color: 'text-green-500',
        icon: TrendingUp,
        title: 'Pró-labore dentro da capacidade financeira',
        description: 'O valor atual do pró-labore está adequado à realidade financeira da empresa'
      };
    }
    
    if (current <= maximum) {
      return {
        color: 'text-yellow-500',
        icon: AlertTriangle,
        title: 'Pró-labore próximo ao limite',
        description: `O valor atual do Pró-labore está adequado à realidade financeira da empresa, mas próximo do limite, o que é arriscado. Garanta uma reserva financeira mínima de ${formatCurrency(financialReserve)}`
      };
    }
    
    return {
      color: 'text-red-500',
      icon: AlertTriangle,
      title: 'Pró-labore acima do recomendado',
      description: 'Considere ajustar o valor do pró-labore para garantir a saúde financeira da empresa'
    };
  };

  const diagnosis = getDiagnosisInfo(currentProLabore, recommendedProLabore, maximumRecommended);
  const DiagnosisIcon = diagnosis.icon;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Resultados da Análise
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Pró-labore Atual
          </h3>
          <p className="text-2xl font-bold text-gray-700">
            {formatCurrency(currentProLabore)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Pró-labore atual definido por você, {userName}
          </p>
        </div>

        <div className={`p-6 rounded-lg border ${diagnosis.color} bg-opacity-10`}>
          <div className="flex items-start space-x-3">
            <DiagnosisIcon className={`w-6 h-6 flex-shrink-0 mt-1 ${diagnosis.color}`} />
            <div>
              <h3 className="text-lg font-semibold mb-2">{diagnosis.title}</h3>
              <p className="text-sm opacity-90">{diagnosis.description}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Pró-labore Recomendado
          </h3>
          <p className="text-2xl font-bold text-blue-700">
            {formatCurrency(recommendedProLabore)}
          </p>
          <p className="text-sm text-blue-600 mt-2">
            Valor recomendado para garantir a saúde financeira da empresa
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Pró-labore Máximo
          </h3>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(maximumRecommended)}
          </p>
          <p className="text-sm text-green-600 mt-2">
            Valor máximo recomendado baseado no faturamento e estrutura de custos
          </p>
        </div>
      </div>
    </div>
  );
};