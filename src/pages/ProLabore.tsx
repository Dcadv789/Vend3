import React, { useState } from 'react';
import { RevenueSection } from '../components/ProLabore/RevenueSection';
import { FixedCostsSection } from '../components/ProLabore/FixedCostsSection';
import { VariableCostsSection } from '../components/ProLabore/VariableCostsSection';
import { ResultsSection } from '../components/ProLabore/ResultsSection';
import { Save } from 'lucide-react';
import { Notification } from '../components/Notification';

export default function ProLabore() {
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
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

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const handleRevenueChange = (key: string, value: number) => {
    setRevenue(prev => ({ ...prev, [key]: value }));
  };

  const handleFixedCostChange = (key: string, value: number) => {
    setFixedCosts(prev => ({ ...prev, [key]: value }));
  };

  const handleVariableCostChange = (key: string, value: number) => {
    setVariableCosts(prev => ({ ...prev, [key]: value }));
  };

  const formatCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5').substring(0, 18);
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCnpj = formatCnpj(e.target.value);
    setCnpj(formattedCnpj);
  };

  const validateData = () => {
    // Verifica se há pelo menos um valor em faturamento
    const hasRevenue = Object.values(revenue).some(value => value > 0);
    if (!hasRevenue) {
      return 'É necessário informar pelo menos um valor de faturamento';
    }

    // Verifica se há pelo menos um valor em custos fixos
    if (fixedCosts.monthly <= 0) {
      return 'É necessário informar os custos mensais';
    }

    // Verifica se o pró-labore atual foi informado
    if (fixedCosts.proLabore <= 0) {
      return 'É necessário informar o pró-labore atual';
    }

    // Verifica se há pelo menos um valor em custos variáveis
    const hasVariableCosts = Object.values(variableCosts).some(value => value > 0);
    if (!hasVariableCosts) {
      return 'É necessário informar pelo menos um custo variável';
    }

    return null;
  };

  const calculateResults = () => {
    const totalRevenue = Object.values(revenue).reduce((a, b) => a + b, 0);
    const totalVariableCosts = Object.values(variableCosts).reduce((a, b) => a + b, 0) / 100;
    const totalFixedCosts = fixedCosts.monthly;

    const maximumRecommended = (totalRevenue * (1 - totalVariableCosts)) - totalFixedCosts;
    const preliminaryCalculation = maximumRecommended;

    return {
      preliminaryCalculation,
      maximumRecommended,
      currentProLabore: fixedCosts.proLabore,
      userName: companyName || 'Usuário',
      monthlyFixedCosts: totalFixedCosts
    };
  };

  const handleSaveCalculation = () => {
    const validationError = validateData();
    if (validationError) {
      setNotificationMessage(validationError);
      setNotificationType('error');
      setShowNotification(true);
      return;
    }

    const calculation = {
      revenue,
      fixedCosts,
      variableCosts,
      companyName,
      cnpj,
      ...calculateResults()
    };

    localStorage.setItem('lastProLaboreCalculation', JSON.stringify(calculation));
    localStorage.setItem('companyName', companyName);
    localStorage.setItem('cnpj', cnpj);
    
    setNotificationMessage('Cálculo salvo com sucesso!');
    setNotificationType('success');
    setShowNotification(true);
  };

  const results = calculateResults();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {showNotification && (
        <Notification
          message={notificationMessage}
          onClose={() => setShowNotification(false)}
          type={notificationType}
        />
      )}

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Cálculo de Pró-labore
        </h1>
        <p className="text-blue-100">
          Calcule o valor ideal do seu pró-labore com base no faturamento e custos da sua empresa
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-800 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Dados da Empresa</h2>
          <p className="text-gray-300 text-sm">Informações básicas da empresa</p>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Empresa
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o nome da empresa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ
            </label>
            <input
              type="text"
              value={cnpj}
              onChange={handleCnpjChange}
              maxLength={18}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="00.000.000/0001-00"
            />
          </div>
        </div>
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
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">Resultados da Análise</h2>
            <p className="text-indigo-100 text-sm">Recomendações baseadas nos dados informados</p>
          </div>
          <button
            onClick={handleSaveCalculation}
            className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm"
          >
            <Save size={20} className="mr-2" />
            Salvar Cálculo
          </button>
        </div>
        <div className="p-8">
          <ResultsSection {...results} />
        </div>
      </div>
    </div>
  );
}