import { ListFilter, Plus, Building2, Gamepad2, Baby } from 'lucide-react';
import type { AnalysisMode } from '../../types';

interface ModeSelectorProps {
	currentMode: AnalysisMode;
	onModeChange: (mode: AnalysisMode) => void;
}

/**
 * ModeSelector: Barra de Filtros (Estilo Toolbar)
 * 
 * Features:
 * - Ícone Filtro (Prefixo)
 * - Separador
 * - Ícones de Modos (Building, Gamepad, Baby)
 * - Botão Adicionar (+)
 */
export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
	const modes = [
		{ value: 'backup_city', label: 'Backup/Cidade', icon: Building2, color: 'text-sky-600', bg: 'bg-sky-50' },
		{ value: 'collection', label: 'Coleção', icon: Gamepad2, color: 'text-violet-600', bg: 'bg-violet-50' },
		{ value: 'kids_safe', label: 'Infantil', icon: Baby, color: 'text-pink-600', bg: 'bg-pink-50' },
	] as const;

	const handleModeClick = (mode: AnalysisMode) => {
		// Toggle: se já está ativo, volta pra Padrão; senão, ativa o modo
		if (currentMode === mode) {
			onModeChange('default');
		} else {
			onModeChange(mode);
		}
	};

	return (
		// Container vidro fosco (Igual TopToolbar) com padding restaurado para consistência visual
		<div className="h-14 flex items-center gap-1 p-1 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-400 pointer-events-auto">

			{/* Ícone de Filtro (Prefixo) */}
			<div className="p-1.5 text-slate-400" title="Filtros Ativos">
				<ListFilter className="w-6 h-6" />
			</div>

			{/* Separador */}
			<div className="h-6 w-px bg-slate-200 mx-1" />

			{/* Lista de Filtros */}
			{modes.map((mode) => {
				const Icon = mode.icon;
				const isActive = currentMode === mode.value;

				return (
					<button
						key={mode.value}
						onClick={() => handleModeClick(mode.value)}
						className={`
              p-1.5 rounded-lg transition-all duration-300 group
              ${isActive
								? `${mode.bg} ${mode.color} shadow-sm ring-1 ring-inset ring-black/5`
								: 'text-slate-500 hover:bg-slate-100'
							}
            `}
						title={isActive ? 'Desativar Filtro' : `Filtrar: ${mode.label}`}
					>
						<Icon
							className={`
                w-6 h-6 transition-transform duration-300
                ${isActive ? 'scale-110' : 'group-hover:scale-110'}
              `}
						/>
					</button>
				);
			})}

			{/* Botão Adicionar (Futuro) */}
			<button
				className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all duration-300 group ml-1"
				title="Novo Filtro (Em breve)"
			>
				<Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
			</button>

		</div>
	);
}
