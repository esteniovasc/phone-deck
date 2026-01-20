import { ChevronUp, ChevronDown, Zap, Shield, Wifi, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';
import type { Phone, VisualStatus } from '../../types';

interface PhoneCardProps {
  data: Phone;
  visualStatus: VisualStatus;
  onToggleMinimize: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSaveDraft?: (id: string, modelName: string) => void;
}

const getBatteryColor = (status: string) => {
  switch (status) {
    case 'critical':
      return 'text-red-600 bg-red-50';
    case 'warning':
      return 'text-orange-600 bg-orange-50';
    case 'good':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-slate-600 bg-slate-50';
  }
};

const getResilienceIcon = (level: string) => {
  const baseClass = 'w-4 h-4';
  switch (level) {
    case 'high':
      return <Shield className={`${baseClass} text-green-600`} />;
    case 'medium':
      return <Shield className={`${baseClass} text-yellow-600`} />;
    case 'low':
      return <Shield className={`${baseClass} text-red-600`} />;
    default:
      return <Shield className={`${baseClass} text-slate-600`} />;
  }
};

const getNetworkColor = (network: string) => {
  return network === '5G' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 bg-slate-50';
};

const getVisualStatusClasses = (status: VisualStatus): string => {
  switch (status) {
    case 'highlight':
      return 'ring-2 ring-blue-500 shadow-lg';
    case 'dimmed':
      return 'opacity-40 scale-95 grayscale';
    case 'neutral':
    default:
      return '';
  }
};

export function PhoneCard({ data, visualStatus, onToggleMinimize, onEdit, onDelete, onSaveDraft }: PhoneCardProps) {
  const [draftName, setDraftName] = useState(data.model);
  const handleDraftNameSave = () => {
    if (draftName.trim() && onSaveDraft) {
      onSaveDraft(data.id, draftName.trim());
    } else if (!draftName.trim() && onDelete) {
      // Se não digitou nada, deletar o card
      onDelete(data.id);
    }
  };

  const handleDraftKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleDraftNameSave();
    }
  };

  return (
    <div
      className={`group relative bg-white border border-slate-100 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden ${
        data.isMinimized ? 'max-w-xs' : 'max-w-2xl'
      } ${getVisualStatusClasses(visualStatus)}`}
    >
      {/* Botão Toggle */}
      <button
        onClick={() => onToggleMinimize(data.id)}
        className="absolute top-3 right-20 z-10 p-1.5 hover:bg-slate-100 rounded transition"
        aria-label="Toggle minimize"
      >
        {data.isMinimized ? (
          <ChevronDown className="w-5 h-5 text-slate-600" />
        ) : (
          <ChevronUp className="w-5 h-5 text-slate-600" />
        )}
      </button>

      {/* Botão Editar */}
      <button
        onClick={() => onEdit(data.id)}
        className="absolute top-3 right-11 z-10 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition opacity-0 group-hover:opacity-100"
        aria-label="Editar card"
        title="Editar"
      >
        <Edit className="w-5 h-5" />
      </button>

      {/* Botão Excluir */}
      <button
        onClick={() => onDelete(data.id)}
        className="absolute top-3 right-3 z-10 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition opacity-0 group-hover:opacity-100"
        aria-label="Deletar card"
        title="Excluir"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* LAYOUT MINIMIZADO */}
      {data.isMinimized && (
        <div className="p-4">
          <div className="flex gap-3">
            <img
              src={data.image}
              alt={data.model}
              className="w-20 h-24 object-cover rounded bg-slate-100"
            />
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-sm">{data.model}</h3>
              <p className="text-xs text-slate-500 mt-1">{data.year}</p>
              <div className="mt-2">
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getNetworkColor(data.badges.network)}`}>
                  {data.badges.network}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAYOUT EXPANDIDO */}
      {!data.isMinimized && (
        <div className="flex">
          {/* Coluna Esquerda (30%) - Imagem */}
          <div className="w-1/3 bg-slate-100 min-h-96">
            <img
              src={data.image}
              alt={data.model}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Coluna Direita (70%) - Conteúdo */}
          <div className="w-2/3 p-6 flex flex-col justify-between">
            {/* Header: Modelo + Ano */}
            <div className="flex items-center justify-between mb-4">
              {data.isDraft ? (
                <input
                  id={`draft-input-${data.id}`}
                  autoFocus
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={handleDraftNameSave}
                  onKeyDown={handleDraftKeyDown}
                  placeholder="Digite o modelo do celular..."
                  className="flex-1 text-lg font-bold text-slate-900 border-b-2 border-blue-500 focus:outline-none bg-transparent px-1"
                />
              ) : (
                <h2 className="text-lg font-bold text-slate-900">{data.model}</h2>
              )}
              <span className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
                {data.year}
              </span>
            </div>

            {/* Badges Row: Network, Resilience, Battery */}
            <div className="flex gap-3 mb-4">
              {/* Network */}
              <div
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md ${getNetworkColor(
                  data.badges.network
                )}`}
              >
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">{data.isDraft ? '—' : data.badges.network}</span>
              </div>

              {/* Resilience */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-slate-50 text-slate-700">
                {getResilienceIcon(data.isDraft ? 'medium' : data.badges.resilience)}
                <span className="text-sm font-medium capitalize">{data.isDraft ? '—' : data.badges.resilience}</span>
              </div>

              {/* Battery */}
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-md ${getBatteryColor(data.badges.batteryStatus)}`}>
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium capitalize">{data.isDraft ? '—' : data.specs.battery}</span>
              </div>
            </div>

            {/* Tech Row: Peso e Espessura */}
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
              <span className="font-medium">📐</span>
              <span>{data.specs.weight} | {data.specs.thickness}</span>
            </div>

            {/* Destaque - Fator X */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-slate-700 italic">{data.highlight}</p>
            </div>

            {/* Footer Financeiro */}
            <div className="border-t border-slate-200 pt-4 mt-4">
              <p className="text-2xl font-bold text-slate-900">{data.price.installment}</p>
              <p className="text-xs text-slate-500 mt-1">Total: {data.price.total}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

