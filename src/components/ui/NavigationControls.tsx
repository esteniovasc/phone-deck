import { useReactFlow } from '@xyflow/react';
import { Plus, Minus, Maximize2 } from 'lucide-react';

/**
 * NavigationControls: Dock vertical de zoom e centralização
 * 
 * Features:
 * - Zoom In (+)
 * - Zoom Out (-)
 * - Fit View / Centralizar (quando se perdeu)
 * - Design Glassmorphism
 * - Posicionado no canto inferior esquerdo
 */
export function NavigationControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleZoomIn = () => {
    zoomIn();
  };

  const handleZoomOut = () => {
    zoomOut();
  };

  const handleFitView = () => {
    fitView({ duration: 800 });
  };

  return (
    <div className="fixed bottom-8 left-8 z-50">
      {/* Container vidro fosco vertical */}
      <div className="flex flex-col items-center gap-2 px-3 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-xl border border-white/20">
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className={`
            flex items-center justify-center w-10 h-10
            rounded-full transition-all duration-300
            hover:bg-white hover:text-slate-900 hover:scale-110 hover:shadow-lg
            text-slate-600 hover:shadow-md
            cursor-pointer
          `}
          title="Zoom In (Aproximar)"
          aria-label="Zoom in"
        >
          <Plus size={20} />
        </button>

        {/* Divider */}
        <div className="w-6 h-px bg-slate-200/50"></div>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className={`
            flex items-center justify-center w-10 h-10
            rounded-full transition-all duration-300
            hover:bg-white hover:text-slate-900 hover:scale-110 hover:shadow-lg
            text-slate-600 hover:shadow-md
            cursor-pointer
          `}
          title="Zoom Out (Afastar)"
          aria-label="Zoom out"
        >
          <Minus size={20} />
        </button>

        {/* Divider */}
        <div className="w-6 h-px bg-slate-200/50"></div>

        {/* Fit View - Centralizar */}
        <button
          onClick={handleFitView}
          className={`
            flex items-center justify-center w-10 h-10
            rounded-full transition-all duration-300
            bg-blue-100 text-blue-600
            hover:bg-blue-200 hover:text-blue-700 hover:scale-110 hover:shadow-lg
            font-bold cursor-pointer
          `}
          title="Centralizar View (Fit All)"
          aria-label="Fit view"
        >
          <Maximize2 size={20} />
        </button>
      </div>
    </div>
  );
}
