import { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface NewProjectModalProps {
	onConfirm: (projectName: string) => void;
	onCancel: () => void;
}

/**
 * Modal para criar um novo projeto
 * Solicita nome e limpa o board atual
 */
export function NewProjectModal({ onConfirm, onCancel }: NewProjectModalProps) {
	const [projectName, setProjectName] = useState('Novo Projeto');

	const handleConfirm = () => {
		const sanitizedName = projectName.trim() || 'Novo Projeto';
		onConfirm(sanitizedName);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleConfirm();
		}
		if (e.key === 'Escape') {
			onCancel();
		}
	};

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
				className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full"
			>
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-slate-900">Novo Projeto</h2>
					<button
						onClick={onCancel}
						className="p-2 hover:bg-slate-100 rounded-lg transition"
						aria-label="Fechar modal"
					>
						<X className="w-5 h-5 text-slate-600" />
					</button>
				</div>

				<div className="space-y-4 mb-6">
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Nome do Projeto
						</label>
						<input
							type="text"
							value={projectName}
							onChange={(e) => setProjectName(e.target.value)}
							onKeyDown={handleKeyDown}
							autoFocus
							className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
							placeholder="Ex: Minha Coleção"
						/>
					</div>

					<div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
						<p className="text-sm text-amber-900">
							⚠️ Isso limpará o board atual. Certifique-se de ter feito backup!
						</p>
					</div>
				</div>

				<div className="flex gap-3 justify-end">
					<button
						onClick={onCancel}
						className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-medium"
					>
						Cancelar
					</button>
					<button
						onClick={handleConfirm}
						className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
					>
						Criar Projeto
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
}
