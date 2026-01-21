import { useState, useEffect, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Plus, Minus, Maximize2, Lock, Unlock, Map, Pin, PinOff } from 'lucide-react';

interface NavigationControlsProps {
	onFitView?: () => void;
	onToggleLock: () => void;
	isLocked: boolean;
	onToggleMinimap: () => void;
	minimapState: 'auto' | 'visible' | 'hidden';
	onZoomIn: () => void;
	onZoomOut: () => void;
}

/**
 * NavigationControls: Dock vertical unificado
 * 
 * Atualização:
 * - Auto-hide com "gravidade" (cai para baixo e esmaece)
 * - Zona de detecção no canto inferior esquerdo
 * - Botão de Pin (Fixar)
 */
export function NavigationControls({
	onFitView,
	onToggleLock,
	isLocked,
	onToggleMinimap,
	minimapState,
	onZoomIn,
	onZoomOut
}: NavigationControlsProps) {
	const { fitView } = useReactFlow();
	const [isVisible, setIsVisible] = useState(false); // Começa oculto (ou visível no início?) -> Vamos começar visível pra UX
	const [isPinned, setIsPinned] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Iniciar visível por um tempo
	useEffect(() => {
		setIsVisible(true);
		resetHideTimer();
		return () => clearTimer();
	}, []);

	const clearTimer = () => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
	};

	const resetHideTimer = () => {
		clearTimer();
		if (isPinned) return;

		timeoutRef.current = setTimeout(() => {
			setIsVisible(false);
		}, 5000); // 5 segundos
	};

	const handleMouseEnter = () => {
		setIsVisible(true);
		clearTimer();
	};

	const handleMouseLeave = () => {
		resetHideTimer();
	};

	const togglePin = () => {
		const newPinned = !isPinned;
		setIsPinned(newPinned);
		setIsVisible(true);
		if (newPinned) {
			clearTimer();
		} else {
			resetHideTimer();
		}
	};

	// Fallback handleFitView
	const handleFitViewInternal = () => {
		if (onFitView) onFitView();
		else fitView({ duration: 800, padding: 0.2 });
	};

	return (
		// Zona de Detecção Invisível (Trigger Area)
		<div
			className="fixed bottom-0 left-0 w-64 h-64 z-40 flex items-end justify-start pointer-events-none"
		>
			{/* Área interativa real que captura o mouse */}
			<div
				className="w-full h-full pointer-events-auto"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{/* Container do Dock (sujeito à "sucção lateral") */}
				<div
					className={`
						absolute bottom-8 left-8 flex flex-col items-center gap-2 px-3 py-3 
						bg-white/80 backdrop-blur-md rounded-full shadow-xl border border-white/20
						transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom-left
						${isVisible
							? 'translate-x-0 scale-100 opacity-100 rotate-0'
							: '-translate-x-16 scale-75 -rotate-12 opacity-0 blur-sm'} 
					`}
				>
					{/* Botão de Pin (Novo) */}
					<button
						onClick={togglePin}
						className={`
							flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300
							hover:bg-slate-100 cursor-pointer mb-2
							${isPinned ? 'text-blue-500' : 'text-slate-400 hover:text-slate-600'}
						`}
						title={isPinned ? "Desafixar Dock" : "Fixar Dock"}
					>
						{isPinned ? <Pin size={16} fill="currentColor" /> : <PinOff size={16} />}
					</button>

					{/* Zoom In (+ key usually, but here mouse) */}
					<button
						onClick={onZoomIn}
						className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-white hover:text-slate-900 hover:scale-110 hover:shadow-lg text-slate-600 hover:shadow-md cursor-pointer"
						title="Zoom In"
					>
						<Plus size={20} />
					</button>

					{/* Zoom Out */}
					<button
						onClick={onZoomOut}
						className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-white hover:text-slate-900 hover:scale-110 hover:shadow-lg text-slate-600 hover:shadow-md cursor-pointer"
						title="Zoom Out"
					>
						<Minus size={20} />
					</button>

					<div className="w-6 h-px bg-slate-200/50" />

					{/* Fit View (C) */}
					<button
						onClick={handleFitViewInternal}
						className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:bg-white hover:text-slate-900 hover:scale-110 hover:shadow-lg text-slate-600 hover:shadow-md cursor-pointer"
						title="Centralizar (C)"
					>
						<Maximize2 size={20} />
					</button>

					<div className="w-6 h-px bg-slate-200/50" />

					{/* Lock/Unlock (T) */}
					<button
						onClick={onToggleLock}
						className={`
							flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
							hover:scale-110 hover:shadow-lg cursor-pointer
							${isLocked ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'text-slate-600 hover:bg-white hover:text-slate-900'}
						`}
						title={isLocked ? "Desbloquear (T)" : "Bloquear Edição (T)"}
					>
						{isLocked ? <Lock size={20} /> : <Unlock size={20} />}
					</button>

					{/* Minimap (V) */}
					<button
						onClick={onToggleMinimap}
						className={`
							flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
							hover:scale-110 hover:shadow-lg cursor-pointer relative
							${minimapState === 'visible' ? 'bg-blue-100 text-blue-600' : ''}
							${minimapState === 'hidden' ? 'text-slate-400 hover:text-slate-600' : 'text-slate-600 hover:text-blue-600'}
						`}
						title={`Minimapa: ${minimapState === 'auto' ? 'Auto' : minimapState === 'visible' ? 'Visível' : 'Oculto'} (V)`}
					>
						<Map size={20} className={minimapState === 'auto' ? 'opacity-80' : ''} />
						{minimapState === 'auto' && (
							<span className="absolute top-2 right-2 flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
							</span>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
