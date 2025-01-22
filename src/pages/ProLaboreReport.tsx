import React, { useState, useEffect } from 'react';
import { Save, FileDown, Building2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Svg, Path, Defs, ClipPath, G } from '@react-pdf/renderer';
import { Notification } from '../components/Notification';

interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency';
  required: boolean;
  enabled: boolean;
  group: 'faturamento' | 'custos_fixos' | 'custos_variaveis';
}

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica'
  },
  header: {
    backgroundColor: '#1E40AF',
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative'
  },
  headerContent: {
    flex: 1,
    marginRight: 100
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 12
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
    gap: 20,
    position: 'relative',
    top: 15
  },
  headerColumn: {
    flex: 1
  },
  headerLabel: {
    color: '#93C5FD',
    fontSize: 10,
    marginBottom: 2
  },
  headerValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  headerDateLabel: {
    color: '#93C5FD',
    fontSize: 8,
    marginBottom: 2
  },
  headerDateValue: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  headerDivider: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 36,
    borderBottomWidth: 1,
    borderBottomColor: '#93C5FD',
    opacity: 0.3,
    marginBottom: 12
  },
  headerLogo: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 80,
    height: 80,
    zIndex: 1
  },
  content: {
    padding: 30
  },
  section: {
    marginBottom: 5,
    backgroundColor: '#FFFFFF',
    padding: 3,
    borderRadius: 4
  },
  sectionTitle: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#93c5fd',
    paddingBottom: 8
  },
  row: {
    marginBottom: 8
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 2
  },
  label: {
    fontSize: 12,
    color: '#64748B'
  },
  value: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: 'bold'
  },
  analysis: {
    padding: 12,
    marginBottom: 15,
    borderRadius: 4
  },
  analysisGreen: {
    backgroundColor: '#DCFCE7',
  },
  analysisYellow: {
    backgroundColor: '#FEF9C3',
  },
  analysisRed: {
    backgroundColor: '#FEE2E2',
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  analysisTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 'bold'
  },
  analysisTitleGreen: {
    color: '#166534',
  },
  analysisTitleYellow: {
    color: '#854D0E',
  },
  analysisTitleRed: {
    color: '#991B1B',
  },
  analysisText: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 1.4
  },
  analysisTextGreen: {
    color: '#166534',
  },
  analysisTextYellow: {
    color: '#854D0E',
  },
  analysisTextRed: {
    color: '#991B1B',
  },
  valuesGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  valueBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 4,
  },
  valueLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  valueAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  }
});

const ProLaborePDF = ({ fields, groupedFields, companyName, cnpj, lastCalculation }: { 
  fields: TemplateField[], 
  groupedFields: Record<string, TemplateField[]>,
  companyName: string,
  cnpj: string,
  lastCalculation: any
}) => {
  const getDiagnosisInfo = (current: number, recommended: number, maximum: number) => {
    if (current <= recommended) {
      return {
        text: 'O valor atual do pró-labore está adequado à realidade financeira da empresa',
        color: 'green',
        icon: 'trending-up'
      };
    }
    
    if (current <= maximum) {
      return {
        text: `O valor atual do Pró-labore está adequado à realidade financeira da empresa, mas próximo do limite, o que é arriscado. Garanta uma reserva financeira mínima de ${(lastCalculation?.monthlyFixedCosts * 12).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
        color: 'yellow',
        icon: 'static'
      };
    }
    
    return {
      text: 'Considere ajustar o valor do pró-labore para garantir a saúde financeira da empresa',
      color: 'red',
      icon: 'trending-down'
    };
  };

  const diagnosis = getDiagnosisInfo(
    lastCalculation?.currentProLabore || 0,
    (lastCalculation?.maximumRecommended || 0) * 0.7,
    lastCalculation?.maximumRecommended || 0
  );

  const getAnalysisStyle = (color: string) => {
    return {
      analysis: [styles.analysis, color === 'green' ? styles.analysisGreen : color === 'yellow' ? styles.analysisYellow : styles.analysisRed],
      title: [styles.analysisTitle, color === 'green' ? styles.analysisTitleGreen : color === 'yellow' ? styles.analysisTitleYellow : styles.analysisTitleRed],
      text: [styles.analysisText, color === 'green' ? styles.analysisTextGreen : color === 'yellow' ? styles.analysisTextYellow : styles.analysisTextRed],
      valueLabel: [styles.valueLabel, color === 'green' ? styles.analysisTitleGreen : color === 'yellow' ? styles.analysisTitleYellow : styles.analysisTitleRed],
      valueAmount: [styles.valueAmount, color === 'green' ? styles.analysisTitleGreen : color === 'yellow' ? styles.analysisTitleYellow : styles.analysisTitleRed]
    };
  };

  const analysisStyle = getAnalysisStyle(diagnosis.color);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Relatório de Pró-labore</Text>
            
            <View style={styles.headerRow}>
              <View style={styles.headerColumn}>
                <Text style={styles.headerLabel}>Empresa</Text>
                <Text style={styles.headerValue}>{companyName || 'Nome da Empresa'}</Text>
              </View>
              <View style={styles.headerColumn}>
                <Text style={styles.headerLabel}>CNPJ</Text>
                <Text style={styles.headerValue}>{cnpj || '00.000.000/0001-00'}</Text>
              </View>
            </View>

            <View style={styles.headerRow}>
              <View style={styles.headerColumn}>
                <Text style={styles.headerDateLabel}>Data</Text>
                <Text style={styles.headerDateValue}>
                  {new Date().toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <View style={styles.headerColumn}>
                <Text style={styles.headerDateLabel}>Horário</Text>
                <Text style={styles.headerDateValue}>
                  {new Date().toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  })}
                </Text>
              </View>
            </View>
          </View>
          <Svg style={styles.headerLogo} viewBox="0 0 60 60">
            <Defs>
              <ClipPath id="9dbc95d808">
                <Path d="M 1.207031 7.21875 L 58.957031 7.21875 L 58.957031 52.96875 L 1.207031 52.96875 Z M 1.207031 7.21875" />
              </ClipPath>
            </Defs>
            <G clipPath="url(#9dbc95d808)">
              <Path fill="#ffffff" d="M 58.625 15.542969 C 57.542969 13.085938 55.605469 9.53125 54.019531 7.21875 C 52.308594 9.972656 49.816406 13.933594 48.246094 16.449219 C 44.011719 23.226562 39.804688 30.019531 35.550781 36.777344 C 33.320312 40.324219 30.179688 42.554688 25.960938 43.203125 C 19.546875 44.1875 13.242188 40.433594 11.1875 34.339844 C 9.050781 28.007812 11.71875 21.121094 17.507812 18.023438 C 23.902344 14.601562 31.660156 16.738281 35.539062 22.996094 C 35.96875 23.691406 36.390625 23.703125 36.808594 23.039062 C 38.042969 21.066406 39.277344 19.09375 40.519531 17.121094 C 41.394531 15.734375 41.417969 15.695312 40.222656 14.488281 C 34.941406 9.164062 28.554688 6.792969 21.101562 7.675781 C 8.878906 9.117188 0.0625 20.542969 1.683594 32.769531 C 3.238281 44.453125 13.320312 52.46875 23.871094 52.246094 C 31.03125 52.175781 36.945312 49.433594 41.453125 43.84375 C 43.527344 41.273438 45.066406 38.332031 46.820312 35.542969 C 50.667969 29.417969 54.488281 23.269531 58.335938 17.136719 C 58.652344 16.632812 58.898438 16.167969 58.625 15.546875 Z M 58.625 15.542969" />
            </G>
            <Path fill="#f47400" d="M 23.9375 21.996094 C 19.980469 21.707031 15.953125 25.128906 15.894531 29.914062 C 15.84375 34.269531 19.585938 37.960938 23.925781 37.960938 C 28.273438 37.960938 32.035156 34.273438 31.96875 29.921875 C 31.898438 25.113281 27.917969 21.722656 23.9375 21.996094 Z M 23.9375 21.996094" />
          </Svg>
          <View style={styles.headerDivider} />
        </View>

        <View style={styles.content}>
          <View style={analysisStyle.analysis}>
            <View style={styles.analysisHeader}>
              <Text style={analysisStyle.title}>Análise e Recomendações</Text>
            </View>
            <Text style={analysisStyle.text}>{diagnosis.text}</Text>

            <View style={styles.valuesGrid}>
              <View style={styles.valueBox}>
                <Text style={analysisStyle.valueLabel}>Pró-labore Atual</Text>
                <Text style={analysisStyle.valueAmount}>
                  {lastCalculation ? 
                    lastCalculation.currentProLabore.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }) : 
                    'R$ 0,00'
                  }
                </Text>
              </View>
              <View style={styles.valueBox}>
                <Text style={analysisStyle.valueLabel}>Pró-labore Recomendado</Text>
                <Text style={analysisStyle.valueAmount}>
                  {lastCalculation ? 
                    (lastCalculation.maximumRecommended * 0.7).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }) : 
                    'R$ 0,00'
                  }
                </Text>
              </View>
              <View style={styles.valueBox}>
                <Text style={analysisStyle.valueLabel}>Pró-labore Máximo</Text>
                <Text style={analysisStyle.valueAmount}>
                  {lastCalculation ? 
                    lastCalculation.maximumRecommended.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }) : 
                    'R$ 0,00'
                  }
                </Text>
              </View>
            </View>
          </View>

          {Object.entries(groupedFields).map(([group, groupFields]) => (
            groupFields[0].enabled && (
              <View key={group} style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {group === 'faturamento' ? 'Faturamento' :
                   group === 'custos_fixos' ? 'Custos Fixos' :
                   'Custos Variáveis'}
                </Text>
                <View style={styles.row}>
                  {groupFields.map((field) => (
                    <View key={field.id} style={styles.rowItem}>
                      <Text style={styles.label}>{field.label}:</Text>
                      <Text style={styles.value}>
                        {lastCalculation?.[group === 'faturamento' ? 'revenue' : 
                                        group === 'custos_fixos' ? 'fixedCosts' : 
                                        'variableCosts']?.[field.id] ?
                          (group === 'custos_variaveis' ? 
                            `${lastCalculation.variableCosts[field.id].toFixed(2)}%` :
                            lastCalculation[group === 'faturamento' ? 'revenue' : 'fixedCosts'][field.id].toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })
                          ) :
                          field.type === 'currency' ? 'R$ 0,00' :
                          field.type === 'number' ? '0,00%' :
                          field.type === 'date' ? new Date().toLocaleDateString('pt-BR') :
                          'Exemplo'
                        }
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )
          ))}
        </View>

        <Text style={styles.footer}>
          Copyright ® 2025 DC ADVISORS - Todos os direitos reservados
        </Text>
      </Page>
    </Document>
  );
};

function ProLaboreReport() {
  const [fields, setFields] = useState<TemplateField[]>([
    { id: 'services', label: 'Receita com Serviços', type: 'currency', required: true, enabled: true, group: 'faturamento' },
    { id: 'products', label: 'Receita com Produtos', type: 'currency', required: true, enabled: true, group: 'faturamento' },
    { id: 'others', label: 'Outras Receitas', type: 'currency', required: true, enabled: true, group: 'faturamento' },
    { id: 'monthly', label: 'Custos Mensais', type: 'currency', required: true, enabled: true, group: 'custos_fixos' },
    { id: 'proLabore', label: 'Pró-labore Atual', type: 'currency', required: true, enabled: true, group: 'custos_fixos' },
    { id: 'sales', label: 'Custo da Mercadoria (%)', type: 'number', required: true, enabled: true, group: 'custos_variaveis' },
    { id: 'taxes', label: 'Impostos (%)', type: 'number', required: true, enabled: true, group: 'custos_variaveis' },
    { id: 'cardFees', label: 'Taxas de Cartão (%)', type: 'number', required: true, enabled: true, group: 'custos_variaveis' },
    { id: 'returns', label: 'Devoluções (%)', type: 'number', required: true, enabled: true, group: 'custos_variaveis' },
    { id: 'commission', label: 'Comissões (%)', type: 'number', required: true, enabled: true, group: 'custos_variaveis' },
    { id: 'others', label: 'Outros Custos (%)', type: 'number', required: true, enabled: true, group: 'custos_variaveis' }
  ]);
  const [showNotification, setShowNotification] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [lastCalculation, setLastCalculation] = useState<any>(null);

  useEffect(() => {
    const savedCompanyName = localStorage.getItem('companyName');
    const savedCnpj = localStorage.getItem('cnpj');
    const savedCalculation = localStorage.getItem('lastProLaboreCalculation');
    
    if (savedCompanyName) setCompanyName(savedCompanyName);
    if (savedCnpj) setCnpj(savedCnpj);
    if (savedCalculation) setLastCalculation(JSON.parse(savedCalculation));
  }, []);

  const handleToggleGroup = (group: string) => {
    setFields(fields.map(field => 
      field.group === group ? { ...field, enabled: !field.enabled } : field
    ));
  };

  const handleSaveTemplate = () => {
    setShowNotification(true);
  };

  const groupedFields = fields.reduce((acc, field) => {
    if (!acc[field.group]) {
      acc[field.group] = [];
    }
    acc[field.group].push(field);
    return acc;
  }, {} as Record<string, TemplateField[]>);

  const getGroupTitle = (group: string) => {
    switch (group) {
      case 'faturamento':
        return 'Faturamento';
      case 'custos_fixos':
        return 'Custos Fixos';
      case 'custos_variaveis':
        return 'Custos Variáveis';
      default:
        return group;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {showNotification && (
        <Notification
          message="Relatório salvo com sucesso!"
          onClose={() => setShowNotification(false)}
        />
      )}

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Relatório de Pró-labore
        </h1>
        <p className="text-blue-100">
          Configure os grupos de informações que serão exibidos no relatório de pró-labore
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Grupos de Informações
              </h3>
              <div className="space-y-4">
                {Object.entries(groupedFields).map(([group, groupFields]) => (
                  <div key={group} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">📊</span>
                      <div>
                        <p className="font-medium text-gray-900">{getGroupTitle(group)}</p>
                        <p className="text-sm text-gray-500">
                          {groupFields.length} campos disponíveis
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={groupFields[0].enabled}
                        onChange={() => handleToggleGroup(group)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleSaveTemplate}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save size={20} className="mr-2" />
                  Salvar Relatório
                </button>

                <PDFDownloadLink
                  document={
                    <ProLaborePDF 
                      fields={fields} 
                      groupedFields={groupedFields} 
                      companyName={companyName} 
                      cnpj={cnpj}
                      lastCalculation={lastCalculation}
                    />
                  }
                  fileName="relatorio-pro-labore.pdf"
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {({ loading }) => (
                    <>
                      <FileDown size={20} className="mr-2" />
                      {loading ? 'Gerando PDF...' : 'Exportar PDF'}
                    </>
                  )}
                </PDFDownloadLink>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {lastCalculation && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Último Pró-Labore Calculado</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Empresa:</span>
                    <span className="font-medium text-gray-900">{companyName || 'Não informado'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">CNPJ:</span>
                    <span className="font-medium text-gray-900">{cnpj || 'Não informado'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Observações Importantes</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4 text-gray-700">
                <p>
                  O cálculo do pró-labore é uma etapa crucial para a saúde financeira da sua empresa. Para um resultado mais assertivo, utilize a média dos últimos 6 meses para preencher as informações, com exceção dos custos variáveis, os quais você deve alterar conforme houver mudança nos contratos.
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  Lembre-se: Um pró-labore bem calculado garante a sustentabilidade do seu negócio 
                  a longo prazo e permite um crescimento saudável da empresa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProLaboreReport;