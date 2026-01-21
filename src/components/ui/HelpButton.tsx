import { HelpCircle } from 'lucide-react';

interface HelpButtonProps {
	onClick: () => void;
}

export function HelpButton({ onClick }: HelpButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`
				fixed top-6 right-6 z-40
				h-12 px-3 rounded-full
				bg-white/80 backdrop-blur-md border border-white/20
				shadow-lg hover:shadow-xl
				flex items-center justify-center
				text-slate-600 hover:text-blue-600
				transition-all duration-300
				group
			`}
			title="Ajuda & Atalhos (Shift+?)"
		>
			<HelpCircle size={24} className="flex-shrink-0" />
			<span className="max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 group-hover:ml-2 overflow-hidden transition-all duration-300 ease-in-out font-medium text-slate-700 whitespace-nowrap">
				Ajuda
			</span>
		</button>
	);
}
