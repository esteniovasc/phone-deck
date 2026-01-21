import { X } from 'lucide-react';

interface HelpModalProps {
	onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
	const shortcuts = [
		{ key: 'Shift+N', description: 'Novo Projeto' },
		{ key: 'Ctrl+S', description: 'Salvar Projeto' },
		{ key: 'N', description: 'Novo Card/Telefone' },
		{ key: 'C', description: 'Centralizar Visualização' },
		{ key: 'T', description: 'Alternar Modo Visualização (Bloquear)' },
		{ key: 'V', description: 'Alternar Minimapa' },
		{ key: '+', description: 'Aumentar Zoom' },
		{ key: '-', description: 'Diminuir Zoom' },
	];

	const tips = [
		'Clique no título do projeto para editar seu nome',
		'Arraste cards pelo canvas para reorganizar',
		'Use o painel inferior para controles rápidos (Novo, Salvar, Importar)',
		'O modo visualização bloqueia edições - perfeito para apresentações',
		'Salve seus projetos e importe-os depois para continuar o trabalho',
		'Use o minimapa para navegar em projetos grandes',
	];

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-slate-900">❓ Ajuda & Atalhos</h2>
					<button
						onClick={onClose}
						className="p-2 hover:bg-slate-100 rounded-full transition"
						aria-label="Fechar"
					>
						<X size={24} className="text-slate-600" />
					</button>
				</div>

				{/* Atalhos */}
				<div className="mb-8">
					<h3 className="text-lg font-bold text-slate-900 mb-4">⌨️ Atalhos de Teclado</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{shortcuts.map((shortcut) => (
							<div
								key={shortcut.key}
								className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
							>
								<kbd className="px-3 py-1 bg-white border border-slate-300 rounded font-mono font-semibold text-slate-700 text-sm">
									{shortcut.key}
								</kbd>
								<span className="text-slate-700">{shortcut.description}</span>
							</div>
						))}
					</div>
				</div>

				{/* Dicas */}
				<div className="mb-8">
					<h3 className="text-lg font-bold text-slate-900 mb-4">💡 Dicas Úteis</h3>
					<ul className="space-y-2">
						{tips.map((tip, index) => (
							<li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
								<span className="text-blue-600 font-bold mt-0.5">•</span>
								<span className="text-slate-700">{tip}</span>
							</li>
						))}
					</ul>
				</div>

				{/* Footer */}
				<div className="border-t border-slate-200 pt-6 text-center">
					<p className="text-slate-600 text-sm">
						PhoneDeck v1.0 - Organize sua coleção de smartphones com facilidade
					</p>
					<button
						onClick={onClose}
						className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
					>
						Entendi!
					</button>
				</div>
			</div>
		</div>
	);
}
