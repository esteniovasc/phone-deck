import { useState } from 'react';
import { X, Download, Image as ImageIcon } from 'lucide-react';
import type { Phone } from '../../types';
import { parseGsmArenaHtml, parseGsmArenaHtmlFallback } from '../../utils/gsmParser';
import { ImageUploadModal } from './ImageUploadModal';

interface EditModalProps {
  phone: Phone;
  onSave: (phone: Phone) => void;
  onCancel: () => void;
}

export function EditModal({ phone, onSave, onCancel }: EditModalProps) {
  const [formData, setFormData] = useState<Phone>(phone);
  const [htmlInput, setHtmlInput] = useState('');
  const [parseMessage, setParseMessage] = useState('');
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);

  const handleChange = (field: keyof Omit<Phone, 'badges'>, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecsChange = (field: keyof Phone['specs'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      specs: {
        ...prev.specs,
        [field]: value,
      },
    }));
  };

  const handleImageUploadSave = (imageData: string) => {
    setFormData((prev) => ({
      ...prev,
      image: imageData,
    }));
    setShowImageUploadModal(false);
  };

  const handlePriceChange = (field: keyof Phone['price'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      price: {
        ...prev.price,
        [field]: value,
      },
    }));
  };

  // Função para processar HTML do GSMArena
  const handleProcessHtml = () => {
    if (!htmlInput.trim()) {
      setParseMessage('Por favor, cole o HTML primeiro.');
      return;
    }

    try {
      // Tenta primeiro com os data-spec (mais robusto)
      let parsed = parseGsmArenaHtml(htmlInput);
      
      // Se não encontrou dados suficientes, tenta o fallback
      if (Object.keys(parsed.specs || {}).length < 2) {
        parsed = parseGsmArenaHtmlFallback(htmlInput);
      }

      // Atualiza o formulário com os dados extraídos
      setFormData((prev) => {
        const updated = { ...prev };

        // Atualiza campo modelo se encontrado
        if (parsed.model) {
          updated.model = parsed.model;
        }

        // Atualiza imagem se encontrada
        if (parsed.image) {
          updated.image = parsed.image;
        }

        // Atualiza specs
        if (parsed.specs) {
          updated.specs = {
            ...prev.specs,
            ...parsed.specs,
          };
        }

        return updated;
      });

      // Mensagem de sucesso
      const fieldsFound = [];
      if (parsed.model) fieldsFound.push('Modelo');
      if (parsed.image) fieldsFound.push('Imagem');
      if (parsed.specs?.weight) fieldsFound.push('Peso');
      if (parsed.specs?.battery) fieldsFound.push('Bateria');
      if (parsed.specs?.screen) fieldsFound.push('Tela');
      if (parsed.specs?.chipset) fieldsFound.push('Chipset');
      if (parsed.specs?.ram) fieldsFound.push('RAM');
      if (parsed.specs?.storage) fieldsFound.push('Armazenamento');
      if (parsed.specs?.cameras) fieldsFound.push('Câmeras');
      if (parsed.specs?.dimensions) fieldsFound.push('Dimensões');

      if (fieldsFound.length > 0) {
        setParseMessage(`✓ Dados extraídos com sucesso: ${fieldsFound.join(', ')}`);
      } else {
        setParseMessage('⚠ Nenhum dado foi encontrado. Verifique o HTML.');
      }

      // Limpa o input após 3 segundos e fecha o details
      setTimeout(() => {
        setHtmlInput('');
        setParseMessage('');
        const detailsElement = document.getElementById('import-details') as HTMLDetailsElement;
        if (detailsElement) {
          detailsElement.open = false;
        }
      }, 2500);
    } catch (error) {
      setParseMessage('✗ Erro ao processar HTML. Verifique o conteúdo.');
      console.error(error);
    }
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 p-6 bg-white">
          <h2 className="text-2xl font-bold text-slate-900">Editar Celular</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Formulário */}
        <div className="p-6 space-y-6">
          {/* Seção de Importação de Dados */}
          <details id="import-details" className="group border border-amber-200 rounded-lg bg-amber-50 overflow-hidden">
            <summary className="px-4 py-3 cursor-pointer hover:bg-amber-100 flex items-center justify-between font-semibold text-amber-900 group-open:bg-amber-100">
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Importar Dados do GSMArena (HTML)
              </span>
              <span className="group-open:rotate-180 transition-transform">▼</span>
            </summary>

            <div className="border-t border-amber-200 p-4 space-y-3">
              <p className="text-sm text-amber-900">
                Cole aqui o HTML da página de especificações do GSMArena para extrair dados automaticamente.
              </p>

              <textarea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                placeholder="Cole o HTML aqui... (Inspecione elemento na página do GSMArena e copie o HTML)"
                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none text-sm font-mono bg-white"
                rows={4}
              />

              <div className="flex gap-2">
                <button
                  onClick={handleProcessHtml}
                  disabled={!htmlInput.trim()}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium text-sm"
                >
                  Processar HTML
                </button>
                <button
                  onClick={() => {
                    setHtmlInput('');
                    setParseMessage('');
                  }}
                  className="px-4 py-2 bg-white border border-amber-300 text-amber-900 rounded-lg hover:bg-amber-50 transition text-sm"
                >
                  Limpar
                </button>
              </div>

              {parseMessage && (
                <div
                  className={`text-sm px-3 py-2 rounded-lg ${
                    parseMessage.startsWith('✓')
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : parseMessage.startsWith('⚠')
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {parseMessage}
                </div>
              )}
            </div>
          </details>

          {/* Nome do Modelo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nome do Modelo
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ex: Galaxy S23"
            />
          </div>

          {/* Ano */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ano de Lançamento
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => handleChange('year', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="2023"
            />
          </div>

          {/* URL da Imagem com Preview */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Imagem do Celular
            </label>
            <div className="flex gap-4">
              {/* Preview */}
              <div className="flex-shrink-0">
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-32 h-48 object-cover rounded-lg bg-slate-100 shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/150?text=Erro';
                    }}
                  />
                )}
                {!formData.image && (
                  <div className="w-32 h-48 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                    <span className="text-xs text-slate-500 text-center px-2">Sem imagem</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    URL Direta
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleChange('image', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    placeholder="https://..."
                  />
                </div>

                {/* Botão Alterar Imagem */}
                <button
                  onClick={() => setShowImageUploadModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
                >
                  <ImageIcon className="w-4 h-4" />
                  Alterar Imagem
                </button>
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Especificações</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tela
              </label>
              <input
                type="text"
                value={formData.specs.screen || ''}
                onChange={(e) => handleSpecsChange('screen', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ex: 6.8 inch P-OLED"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Chipset
              </label>
              <input
                type="text"
                value={formData.specs.chipset || ''}
                onChange={(e) => handleSpecsChange('chipset', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ex: Snapdragon 765G"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  RAM
                </label>
                <input
                  type="text"
                  value={formData.specs.ram || ''}
                  onChange={(e) => handleSpecsChange('ram', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Ex: 6GB/8GB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Armazenamento
                </label>
                <input
                  type="text"
                  value={formData.specs.storage || ''}
                  onChange={(e) => handleSpecsChange('storage', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Ex: 128GB"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bateria
              </label>
              <input
                type="text"
                value={formData.specs.battery}
                onChange={(e) => handleSpecsChange('battery', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ex: 4300 mAh"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Câmeras
              </label>
              <input
                type="text"
                value={formData.specs.cameras || ''}
                onChange={(e) => handleSpecsChange('cameras', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ex: 48MP (Wide) | 8MP (Ultra)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dimensões
                </label>
                <input
                  type="text"
                  value={formData.specs.dimensions || ''}
                  onChange={(e) => handleSpecsChange('dimensions', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Ex: 167.2 x 74.1 x 7.9 mm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Espessura
                </label>
                <input
                  type="text"
                  value={formData.specs.thickness || ''}
                  onChange={(e) => handleSpecsChange('thickness', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Ex: 7.9mm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Peso
              </label>
              <input
                type="text"
                value={formData.specs.weight}
                onChange={(e) => handleSpecsChange('weight', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ex: 180 g"
              />
            </div>
          </div>

          {/* Preço */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Preço</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Parcela
              </label>
              <input
                type="text"
                value={formData.price.installment}
                onChange={(e) => handlePriceChange('installment', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ex: 12x R$ 70,83"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Total
              </label>
              <input
                type="text"
                value={formData.price.total}
                onChange={(e) => handlePriceChange('total', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ex: R$ 850"
              />
            </div>
          </div>

          {/* Destaque */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Destaque (Fator X)
            </label>
            <textarea
              value={formData.highlight}
              onChange={(e) => handleChange('highlight', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              rows={2}
              placeholder="Ex: Design Raindrop & Tela P-OLED"
            />
          </div>

          {/* Badges */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Rede (Ex: 5G, 4G, LTE)
            </label>
            <select
              value={formData.badges.network}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  badges: {
                    ...prev.badges,
                    network: e.target.value as '5G' | '4G' | 'LTE',
                  },
                }))
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="4G">4G</option>
              <option value="5G">5G</option>
              <option value="LTE">LTE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Resiliência
            </label>
            <select
              value={formData.badges.resilience}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  badges: {
                    ...prev.badges,
                    resilience: e.target.value as 'low' | 'medium' | 'high',
                  },
                }))
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status da Bateria
            </label>
            <select
              value={formData.badges.batteryStatus}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  badges: {
                    ...prev.badges,
                    batteryStatus: e.target.value as 'critical' | 'warning' | 'neutral' | 'good',
                  },
                }))
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="critical">Crítico</option>
              <option value="warning">Aviso</option>
              <option value="neutral">Neutro</option>
              <option value="good">Bom</option>
            </select>
          </div>
        </div>

        {/* Footer com Botões */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
          >
            Salvar
          </button>
        </div>
      </div>

      {/* ImageUploadModal */}
      {showImageUploadModal && (
        <ImageUploadModal
          currentImage={formData.image}
          onSave={handleImageUploadSave}
          onCancel={() => setShowImageUploadModal(false)}
        />
      )}
    </div>
  );
}
