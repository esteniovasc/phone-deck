import { Plus, Download, Settings } from 'lucide-react';

interface FloatingDockProps {
  onAddPhone: () => void;
  onBackup: () => void;
}

/**
 * FloatingDock: Barra de ferramentas flutuante na parte inferior
 * 
 * Features:
 * - Vidro fosco (backdrop blur)
 * - Sombra suave
 * - Centralizada horizontalmente
 * - Componente overlay (acima do canvas)
 */
export function FloatingDock({ onAddPhone, onBackup }: FloatingDockProps) {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      {/* Container vidro fosco */}
      <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-xl border border-white/20">
        {/* Botão Novo (Primário) */}
        <button
          onClick={onAddPhone}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105"
          title="Adicionar novo celular"
        >
          <Plus className="w-4 h-4" />
          Novo
        </button>

        {/* Separador visual */}
        <div className="h-6 w-px bg-white/30" />

        {/* Botão Backup */}
        <button
          onClick={onBackup}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 group"
          title="Fazer backup dos dados"
        >
          <Download className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
        </button>

        {/* Botão Config */}
        <button
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 group"
          title="Configurações"
        >
          <Settings className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}
