import { useState, useRef } from 'react';
import { X, Upload, Link as LinkIcon } from 'lucide-react';
import { processImage, validateImageFile, formatFileSize } from '../../utils/imageProcessor';

interface ImageUploadModalProps {
  currentImage: string;
  onSave: (base64: string) => void;
  onCancel: () => void;
}

type UploadMode = 'link' | 'upload';

/**
 * ImageUploadModal: Modal para upload/edição de imagem
 * Suporta URL ou upload local com redimensionamento
 */
export function ImageUploadModal({ currentImage, onSave, onCancel }: ImageUploadModalProps) {
  const [mode, setMode] = useState<UploadMode>('link');
  const [linkInput, setLinkInput] = useState(currentImage);
  const [isProcessing, setIsProcessing] = useState(false);
  const [maxWidth, setMaxWidth] = useState(500);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLinkSave = () => {
    if (linkInput.trim()) {
      onSave(linkInput.trim());
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!validateImageFile(file)) {
      alert('Arquivo inválido. Use PNG, JPG, WebP ou GIF (máx 50MB)');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processImage(file, maxWidth, 0.8);
      setPreviewImage(result.base64);
      setPreviewSize(result.sizeKB);
    } catch (error) {
      alert('Erro ao processar imagem: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50');
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadSave = () => {
    if (previewImage) {
      onSave(previewImage);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Editar Imagem</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            aria-label="Fechar"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-slate-200">
          <button
            onClick={() => setMode('link')}
            className={`flex-1 py-4 px-6 font-medium transition ${
              mode === 'link'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="inline mr-2" size={18} />
            Link
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 py-4 px-6 font-medium transition ${
              mode === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="inline mr-2" size={18} />
            Upload Local
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'link' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL da Imagem
                </label>
                <input
                  type="text"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {linkInput && (
                <div className="relative rounded-lg overflow-hidden bg-slate-100 h-64">
                  <img
                    src={linkInput}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => alert('Erro ao carregar imagem da URL')}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Drag & Drop */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition bg-slate-50"
              >
                <Upload size={48} className="mx-auto text-slate-400 mb-2" />
                <p className="text-slate-900 font-medium">Arraste uma imagem aqui</p>
                <p className="text-slate-500 text-sm">ou clique para selecionar</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Size Slider */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tamanho Máximo: {maxWidth}px
                </label>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  step="50"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  disabled={isProcessing}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>200px</span>
                  <span>1000px</span>
                </div>
              </div>

              {/* Preview */}
              {previewImage && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    ✓ Imagem pronta • {formatFileSize(previewSize || 0)}
                  </p>
                  <div className="relative rounded-lg overflow-hidden bg-slate-100 h-64">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-slate-600 mt-2">Processando imagem...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={mode === 'link' ? handleLinkSave : handleUploadSave}
            disabled={mode === 'upload' && !previewImage}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
