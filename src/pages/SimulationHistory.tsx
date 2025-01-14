import React, { useState } from 'react';
import { History, Trash2, Eye, EyeOff, Plus, Edit2 } from 'lucide-react';

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

interface EarlyPayment {
  id: string;
  date: string;
  amount: number;
  reduceInstallment: boolean;
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

function EarlyPaymentModal({ onClose, onConfirm, currentBalance, initialPayment = null }: { 
  onClose: () => void; 
  onConfirm: (payment: EarlyPayment) => void;
  currentBalance: number;
  initialPayment?: EarlyPayment | null;
}) {
  const [date, setDate] = useState(initialPayment?.date || '');
  const [amount, setAmount] = useState(initialPayment ? String(initialPayment.amount * 100) : '');
  const [reduceInstallment, setReduceInstallment] = useState(initialPayment?.reduceInstallment ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !amount) return;

    onConfirm({
      id: initialPayment?.id || String(Date.now()),
      date,
      amount: Number(amount) / 100,
      reduceInstallment
    });
    onClose();
  };

  const formatCurrency = (value: string) => {
    if (!value) return '';
    const numericValue = value.replace(/\D/g, '');
    return (Number(numericValue) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setAmount(rawValue);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {initialPayment ? 'Editar Pagamento Antecipado' : 'Adicionar Pagamento Antecipado'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data do Pagamento
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor do Pagamento
            </label>
            <input
              type="text"
              value={formatCurrency(amount)}
              onChange={handleAmountChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              placeholder="R$ 0,00"
            />
            <p className="text-sm text-gray-500 mt-1">
              Saldo devedor atual: {formatCurrency(String(currentBalance * 100))}
            </p>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={reduceInstallment}
                onChange={() => setReduceInstallment(true)}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">Reduzir valor das parcelas</span>
            </label>
            <label className="flex items-center space-x-2 mt-2">
              <input
                type="radio"
                checked={!reduceInstallment}
                onChange={() => setReduceInstallment(false)}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">Reduzir prazo</span>
            </label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {initialPayment ? 'Salvar Alterações' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SimulationModal({ simulation: initialSimulation, onClose }: { simulation: SavedSimulation; onClose: () => void }) {
  const [showInstallments, setShowInstallments] = useState(true);
  const [showEarlyPaymentModal, setShowEarlyPaymentModal] = useState(false);
  const [simulation, setSimulation] = useState(initialSimulation);
  const [earlyPayments, setEarlyPayments] = useState<EarlyPayment[]>([]);
  const [editingPayment, setEditingPayment] = useState<EarlyPayment | null>(null);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const recalculateInstallments = (payments: EarlyPayment[]) => {
    const newInstallments = [...initialSimulation.installments];
    let currentBalance = initialSimulation.financingAmount - initialSimulation.downPayment;
    const monthlyRate = simulation.monthlyRate / 100;

    payments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (let i = 0; i < newInstallments.length; i++) {
      const installmentDate = new Date(newInstallments[i].date);
      const applicablePayments = payments.filter(
        payment => new Date(payment.date) <= installmentDate
      );

      if (applicablePayments.length > 0) {
        for (const payment of applicablePayments) {
          if (payment.reduceInstallment) {
            const remainingInstallments = newInstallments.length - i;
            const reduction = payment.amount / remainingInstallments;
            currentBalance -= payment.amount;
            
            for (let j = i; j < newInstallments.length; j++) {
              const interest = currentBalance * monthlyRate;
              const amortization = reduction;
              newInstallments[j].payment = interest + amortization;
              newInstallments[j].interest = interest;
              newInstallments[j].amortization = amortization;
              newInstallments[j].balance = currentBalance - amortization;
              currentBalance -= amortization;
            }
          } else {
            currentBalance -= payment.amount;
            const interest = currentBalance * monthlyRate;
            const amortization = newInstallments[i].payment - interest;
            newInstallments[i].interest = interest;
            newInstallments[i].amortization = amortization;
            newInstallments[i].balance = currentBalance - amortization;
          }
        }

        payments = payments.filter(
          payment => new Date(payment.date) > installmentDate
        );
      } else {
        const interest = currentBalance * monthlyRate;
        const amortization = newInstallments[i].payment - interest;
        newInstallments[i].interest = interest;
        newInstallments[i].amortization = amortization;
        newInstallments[i].balance = currentBalance - amortization;
        currentBalance -= amortization;
      }
    }

    return newInstallments;
  };

  const handleEarlyPayment = (payment: EarlyPayment) => {
    let updatedPayments: EarlyPayment[];
    
    if (editingPayment) {
      updatedPayments = earlyPayments.map(p => 
        p.id === editingPayment.id ? payment : p
      );
    } else {
      updatedPayments = [...earlyPayments, payment];
    }

    setEarlyPayments(updatedPayments);
    const newInstallments = recalculateInstallments(updatedPayments);
    
    setSimulation({
      ...simulation,
      installments: newInstallments
    });
    
    setEditingPayment(null);
  };

  const handleEditPayment = (payment: EarlyPayment) => {
    setEditingPayment(payment);
    setShowEarlyPaymentModal(true);
  };

  const handleDeletePayment = (paymentId: string) => {
    const updatedPayments = earlyPayments.filter(p => p.id !== paymentId);
    setEarlyPayments(updatedPayments);
    
    if (updatedPayments.length === 0) {
      setSimulation(initialSimulation);
    } else {
      const newInstallments = recalculateInstallments(updatedPayments);
      setSimulation({
        ...simulation,
        installments: newInstallments
      });
    }
  };

  const toggleInstallments = () => {
    setShowInstallments(!showInstallments);
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

          {earlyPayments.length > 0 && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Pagamentos Antecipados</h4>
              <div className="space-y-2">
                {earlyPayments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Pagamento em {new Date(payment.date).toLocaleDateString('pt-BR')}:
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-green-600">
                        {formatCurrency(payment.amount)}
                        {payment.reduceInstallment ? ' (Redução de parcela)' : ' (Redução de prazo)'}
                      </span>
                      <button
                        onClick={() => handleEditPayment(payment)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setEditingPayment(null);
                setShowEarlyPaymentModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Plus size={16} className="mr-2" />
              Pagamento Antecipado
            </button>
            {hasInstallments && (
              <button
                onClick={toggleInstallments}
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

        {showEarlyPaymentModal && (
          <EarlyPaymentModal
            onClose={() => {
              setShowEarlyPaymentModal(false);
              setEditingPayment(null);
            }}
            onConfirm={handleEarlyPayment}
            currentBalance={simulation.installments[0].balance}
            initialPayment={editingPayment}
          />
        )}
      </div>
    </div>
  );
}

type FilterType = 'ALL' | 'SAC' | 'PRICE';

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