import React, { useState, useEffect } from 'react';
import { GitCompare, ArrowRight, TrendingDown, FileDown, ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

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

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    backgroundColor: '#1E40AF',
    padding: 20,
    marginBottom: 30,
    borderRadius: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#E2E8F0',
    fontSize: 14,
  },
  section: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 15,
    borderBottom: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: '#64748B',
  },
  value: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: 'bold',
  },
  highlight: {
    backgroundColor: '#EFF6FF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  highlightTitle: {
    fontSize: 16,
    color: '#1E40AF',
    marginBottom: 10,
  },
  highlightText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 1.5,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 10,
    marginBottom: 1,
  },
  tableHeaderText: {
    fontSize: 10,
    color: '#475569',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
    padding: 10,
  },
  tableCell: {
    fontSize: 10,
    color: '#334155',
    flex: 1,
  },
  recommendation: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 8,
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  recommendationTitle: {
    fontSize: 18,
    color: '#166534',
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 1.5,
  },
  metric: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

const ComparisonPDF = ({ selectedSimA, selectedSimB, metrics, getBetterOption, formatCurrency }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Análise Comparativa de Financiamentos</Text>
        <Text style={styles.headerSubtitle}>
          Comparação detalhada entre {selectedSimA.type} e {selectedSimB.type}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Simulação A - {selectedSimA.type}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Banco:</Text>
          <Text style={styles.value}>{selectedSimA.bank || 'Não informado'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Valor Financiado:</Text>
          <Text style={styles.value}>{formatCurrency(selectedSimA.financingAmount)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Taxa Mensal:</Text>
          <Text style={styles.value}>{selectedSimA.monthlyRate}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Prazo:</Text>
          <Text style={styles.value}>{selectedSimA.months} meses</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Simulação B - {selectedSimB.type}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Banco:</Text>
          <Text style={styles.value}>{selectedSimB.bank || 'Não informado'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Valor Financiado:</Text>
          <Text style={styles.value}>{formatCurrency(selectedSimB.financingAmount)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Taxa Mensal:</Text>
          <Text style={styles.value}>{selectedSimB.monthlyRate}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Prazo:</Text>
          <Text style={styles.value}>{selectedSimB.months} meses</Text>
        </View>
      </View>

      <View style={styles.highlight}>
        <Text style={styles.highlightTitle}>Análise Comparativa</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Diferença no Total de Juros:</Text>
          <Text style={styles.value}>{formatCurrency(Math.abs(metrics.totalInterestDiff))}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Diferença no Valor Total:</Text>
          <Text style={styles.value}>{formatCurrency(Math.abs(metrics.totalAmountDiff))}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Diferença na Primeira Parcela:</Text>
          <Text style={styles.value}>{formatCurrency(Math.abs(metrics.monthlyPaymentDiff))}</Text>
        </View>
      </View>

      <View style={styles.recommendation}>
        <Text style={styles.recommendationTitle}>Recomendação</Text>
        {getBetterOption() === 'empate' ? (
          <Text style={styles.recommendationText}>
            As simulações são equivalentes. Considere outros fatores como sua disponibilidade financeira mensal 
            e preferência pelo sistema de amortização.
          </Text>
        ) : (
          <Text style={styles.recommendationText}>
            A Simulação {getBetterOption()} apresenta condições mais vantajosas, oferecendo uma melhor relação 
            custo-benefício considerando juros totais, valor das parcelas e custo total do financiamento.
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Análise gerada em {new Date().toLocaleDateString('pt-BR')}
        </Text>
      </View>
    </Page>

    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Evolução das Parcelas</Text>
        <Text style={styles.headerSubtitle}>Comparativo mensal entre as simulações</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Nº</Text>
          <Text style={styles.tableHeaderText}>Simulação A</Text>
          <Text style={styles.tableHeaderText}>Simulação B</Text>
          <Text style={styles.tableHeaderText}>Diferença</Text>
        </View>
        {selectedSimA.installments.map((installment: Installment, index: number) => {
          const diff = installment.payment - selectedSimB.installments[index].payment;
          return (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>{installment.number}</Text>
              <Text style={styles.tableCell}>{formatCurrency(installment.payment)}</Text>
              <Text style={styles.tableCell}>{formatCurrency(selectedSimB.installments[index].payment)}</Text>
              <Text style={styles.tableCell}>
                {formatCurrency(Math.abs(diff))} {diff > 0 ? 'mais cara' : 'mais barata'}
              </Text>
            </View>
          );
        })}
      </View>
    </Page>
  </Document>
);

function Comparison() {
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);
  const [selectedSimA, setSelectedSimA] = useState<SavedSimulation | null>(null);
  const [selectedSimB, setSelectedSimB] = useState<SavedSimulation | null>(null);
  const [metrics, setMetrics] = useState<ComparisonMetrics | null>(null);
  const [showInstallments, setShowInstallments] = useState(true);

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

  const getRecommendationColor = () => {
    const option = getBetterOption();
    if (option === 'empate') return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getRecommendationIcon = () => {
    const option = getBetterOption();
    if (option === 'empate') return <AlertCircle className="w-12 h-12 text-yellow-500" />;
    return <CheckCircle2 className="w-12 h-12 text-green-500" />;
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
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Simulação A
          </label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
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
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Simulação B
          </label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
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
          <div className="bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Análise Comparativa
                  </h3>
                  <p className="text-gray-600">
                    Detalhamento das diferenças entre as simulações
                  </p>
                </div>
                <PDFDownloadLink
                  document={
                    <ComparisonPDF
                      selectedSimA={selectedSimA}
                      selectedSimB={selectedSimB}
                      metrics={metrics}
                      getBetterOption={getBetterOption}
                      formatCurrency={formatCurrency}
                    />
                  }
                  fileName="comparacao-financiamentos.pdf"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  {({ loading }) => (
                    <>
                      <FileDown size={20} className="mr-2" />
                      {loading ? 'Gerando PDF...' : 'Exportar Análise em PDF'}
                    </>
                  )}
                </PDFDownloadLink>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-semibold text-gray-800">Simulação A - {selectedSimA.type}</h4>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {selectedSimA.bank || 'Banco não informado'}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Valor Financiado:</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(selectedSimA.financingAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Primeira Parcela:</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(selectedSimA.firstPayment)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Última Parcela:</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(selectedSimA.lastPayment)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total de Juros:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(selectedSimA.totalInterest)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-semibold text-gray-800">Simulação B - {selectedSimB.type}</h4>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {selectedSimB.bank || 'Banco não informado'}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Valor Financiado:</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(selectedSimB.financingAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Primeira Parcela:</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(selectedSimB.firstPayment)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Última Parcela:</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(selectedSimB.lastPayment)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total de Juros:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(selectedSimB.totalInterest)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h5 className="text-lg font-semibold text-blue-900 mb-4">Diferença nos Juros</h5>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800">{formatCurrency(Math.abs(metrics.totalInterestDiff))}</span>
                    <span className={`text-sm font-medium ${metrics.totalInterestDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {metrics.totalInterestDiff > 0 ? 'B mais econômico' : 'A mais econômico'}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h5 className="text-lg font-semibold text-blue-900 mb-4">Diferença no Valor Total</h5>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800">{formatCurrency(Math.abs(metrics.totalAmountDiff))}</span>
                    <span className={`text-sm font-medium ${metrics.totalAmountDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {metrics.totalAmountDiff > 0 ? 'B mais econômico' : 'A mais econômico'}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h5 className="text-lg font-semibold text-blue-900 mb-4">Diferença na Primeira Parcela</h5>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800">{formatCurrency(Math.abs(metrics.monthlyPaymentDiff))}</span>
                    <span className={`text-sm font-medium ${metrics.monthlyPaymentDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {metrics.monthlyPaymentDiff > 0 ? 'B mais baixa' : 'A mais baixa'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`p-8 rounded-xl border ${getRecommendationColor()} mb-8`}>
                <div className="flex items-start space-x-6">
                  {getRecommendationIcon()}
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800 mb-4">Recomendação</h4>
                    {getBetterOption() === 'empate' ? (
                      <>
                        <p className="text-gray-700 mb-4">
                          As simulações são equivalentes em termos financeiros. 
                          Considere os seguintes aspectos para sua decisão:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600">
                          <li>Sua disponibilidade financeira mensal</li>
                          <li>Preferência pelo sistema de amortização</li>
                          <li>Condições específicas oferecidas por cada banco</li>
                          <li>Possibilidade de pagamentos antecipados</li>
                        </ul>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-700 mb-4">
                          A Simulação {getBetterOption()} apresenta condições mais vantajosas:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600">
                          <li>Menor custo total de financiamento</li>
                          <li>Melhor distribuição das parcelas</li>
                          <li>Menor incidência de juros</li>
                          <li>Melhor relação custo-benefício</li>
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xl font-semibold text-gray-800">Evolução das Parcelas</h4>
                  <button
                    onClick={() => setShowInstallments(!showInstallments)}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {showInstallments ? (
                      <>
                        <ChevronUp size={20} className="mr-2" />
                        Ocultar Parcelas
                      </>
                    ) : (
                      <>
                        <ChevronDown size={20} className="mr-2" />
                        Mostrar Parcelas
                      </>
                    )}
                  </button>
                </div>

                {showInstallments && (
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nº
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Simulação A
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Simulação B
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                {installment.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(installment.payment)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(selectedSimB.installments[index].payment)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {formatCurrency(Math.abs(diff))}
                                  <span className="text-gray-500 ml-1">
                                    {diff > 0 ? 'mais cara' : 'mais barata'}
                                  </span>
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Comparison;