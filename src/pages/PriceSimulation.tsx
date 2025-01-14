import React, { useState } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import { Notification } from '../components/Notification';

interface Installment {
  number: number;
  date: string;
  payment: number;
  amortization: number;
  interest: number;
  balance: number;
}

export default function PriceSimulation() {
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const defaultFirstPayment = nextMonth.toISOString().split('T')[0];

  const [financingAmount, setFinancingAmount] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [operationDate, setOperationDate] = useState(today);
  const [firstPaymentDate, setFirstPaymentDate] = useState(defaultFirstPayment);
  const [months, setMonths] = useState('');
  const [monthlyRate, setMonthlyRate] = useState('');
  const [yearlyRate, setYearlyRate] = useState('');
  const [bank, setBank] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showInstallments, setShowInstallments] = useState(true);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [totals, setTotals] = useState({ payment: 0, amortization: 0, interest: 0 });
  const [showNotification, setShowNotification] = useState(false);

  const financedAmount = Number(financingAmount) / 100 - Number(downPayment) / 100;
  const totalPurchaseAmount = Number(financingAmount) / 100;

  const formatInputCurrency = (value: string) => {
    if (!value) return 'R$ 0,00';
    let numericValue = value.replace(/\D/g, '');
    const amount = parseFloat(numericValue) / 100;
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleFinancingAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setFinancingAmount(rawValue);
  };

  const handleDownPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setDownPayment(rawValue);
  };

  const calculatePrice = () => {
    const principal = financedAmount;
    const rate = Number(monthlyRate) / 100;
    const term = Number(months);
    const firstDate = new Date(firstPaymentDate);
    
    const payment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    
    let currentBalance = principal;
    const newInstallments: Installment[] = [];
    let totalPayment = 0;
    let totalAmortization = 0;
    let totalInterest = 0;

    for (let i = 0; i < term; i++) {
      const interest = currentBalance * rate;
      const amortization = payment - interest;
      
      const date = new Date(firstDate);
      date.setMonth(firstDate.getMonth() + i);
      
      currentBalance -= amortization;

      totalPayment += payment;
      totalAmortization += amortization;
      totalInterest += interest;

      newInstallments.push({
        number: i + 1,
        date: date.toLocaleDateString('pt-BR'),
        payment,
        amortization,
        interest,
        balance: currentBalance
      });
    }

    setInstallments(newInstallments);
    setTotals({
      payment: totalPayment,
      amortization: totalAmortization,
      interest: totalInterest
    });
  };

  const handleCalculate = () => {
    calculatePrice();
    setShowResults(true);
  };

  const handleSaveSimulation = () => {
    const simulation = {
      id: Date.now().toString(),
      type: 'PRICE' as const,
      date: new Date().toLocaleDateString('pt-BR'),
      financingAmount: Number(financingAmount) / 100,
      downPayment: Number(downPayment) / 100,
      months: Number(months),
      monthlyRate: Number(monthlyRate),
      bank,
      firstPayment: installments[0].payment,
      lastPayment: installments[installments.length - 1].payment,
      totalAmount: totals.payment + Number(downPayment) / 100,
      totalInterest: totals.interest,
      installments: installments
    };

    const savedSimulations = localStorage.getItem('simulations');
    const simulations = savedSimulations ? JSON.parse(savedSimulations) : [];
    simulations.push(simulation);
    localStorage.setItem('simulations', JSON.stringify(simulations));
    
    setFinancingAmount('');
    setDownPayment('');
    setOperationDate(today);
    setFirstPaymentDate(defaultFirstPayment);
    setMonths('');
    setMonthlyRate('');
    setYearlyRate('');
    setBank('');
    setShowResults(false);
    setShowInstallments(true);
    setInstallments([]);
    setTotals({ payment: 0, amortization: 0, interest: 0 });
    setShowNotification(true);
  };

  const toggleInstallments = () => {
    setShowInstallments(!showInstallments);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleMonthlyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const monthly = e.target.value;
    setMonthlyRate(monthly);
    setYearlyRate(((Math.pow(1 + Number(monthly) / 100, 12) - 1) * 100).toFixed(2));
  };

  const handleYearlyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const yearly = e.target.value;
    setYearlyRate(yearly);
    setMonthlyRate(((Math.pow(1 + Number(yearly) / 100, 1/12) - 1) * 100).toFixed(2));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {showNotification && (
        <Notification
          message="Simulação salva com sucesso!"
          onClose={() => setShowNotification(false)}
        />
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tabela Price</h2>
        <p className="text-gray-600">
          Simule seu financiamento utilizando a Tabela Price, 
          onde as parcelas são fixas e iguais durante todo o período do financiamento.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-200">
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-100">
            Dados do Financiamento
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Total do Bem
              </label>
              <input
                type="text"
                value={formatInputCurrency(financingAmount)}
                onChange={handleFinancingAmountChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor da Entrada
              </label>
              <input
                type="text"
                value={formatInputCurrency(downPayment)}
                onChange={handleDownPaymentChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor a Financiar
              </label>
              <input
                type="text"
                value={formatCurrency(financedAmount)}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data da Operação
              </label>
              <input
                type="date"
                value={operationDate}
                onChange={(e) => setOperationDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data da Primeira Parcela
              </label>
              <input
                type="date"
                value={firstPaymentDate}
                onChange={(e) => setFirstPaymentDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prazo (meses)
              </label>
              <input
                type="text"
                value={months}
                onChange={(e) => setMonths(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taxa de Juros Mensal (%)
              </label>
              <input
                type="text"
                value={monthlyRate}
                onChange={handleMonthlyRateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taxa de Juros Anual (%)
              </label>
              <input
                type="text"
                value={yearlyRate}
                onChange={handleYearlyRateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banco
              </label>
              <input
                type="text"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do Banco"
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Calcular
          </button>
        </div>
      </div>

      {showResults && (
        <>
          <div className="bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Resumo do Financiamento
                </h3>
                <p className="text-gray-600">
                  Detalhamento da simulação do financiamento
                </p>
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
                      <span className="font-medium text-green-600">{formatCurrency(Number(downPayment) / 100)}</span>
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
                      <span className="font-medium text-red-600">{formatCurrency(totals.interest)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Custo Total do Financiamento:</span>
                      <span className="font-medium">{formatCurrency(totals.payment)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Custo Total (com entrada):</span>
                      <span className="font-medium">{formatCurrency(totals.payment + Number(downPayment) / 100)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-600 p-4 rounded-xl text-white">
                  <p className="text-sm font-medium mb-1 opacity-90">Parcela Fixa</p>
                  <p className="text-lg font-semibold">
                    {installments.length > 0 ? formatCurrency(installments[0].payment) : '-'}
                  </p>
                </div>
                <div className="bg-blue-600 p-4 rounded-xl text-white">
                  <p className="text-sm font-medium mb-1 opacity-90">Total Amortizado</p>
                  <p className="text-lg font-semibold">{formatCurrency(totals.amortization)}</p>
                </div>
                <div className="bg-blue-600 p-4 rounded-xl text-white">
                  <p className="text-sm font-medium mb-1 opacity-90">Prazo</p>
                  <p className="text-lg font-semibold">{months} meses</p>
                </div>
                <div className="bg-blue-600 p-4 rounded-xl text-white">
                  <p className="text-sm font-medium mb-1 opacity-90">Taxa Efetiva Anual</p>
                  <p className="text-lg font-semibold">{yearlyRate}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
                <button
                  onClick={handleSaveSimulation}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Save size={16} className="mr-2" />
                  Salvar Simulação
                </button>
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
              </div>

              {showInstallments && (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
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
                      {installments.map((installment, index) => (
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
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900" colSpan={2}>Totais</td>
                        <td className="px-6 py-3 text-sm text-gray-900">{formatCurrency(totals.payment)}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">{formatCurrency(totals.amortization)}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">{formatCurrency(totals.interest)}</td>
                        <td className="px-6 py-3 text-sm text-gray-900">-</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}