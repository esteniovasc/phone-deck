import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface EditProjectNameModalProps {
	currentName: string;
	onConfirm: (newName: string) => void;
	onCancel: () => void;
}

export function EditProjectNameModal({ currentName, onConfirm, onCancel }: EditProjectNameModalProps) {
	const [projectName, setProjectName] = useState(currentName);
	const inputRef = useRef<HTMLInputElement>(null);

	// Selecionar todo o texto quando o modal abrir
	useEffect(() => {
		if (inputRef.current) {
			setTimeout(() => {
				inputRef.current?.select();
			}, 0);
		}
	}, []);

	const handleConfirm = () => {
		const trimmedName = projectName.trim();
		const finalName = trimmedName || 'Sem Título';
		onConfirm(finalName);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleConfirm();
		} else if (e.key === 'Escape') {
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
				className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full"
			>
				{/* Header com fechar */}
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-slate-900">Editar Nome do Projeto</h2>
					<button
						onClick={onCancel}
						className="text-slate-400 hover:text-slate-600 transition-colors"
					>
						<X size={24} />
					</button>
				</div>

				{/* Input para nome do projeto */}
				<div className="mb-4">
					<label className="block text-sm font-medium text-slate-700 mb-2">
						Nome do Projeto
					</label>
					<input
						ref={inputRef}
						type="text"
						value={projectName}
						onChange={(e) => setProjectName(e.target.value)}
						onKeyDown={handleKeyDown}
						autoFocus
						className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
					/>
				</div>

				{/* Botões de ação */}
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
						Salvar
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
}
