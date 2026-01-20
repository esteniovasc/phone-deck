import type { AnalysisMode } from '../../types';

interface ModeSelectorProps {
  currentMode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
}

/**
 * ModeSelector: Segmented Control flutuante no topo
 * 
 * Features:
 * - Pills com transição suave
 * - Indicador visual do modo ativo
 * - Overlay sobre o canvas
 * - Centralizado horizontalmente
 */
export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  const modes: Array<{ value: AnalysisMode; label: string; emoji: string }> = [
    { value: 'backup_city', label: 'Backup/Cidade', emoji: '🏙️' },
    { value: 'collection', label: 'Coleção', emoji: '🎮' },
    { value: 'kids_safe', label: 'Infantil', emoji: '👶' },
  ];

  const handleModeClick = (mode: AnalysisMode) => {
    // Toggle: se já está ativo, volta pra Padrão; senão, ativa o modo
    if (currentMode === mode) {
      onModeChange('default');
    } else {
      onModeChange(mode);
    }
  };

  return (
    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
      {/* Container vidro fosco */}
      <div className="flex items-center gap-2 p-1 bg-white/80 backdrop-blur-md rounded-full shadow-xl border border-white/20">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => handleModeClick(mode.value)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full
              transition-all duration-300 font-medium whitespace-nowrap
              cursor-pointer
              ${
                currentMode === mode.value
                  ? 'bg-white text-slate-900 shadow-lg scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }
            `}
            title={currentMode === mode.value ? 'Clique para voltar ao Padrão' : `Ativar: ${mode.label}`}
          >
            <span>{mode.emoji}</span>
            <span className="hidden sm:inline text-sm">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
