import React from 'react';
import { Download, Settings, RotateCcw, FolderOpen, FileText } from 'lucide-react';

interface TopToolbarProps {
	onNewProject: () => void;
	onOpenProject: () => void;
	onReset: () => void;
	onBackup: () => void;
	onSettings: () => void;
	isEmpty?: boolean;
}

export function TopToolbar({ onNewProject, onOpenProject, onReset, onBackup, onSettings, isEmpty }: TopToolbarProps) {
	return (
		<div className="h-14 flex items-center gap-1 p-1 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-400">
			{/* Novo Projeto */}
			<button
				onClick={onNewProject}
				className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300 group"
				title="Novo Projeto (Ctrl+N)"
			>
				<FileText className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
			</button>

			{/* Abrir Projeto */}
			<button
				onClick={onOpenProject}
				className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-300 group"
				title="Abrir Projeto"
			>
				<FolderOpen className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
			</button>

			{/* Limpar Board */}
			<button
				onClick={onReset}
				className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 group"
				title="Limpar Board"
			>
				<RotateCcw className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
			</button>

			{/* Download (Backup) - Hover Verde */}
			<button
				onClick={onBackup}
				disabled={isEmpty}
				className={`p-1.5 rounded-lg transition-all duration-300 group ${isEmpty
					? 'text-slate-300 cursor-not-allowed'
					: 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
					}`}
				title={isEmpty ? 'Projeto vazio' : 'Download / Salvar (Ctrl+S)'}
			>
				<Download className={`w-6 h-6 transition-transform duration-300 ${!isEmpty && 'group-hover:scale-110'}`} />
			</button>

			<div className="w-px h-6 bg-slate-200 mx-1" />

			{/* Configurações */}
			<button
				onClick={onSettings}
				className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 group"
				title="Configurações"
			>
				<Settings className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
			</button>
		</div>
	);
}
