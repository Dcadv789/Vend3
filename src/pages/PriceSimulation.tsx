import React, { useState } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';

interface Installment {
  number: number;
  date: string;
  payment: number;
  amortization: number;
  interest: number;
  balance: number;
}

function PriceSimulation() {
  const [financingAmount, setFinancingAmount] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [operationDate, setOperationDate] = useState('');
  const [firstPaymentDate, setFirstPaymentDate] = useState('');
  const [months, setMonths] = useState('');
  const [monthlyRate, setMonthlyRate] = useState('');
  const [yearlyRate, setYearlyRate] = useState('');
  const [bank, setBank] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showInstallments, setShowInstallments] = useState(true);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [totals, setTotals] = useState({ payment: 0, amortization: 0, interest: 0 });

  const financedAmount = Number(financingAmount) - Number(downPayment);

  const calculatePrice = () => {
    const principal = financedAmount;
    const rate = Number(monthlyRate) / 100;
    const term = Number(months);
    const firstDate = new Date(firstPaymentDate);
    
    // Cálculo da parcela usando a fórmula Price
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
      financingAmount: Number(financingAmount),
      downPayment: Number(downPayment),
      months: Number(months),
      monthlyRate: Number(monthlyRate),
      bank,
      firstPayment: installments[0].payment,
      lastPayment: installments[installments.length - 1].payment,
      totalAmount: totals.payment,
      totalInterest: totals.interest,
      installments: installments
    };

    const savedSimulations = localStorage.getItem('simulations');
    const simulations = savedSimulations ? JSON.parse(savedSimulations) : [];
    simulations.push(simulation);
    localStorage.setItem('simulations', JSON.stringify(simulations));
    alert('Simulação salva com sucesso!');
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
                Valor do Financiamento
              </label>
              <input
                type="number"
                value={financingAmount}
                onChange={(e) => setFinancingAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entrada
              </label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saldo a Financiar
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
                type="number"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taxa de Juros Mensal (%)
              </label>
              <input
                type="number"
                value={monthlyRate}
                onChange={handleMonthlyRateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taxa de Juros Anual (%)
              </label>
              <input
                type="number"
                value={yearlyRate}
                onChange={handleYearlyRateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
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
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-blue-600 p-4 rounded-xl text-white">
                  <p className="text-sm font-medium mb-1 opacity-90">Valor Total</p>
                  <p className="text-lg font-semibold">{formatCurrency(totals.payment)}</p>
                </div>
                <div className="bg-blue-600 p-4 rounded-xl text-white">
                  <p className="text-sm font-medium mb-1 opacity-90">Total de Juros</p>
                  <p className="text-lg font-semibold">{formatCurrency(totals.interest)}</p>
                </div>
                <div className="bg-blue-600 p-4 rounded-xl text-white">
                  <p className="text-sm font-medium mb-1 opacity-90">Total Amortizado</p>
                  <p className="text-lg font-semibold">{formatCurrency(totals.amortization)}</p>
                </div>
                <div className="bg-blue-600 p-4 rounded-xl text-white">
                  <p className="text-sm font-medium mb-1 opacity-90">Primeira Parcela</p>
                  <p className="text-lg font-semibold">
                    {installments.length > 0 ? formatCurrency(installments[0].payment) : '-'}
                  </p>
                </div>
                <div className="bg-blue-600 p-4 rounded-xl text-white">
                  <p className="text-sm font-medium mb-1 opacity-90">Última Parcela</p>
                  <p className="text-lg font-semibold">
                    {installments.length > 0 ? formatCurrency(installments[installments.length - 1].payment) : '-'}
                  </p>
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

export default PriceSimulation;