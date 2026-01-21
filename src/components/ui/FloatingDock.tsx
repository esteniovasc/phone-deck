import { Plus } from 'lucide-react';

interface FloatingDockProps {
	onAddPhone: () => void;
	isEmpty?: boolean;
}

/**
 * FloatingDock: Botão Flutuante Principal (Novo Celular)
 * 
 * Mantém apenas a ação principal de criação.
 * As outras ações foram movidas para a TopToolbar.
 */
export function FloatingDock({ onAddPhone, isEmpty }: FloatingDockProps) {
	return (
		<div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
			{/* Container vidro fosco */}
			<div className="flex items-center gap-3 px-2 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-xl border border-white/20">
				{/* Botão Novo (Primário) - com pulse se vazio */}
				<button
					onClick={onAddPhone}
					className={`flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 ${isEmpty ? 'animate-pulse' : ''}`}
					title={isEmpty ? "Pressione 'N' para começar" : "Adicionar novo celular (N)"}
				>
					<Plus className="w-5 h-5" />
					<span className="text-base">Novo Aparelho</span>
				</button>
			</div>
		</div>
	);
}
