import { useEffect } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResetBoardModalProps {
	onConfirm: () => void;
	onCancel: () => void;
}

export function ResetBoardModal({ onConfirm, onCancel }: ResetBoardModalProps) {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onCancel();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [onCancel]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
		>
			<motion.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.95, opacity: 0 }}
				transition={{ duration: 0.2 }}
				className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full"
			>
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
						<Trash2 className="text-red-600" />
						Limpar Board
					</h2>
					<button
						onClick={onCancel}
						className="p-2 hover:bg-slate-100 rounded-lg transition"
						aria-label="Fechar"
					>
						<X className="w-5 h-5 text-slate-600" />
					</button>
				</div>

				{/* Content */}
				<div className="space-y-4 mb-8">
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 text-red-900">
						<AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
						<div className="text-sm">
							<p className="font-bold mb-1">Atenção!</p>
							<p>
								Isso removerá todos os celulares do board atual. Essa ação não pode ser desfeita se você não tiver salvo um backup.
							</p>
						</div>
					</div>
					<p className="text-slate-600">
						Tem certeza que deseja prosseguir e começar do zero?
					</p>
				</div>

				{/* Footer */}
				<div className="flex gap-3 justify-end">
					<button
						onClick={onCancel}
						className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-medium"
					>
						Cancelar
					</button>
					<button
						onClick={onConfirm}
						className="px-6 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition font-medium shadow-md hover:shadow-lg"
					>
						Sim, Limpar Tudo
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
}
