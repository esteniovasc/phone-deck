import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface ToastProps {
	message: string;
	icon?: ReactNode;
	isVisible: boolean;
	onClose?: () => void;
	bgOverride?: string; // Para cores customizadas (opcional)
}

export function Toast({ message, icon, isVisible, onClose, bgOverride }: ToastProps) {
	const [shouldRender, setShouldRender] = useState(false);

	// Controle de animação de entrada/saída
	useEffect(() => {
		if (isVisible) {
			setShouldRender(true);
			if (onClose) {
				const timer = setTimeout(() => {
					onClose(); // Auto close via pai se fornecido
				}, 2000);
				return () => clearTimeout(timer);
			}
		} else {
			const timer = setTimeout(() => setShouldRender(false), 300); // Tempo da animação de saída
			return () => clearTimeout(timer);
		}
	}, [isVisible, onClose]);

	if (!shouldRender) return null;

	return (
		<div
			className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[60] flex items-center gap-3 px-6 py-3 rounded-full shadow-xl transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
				} ${bgOverride || 'bg-slate-900/90 text-white backdrop-blur-md border border-white/10'}`}
		>
			{icon && <span className="opacity-90">{icon}</span>}
			{icon && <div className="w-px h-4 bg-white/20"></div>}
			<span className="font-medium text-sm tracking-wide">{message}</span>
		</div>
	);
}
