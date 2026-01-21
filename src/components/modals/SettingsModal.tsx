import { useEffect } from 'react';
import { X, Settings, MousePointer2, Move, ZoomIn } from 'lucide-react';
import { motion } from 'framer-motion';

export type NavigationMode = 'default' | 'figma';

interface SettingsModalProps {
	currentMode: NavigationMode;
	onModeChange: (mode: NavigationMode) => void;
	onClose: () => void;
}

export function SettingsModal({ currentMode, onModeChange, onClose }: SettingsModalProps) {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [onClose]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
			onClick={onClose}
		>
			<motion.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.95, opacity: 0 }}
				transition={{ duration: 0.2 }}
				className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
						<Settings className="text-slate-700" />
						Configurações
					</h2>
					<button
						onClick={onClose}
						className="p-2 hover:bg-slate-100 rounded-lg transition"
						aria-label="Fechar"
					>
						<X className="w-5 h-5 text-slate-600" />
					</button>
				</div>

				{/* Navigation Settings */}
				<div className="space-y-6">
					<div>
						<h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
							<MousePointer2 className="w-5 h-5 text-blue-600" />
							Navegação e Scroll
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Option: Figma Style */}
							<button
								onClick={() => onModeChange('figma')}
								className={`
									relative p-4 rounded-xl border-2 text-left transition-all duration-200
									${currentMode === 'figma'
										? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200 ring-offset-2'
										: 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
									}
								`}
							>
								<div className="flex items-center justify-between mb-3">
									<span className="font-bold text-slate-900">Padrão Figma</span>
									{currentMode === 'figma' && (
										<span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
									)}
								</div>
								<div className="text-sm text-slate-600 space-y-2">
									<div className="flex items-center gap-2">
										<Move className="w-4 h-4" />
										<span>Scroll = Mover (Pan)</span>
									</div>
									<div className="flex items-center gap-2">
										<ZoomIn className="w-4 h-4" />
										<span>Ctrl + Scroll = Zoom</span>
									</div>
								</div>
							</button>

							{/* Option: Classic Style */}
							<button
								onClick={() => onModeChange('default')}
								className={`
									relative p-4 rounded-xl border-2 text-left transition-all duration-200
									${currentMode === 'default'
										? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200 ring-offset-2'
										: 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
									}
								`}
							>
								<div className="flex items-center justify-between mb-3">
									<span className="font-bold text-slate-900">Padrão Mapa</span>
									{currentMode === 'default' && (
										<span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
									)}
								</div>
								<div className="text-sm text-slate-600 space-y-2">
									<div className="flex items-center gap-2">
										<ZoomIn className="w-4 h-4" />
										<span>Scroll = Zoom</span>
									</div>
									<div className="flex items-center gap-2">
										<Move className="w-4 h-4" />
										<span>Arrastar = Mover</span>
									</div>
								</div>
							</button>
						</div>

						<p className="mt-4 text-xs text-slate-500 bg-slate-100 p-3 rounded-lg border border-slate-200">
							<strong>Dica:</strong> O gesto de pinça no trackpad para zoom funciona em ambos os modos.
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
					<button
						onClick={onClose}
						className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium shadow-md hover:shadow-lg"
					>
						Concluído
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
}
