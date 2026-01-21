import { useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';

interface ToastProps {
	message: string;
	icon?: ReactNode;
	isVisible: boolean;
	onClose?: () => void;
	bgOverride?: string;
	position?: 'center' | 'top-right';
}

export function Toast({ message, icon, isVisible, onClose, bgOverride, position = 'center' }: ToastProps) {
	const [shouldRender, setShouldRender] = useState(false);
	const [isAnimatingIn, setIsAnimatingIn] = useState(false);

	// Persistência de dados para animação de saída
	const [lastContent, setLastContent] = useState({ message, icon });

	useEffect(() => {
		if (message) {
			setLastContent({ message, icon });
		}
	}, [message, icon]);

	// Controle de animação de entrada/saída
	useEffect(() => {
		let enterTimer: ReturnType<typeof setTimeout>;
		let exitTimer: ReturnType<typeof setTimeout>;

		if (isVisible) {
			setShouldRender(true);
			// Pequeno delay para garantir que o DOM montou antes de animar
			enterTimer = setTimeout(() => setIsAnimatingIn(true), 50);

			if (onClose) {
				const autoCloseTimer = setTimeout(() => {
					onClose();
				}, 3000); // 3s de leitura
				return () => {
					clearTimeout(autoCloseTimer);
					clearTimeout(enterTimer);
				};
			}
		} else {
			setIsAnimatingIn(false);
			exitTimer = setTimeout(() => setShouldRender(false), 300); // Tempo da transição CSS
		}

		return () => {
			clearTimeout(enterTimer);
			clearTimeout(exitTimer);
		};
	}, [isVisible, onClose]);

	if (!shouldRender) return null;

	const positionClasses = position === 'center'
		? 'left-1/2 transform -translate-x-1/2'
		: 'right-6';

	return (
		<div
			className={`
				fixed top-24 z-[60] 
				flex items-center gap-3 px-6 py-3 rounded-full shadow-xl 
				transition-all duration-300 ease-out
				${positionClasses}
				${isAnimatingIn ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'} 
				${bgOverride || 'bg-slate-900/90 text-white backdrop-blur-md border border-white/10'}
			`}
		>
			{lastContent.icon && <span className="opacity-90">{lastContent.icon}</span>}
			{lastContent.icon && <div className="w-px h-4 bg-white/20"></div>}
			<span className="font-medium text-sm tracking-wide">{lastContent.message}</span>
		</div>
	);
}
