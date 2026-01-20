import { useEffect } from 'react';

/**
 * useHotkeys Hook
 * Escuta eventos globais de keydown e executa callback.
 * Ignora inputs de texto para evitar conflitos de digitação.
 * 
 * @param callback Função chamada quando uma tecla é pressionada
 */
export function useHotkeys(callback: (key: string) => void) {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Ignorar se o foco estiver em inputs de texto
			const target = event.target as HTMLElement;
			if (
				target.tagName === 'INPUT' ||
				target.tagName === 'TEXTAREA' ||
				target.isContentEditable
			) {
				return;
			}

			callback(event.key);
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [callback]);
}
