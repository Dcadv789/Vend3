import React, { useState } from 'react';
import { RevenueSection } from '../components/ProLabore/RevenueSection';
import { FixedCostsSection } from '../components/ProLabore/FixedCostsSection';
import { VariableCostsSection } from '../components/ProLabore/VariableCostsSection';
import { ResultsSection } from '../components/ProLabore/ResultsSection';

export default function ProLabore() {
  const [revenue, setRevenue] = useState({
    services: 0,
    products: 0,
    others: 0
  });

  const [fixedCosts, setFixedCosts] = useState({
    monthly: 0,
    proLabore: 0
  });

  const [variableCosts, setVariableCosts] = useState({
    sales: 0,
    taxes: 0,
    cardFees: 0,
    returns: 0,
    commission: 0,
    others: 0
  });

  const handleRevenueChange = (key: string, value: number) => {
    setRevenue(prev => ({ ...prev, [key]: value }));
  };

  const handleFixedCostChange = (key: string, value: number) => {
    setFixedCosts(prev => ({ ...prev, [key]: value }));
  };

  const handleVariableCostChange = (key: string, value: number) => {
    setVariableCosts(prev => ({ ...prev, [key]: value }));
  };

  const calculateResults = () => {
    const totalRevenue = Object.values(revenue).reduce((a, b) => a + b, 0);
    // Agora os custos variáveis já estão em percentual (75 = 75%), então dividimos por 100
    const totalVariableCosts = Object.values(variableCosts).reduce((a, b) => a + b, 0) / 100;
    const totalFixedCosts = fixedCosts.monthly;

    // Fórmula: Pró-labore Máx = (Faturamento × (1 - Taxa)) - Custos Fixos
    const maximumRecommended = (totalRevenue * (1 - totalVariableCosts)) - totalFixedCosts;
    
    // O cálculo preliminar agora é baseado no mesmo princípio
    const preliminaryCalculation = maximumRecommended;

    return {
      preliminaryCalculation,
      maximumRecommended,
      currentProLabore: fixedCosts.proLabore,
      userName: 'Usuário',
      monthlyFixedCosts: totalFixedCosts
    };
  };

  const results = calculateResults();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Cálculo de Pró-labore
        </h1>
        <p className="text-blue-100">
          Calcule o valor ideal do seu pró-labore com base no faturamento e custos da sua empresa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-800 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Faturamento</h2>
            <p className="text-gray-300 text-sm">Registre suas fontes de receita</p>
          </div>
          <div className="p-6">
            <RevenueSection
              revenue={revenue}
              onRevenueChange={handleRevenueChange}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-800 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Custos Fixos</h2>
            <p className="text-gray-300 text-sm">Despesas mensais recorrentes</p>
          </div>
          <div className="p-6">
            <FixedCostsSection
              costs={fixedCosts}
              onCostChange={handleFixedCostChange}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-800 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Custos Variáveis</h2>
            <p className="text-gray-300 text-sm">Despesas proporcionais à receita</p>
          </div>
          <div className="p-6">
            <VariableCostsSection
              costs={variableCosts}
              onCostChange={handleVariableCostChange}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-4">
          <h2 className="text-xl font-semibold text-white">Resultados da Análise</h2>
          <p className="text-indigo-100 text-sm">Recomendações baseadas nos dados informados</p>
        </div>
        <div className="p-8">
          <ResultsSection {...results} />
        </div>
      </div>
    </div>
  );
}