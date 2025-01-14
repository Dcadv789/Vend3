import React, { useState } from 'react';
import { History, Trash2, Eye, EyeOff } from 'lucide-react';

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

interface NotificationProps {
  message: string;
  onClose: () => void;
}

function Notification({ message, onClose }: NotificationProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 transform transition-all animate-fade-in">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
          <p className="text-gray-800 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

type FilterType = 'ALL' | 'SAC' | 'PRICE';

function SimulationModal({ simulation, onClose }: { simulation: SavedSimulation; onClose: () => void }) {
  const [showInstallments, setShowInstallments] = useState(true);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const hasInstallments = simulation.installments && simulation.installments.length > 0;
  const totalPurchaseAmount = simulation.financingAmount;
  const financedAmount = simulation.financingAmount - simulation.downPayment;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full h-[90vh] flex flex-col">
        <div className="p-6 space-y-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-800">
              Detalhes da Simulação
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Valores da Compra</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valor Total do Bem:</span>
                  <span className="font-medium">{formatCurrency(totalPurchaseAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valor da Entrada:</span>
                  <span className="font-medium text-green-600">{formatCurrency(simulation.downPayment)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valor Financiado:</span>
                  <span className="font-medium">{formatCurrency(financedAmount)}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Custos do Financiamento</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total de Juros:</span>
                  <span className="font-medium text-red-600">{formatCurrency(simulation.totalInterest)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Custo Total do Financiamento:</span>
                  <span className="font-medium">{formatCurrency(simulation.totalAmount - simulation.downPayment)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Custo Total (com entrada):</span>
                  <span className="font-medium">{formatCurrency(simulation.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="bg-blue-600 p-4 rounded-xl text-white">
              <p className="text-sm font-medium mb-1 opacity-90">Primeira Parcela</p>
              <p className="text-lg font-semibold">{formatCurrency(simulation.firstPayment)}</p>
            </div>
            <div className="bg-blue-600 p-4 rounded-xl text-white">
              <p className="text-sm font-medium mb-1 opacity-90">Última Parcela</p>
              <p className="text-lg font-semibold">{formatCurrency(simulation.lastPayment)}</p>
            </div>
            <div className="bg-blue-600 p-4 rounded-xl text-white">
              <p className="text-sm font-medium mb-1 opacity-90">Taxa Mensal</p>
              <p className="text-lg font-semibold">{simulation.monthlyRate}%</p>
            </div>
            <div className="bg-blue-600 p-4 rounded-xl text-white">
              <p className="text-sm font-medium mb-1 opacity-90">Prazo</p>
              <p className="text-lg font-semibold">{simulation.months} meses</p>
            </div>
            <div className="bg-blue-600 p-4 rounded-xl text-white">
              <p className="text-sm font-medium mb-1 opacity-90">Sistema</p>
              <p className="text-lg font-semibold">{simulation.type}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-gray-800">Parcelas</h4>
            {hasInstallments && (
              <button
                onClick={() => setShowInstallments(!showInstallments)}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                {showInstallments ? (
                  <>
                    <EyeOff size={16} className="mr-2" />
                    Ocultar Parcelas
                  </>
                ) : (
                  <>
                    <Eye size={16} className="mr-2" />
                    Exibir Parcelas
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {hasInstallments && showInstallments && (
          <div className="flex-1 overflow-hidden px-6 pb-6">
            <div className="h-full overflow-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nº
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parcela
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amortização
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Juros
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo Devedor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {simulation.installments.map((installment, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {installment.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {installment.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(installment.payment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(installment.amortization)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(installment.interest)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(installment.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SimulationHistory() {
  const [simulations, setSimulations] = React.useState<SavedSimulation[]>([]);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [selectedSimulation, setSelectedSimulation] = useState<SavedSimulation | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  React.useEffect(() => {
    const savedSimulations = localStorage.getItem('simulations');
    if (savedSimulations) {
      setSimulations(JSON.parse(savedSimulations));
    }
  }, []);

  const handleDelete = (id: string) => {
    const updatedSimulations = simulations.filter(sim => sim.id !== id);
    setSimulations(updatedSimulations);
    localStorage.setItem('simulations', JSON.stringify(updatedSimulations));
    setShowNotification(true);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const filteredSimulations = simulations.filter(sim => {
    if (filter === 'ALL') return true;
    return sim.type === filter;
  });

  if (simulations.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Simulações Salvas</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <History size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              Nenhuma simulação salva ainda.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {showNotification && (
        <Notification
          message="Simulação excluída com sucesso!"
          onClose={() => setShowNotification(false)}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Simulações Salvas</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('SAC')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'SAC'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            SAC
          </button>
          <button
            onClick={() => setFilter('PRICE')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'PRICE'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            PRICE
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Banco
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Financiado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prazo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxa Mensal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSimulations.map((simulation) => (
                <tr key={simulation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {simulation.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      simulation.type === 'SAC' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {simulation.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {simulation.bank || 'Não informado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(simulation.financingAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(simulation.downPayment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {simulation.months} meses
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {simulation.monthlyRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(simulation.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedSimulation(simulation)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(simulation.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSimulation && (
        <SimulationModal
          simulation={selectedSimulation}
          onClose={() => setSelectedSimulation(null)}
        />
      )}
    </div>
  );
}

export default SimulationHistory;