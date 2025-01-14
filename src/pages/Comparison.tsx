import React, { useState, useEffect } from 'react';
import { GitCompare, ArrowRight, TrendingDown } from 'lucide-react';

interface SavedSimulation {
  id: string;
  type: 'SAC' | 'PRICE';
  date: string;
  financingAmount: number;
  downPayment: number;
  months: number;
  monthlyRate: number;
  bank: string;
  firstPayment: number;
  lastPayment: number;
  totalAmount: number;
  totalInterest: number;
  installments: Installment[];
}

interface Installment {
  number: number;
  date: string;
  payment: number;
  amortization: number;
  interest: number;
  balance: number;
}

interface ComparisonMetrics {
  totalInterestDiff: number;
  totalAmountDiff: number;
  monthlyPaymentDiff: number;
  lastPaymentDiff: number;
  averagePaymentDiff: number;
}

function Comparison() {
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);
  const [selectedSimA, setSelectedSimA] = useState<SavedSimulation | null>(null);
  const [selectedSimB, setSelectedSimB] = useState<SavedSimulation | null>(null);
  const [metrics, setMetrics] = useState<ComparisonMetrics | null>(null);

  useEffect(() => {
    const savedSimulations = localStorage.getItem('simulations');
    if (savedSimulations) {
      setSimulations(JSON.parse(savedSimulations));
    }
  }, []);

  useEffect(() => {
    if (selectedSimA && selectedSimB) {
      calculateMetrics();
    }
  }, [selectedSimA, selectedSimB]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(2) + '%';
  };

  const calculateMetrics = () => {
    if (!selectedSimA || !selectedSimB) return;

    const totalInterestDiff = selectedSimA.totalInterest - selectedSimB.totalInterest;
    const totalAmountDiff = selectedSimA.totalAmount - selectedSimB.totalAmount;
    const monthlyPaymentDiff = selectedSimA.firstPayment - selectedSimB.firstPayment;
    const lastPaymentDiff = selectedSimA.lastPayment - selectedSimB.lastPayment;

    const avgPaymentA = selectedSimA.totalAmount / selectedSimA.months;
    const avgPaymentB = selectedSimB.totalAmount / selectedSimB.months;
    const averagePaymentDiff = avgPaymentA - avgPaymentB;

    setMetrics({
      totalInterestDiff,
      totalAmountDiff,
      monthlyPaymentDiff,
      lastPaymentDiff,
      averagePaymentDiff
    });
  };

  const getBetterOption = () => {
    if (!metrics) return null;

    const points = {
      simA: 0,
      simB: 0
    };

    if (metrics.totalInterestDiff > 0) points.simB++;
    else if (metrics.totalInterestDiff < 0) points.simA++;

    if (metrics.totalAmountDiff > 0) points.simB++;
    else if (metrics.totalAmountDiff < 0) points.simA++;

    if (metrics.averagePaymentDiff > 0) points.simB++;
    else if (metrics.averagePaymentDiff < 0) points.simA++;

    if (points.simA > points.simB) return 'A';
    if (points.simB > points.simA) return 'B';
    return 'empate';
  };

  if (simulations.length < 2) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Comparação entre Sistemas</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <GitCompare size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              É necessário ter pelo menos duas simulações salvas para fazer comparações.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Comparação entre Sistemas</h2>
        <p className="text-gray-600">
          Compare diferentes simulações para encontrar a melhor opção para você.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Seleção das Simulações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Simulação A
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedSimA?.id || ''}
            onChange={(e) => {
              const sim = simulations.find(s => s.id === e.target.value);
              setSelectedSimA(sim || null);
            }}
          >
            <option value="">Selecione uma simulação</option>
            {simulations.map((sim) => (
              <option key={sim.id} value={sim.id}>
                {sim.type} - {sim.bank || 'Banco não informado'} - {formatCurrency(sim.financingAmount)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Simulação B
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedSimB?.id || ''}
            onChange={(e) => {
              const sim = simulations.find(s => s.id === e.target.value);
              setSelectedSimB(sim || null);
            }}
          >
            <option value="">Selecione uma simulação</option>
            {simulations.map((sim) => (
              <option key={sim.id} value={sim.id}>
                {sim.type} - {sim.bank || 'Banco não informado'} - {formatCurrency(sim.financingAmount)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSimA && selectedSimB && metrics && (
        <>
          {/* Resumo da Comparação */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Resumo da Comparação</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Simulação A</p>
                    <p className="text-lg font-semibold text-blue-900">{selectedSimA.type}</p>
                    <p className="text-sm text-blue-700">{selectedSimA.bank || 'Banco não informado'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Valor Financiado: {formatCurrency(selectedSimA.financingAmount)}</p>
                    <p className="text-sm text-gray-600">Taxa Mensal: {selectedSimA.monthlyRate}%</p>
                    <p className="text-sm text-gray-600">Prazo: {selectedSimA.months} meses</p>
                    <p className="text-sm text-gray-600">Total de Juros: {formatCurrency(selectedSimA.totalInterest)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Simulação B</p>
                    <p className="text-lg font-semibold text-green-900">{selectedSimB.type}</p>
                    <p className="text-sm text-green-700">{selectedSimB.bank || 'Banco não informado'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Valor Financiado: {formatCurrency(selectedSimB.financingAmount)}</p>
                    <p className="text-sm text-gray-600">Taxa Mensal: {selectedSimB.monthlyRate}%</p>
                    <p className="text-sm text-gray-600">Prazo: {selectedSimB.months} meses</p>
                    <p className="text-sm text-gray-600">Total de Juros: {formatCurrency(selectedSimB.totalInterest)}</p>
                  </div>
                </div>
              </div>

              {/* Diferenças */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">Análise Comparativa</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Diferença no Total de Juros</p>
                    <div className="flex items-center justify-between">
                      <p className={`text-lg font-semibold ${metrics.totalInterestDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(Math.abs(metrics.totalInterestDiff))}
                      </p>
                      <p className="text-sm text-gray-500">
                        {metrics.totalInterestDiff > 0 ? 'B mais econômico' : 'A mais econômico'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Diferença no Valor Total</p>
                    <div className="flex items-center justify-between">
                      <p className={`text-lg font-semibold ${metrics.totalAmountDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(Math.abs(metrics.totalAmountDiff))}
                      </p>
                      <p className="text-sm text-gray-500">
                        {metrics.totalAmountDiff > 0 ? 'B mais econômico' : 'A mais econômico'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Diferença na Primeira Parcela</p>
                    <div className="flex items-center justify-between">
                      <p className={`text-lg font-semibold ${metrics.monthlyPaymentDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(Math.abs(metrics.monthlyPaymentDiff))}
                      </p>
                      <p className="text-sm text-gray-500">
                        {metrics.monthlyPaymentDiff > 0 ? 'B mais baixa' : 'A mais baixa'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Diferença na Última Parcela</p>
                    <div className="flex items-center justify-between">
                      <p className={`text-lg font-semibold ${metrics.lastPaymentDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(Math.abs(metrics.lastPaymentDiff))}
                      </p>
                      <p className="text-sm text-gray-500">
                        {metrics.lastPaymentDiff > 0 ? 'B mais baixa' : 'A mais baixa'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recomendação */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Recomendação</h4>
                {getBetterOption() === 'empate' ? (
                  <div className="flex items-center space-x-4">
                    <TrendingDown className="text-yellow-500" size={24} />
                    <div>
                      <p className="font-medium text-gray-800">As simulações são equivalentes</p>
                      <p className="text-sm text-gray-600">
                        Ambas as opções apresentam vantagens e desvantagens similares. 
                        Considere outros fatores como sua disponibilidade financeira mensal.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <ArrowRight className="text-green-500" size={24} />
                    <div>
                      <p className="font-medium text-gray-800">
                        A Simulação {getBetterOption()} apresenta melhores condições
                      </p>
                      <p className="text-sm text-gray-600">
                        Esta opção oferece uma melhor relação custo-benefício considerando 
                        juros totais, valor das parcelas e custo total do financiamento.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gráfico de Evolução das Parcelas */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Evolução das Parcelas</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parcela
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Simulação A
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Simulação B
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diferença
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedSimA.installments.map((installment, index) => {
                    const diff = installment.payment - selectedSimB.installments[index].payment;
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {installment.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(installment.payment)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(selectedSimB.installments[index].payment)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(Math.abs(diff))}
                            {diff > 0 ? ' mais cara' : ' mais barata'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Comparison;