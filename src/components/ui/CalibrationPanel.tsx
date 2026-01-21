import React from 'react';
import { Save, RotateCcw, X, Activity } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

export interface InteractionSettings {
	mouseZoomStep: number;
	touchZoomSpeed: number;
	mousePanSpeed: number;
	touchPanSpeed: number;
}

export const DEFAULT_INTERACTION_SETTINGS: InteractionSettings = {
	mouseZoomStep: 0.02,    // 2% per tick
	touchZoomSpeed: 0.015,  // Multiplier
	mousePanSpeed: 0.6,     // Multiplier
	touchPanSpeed: 1.0,     // Multiplier
};

interface CalibrationPanelProps {
	isOpen: boolean;
	settings: InteractionSettings;
	onUpdate: (key: keyof InteractionSettings, value: number) => void;
	onSave: () => void;
	onCancel: () => void;
	onReset: () => void;
}

export function CalibrationPanel({
	isOpen,
	settings,
	onUpdate,
	onSave,
	onCancel,
	onReset
}: CalibrationPanelProps) {
	const controls = useDragControls();

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ x: -300, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				exit={{ x: -300, opacity: 0 }}
				drag
				dragListener={false}
				dragControls={controls}
				dragMomentum={false}
				className="fixed left-8 top-32 bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/40 w-80 z-[60]"
			>
				<div
					className="flex justify-between items-center mb-6 cursor-move"
					onPointerDown={(e) => controls.start(e)}
				>
					<h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 select-none">
						<Activity size={20} className="text-blue-600" />
						Calibração
					</h3>
					<button
						onPointerDown={(e) => e.stopPropagation()} // Impede drag ao clicar no fechar
						onClick={onCancel}
						className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500 cursor-pointer"
					>
						<X size={20} />
					</button>
				</div>

				<div className="space-y-6">
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="font-medium text-slate-700">Mouse Pan Speed</span>
							<span className="text-blue-600 font-mono">{settings.mousePanSpeed.toFixed(2)}x</span>
						</div>
						<input
							type="range"
							min="0.1"
							max="2.0"
							step="0.1"
							value={settings.mousePanSpeed}
							onChange={(e) => onUpdate('mousePanSpeed', parseFloat(e.target.value))}
							className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700"
						/>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="font-medium text-slate-700">Touch Pan Speed</span>
							<span className="text-purple-600 font-mono">{settings.touchPanSpeed.toFixed(1)}x</span>
						</div>
						<input
							type="range"
							min="0.5"
							max="5.0"
							step="0.1"
							value={settings.touchPanSpeed}
							onChange={(e) => onUpdate('touchPanSpeed', parseFloat(e.target.value))}
							className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 hover:accent-purple-700"
						/>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="font-medium text-slate-700">Mouse Zoom Step</span>
							<span className="text-amber-600 font-mono">{Math.round(settings.mouseZoomStep * 100)}%</span>
						</div>
						<input
							type="range"
							min="0.005"
							max="0.1"
							step="0.005"
							value={settings.mouseZoomStep}
							onChange={(e) => onUpdate('mouseZoomStep', parseFloat(e.target.value))}
							className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-600"
						/>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="font-medium text-slate-700">Touch Zoom Sens.</span>
							<span className="text-emerald-600 font-mono">{(settings.touchZoomSpeed * 1000).toFixed(0)}</span>
						</div>
						<input
							type="range"
							min="0.005"
							max="0.05"
							step="0.001"
							value={settings.touchZoomSpeed}
							onChange={(e) => onUpdate('touchZoomSpeed', parseFloat(e.target.value))}
							className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-600"
						/>
					</div>
				</div>

				<div className="mt-8 flex gap-2">
					<button
						onClick={onSave}
						className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 shadow-lg hover:shadow-xl"
					>
						<Save size={16} />
						Salvar
					</button>
					<button
						onClick={onReset}
						className="px-3 bg-slate-100 text-slate-600 py-2 rounded-xl hover:bg-slate-200 transition-colors"
						title="Resetar Padrões"
					>
						<RotateCcw size={18} />
					</button>
				</div>

				<p className="mt-4 text-[10px] text-slate-400 text-center leading-tight">
					As alterações são aplicadas em tempo real.<br />
					Clique em Salvar para persistir.
				</p>
			</motion.div>
		</AnimatePresence>
	);
}
