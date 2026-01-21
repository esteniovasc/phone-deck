import { useEffect } from 'react';

/**
 * useHotkeys Hook
 * Escuta eventos globais de keydown e executa callback.
 * Ignora inputs de texto EXCETO para teclas especiais (Escape, Enter com Ctrl, etc).
 * 
 * @param callback Função chamada quando uma tecla é pressionada (recebe key string e KeyboardEvent)
 * @param deps Array de dependências para o useEffect
 */
export function useHotkeys(
	callback: (key: string, event: KeyboardEvent) => void,
	deps?: React.DependencyList
) {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement;
			const isInput = target.tagName === 'INPUT' || 
						   target.tagName === 'TEXTAREA' || 
						   target.isContentEditable;

			// Se está em input/textarea, só permitir teclas com Ctrl/Meta/Shift (atalhos do SO)
			// e Escape (para fechar modais)
			if (isInput && event.key !== 'Escape' && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
				return;
			}

			// IMPORTANTE: preventDefault para atalhos antes de chamar callback
			// Ctrl+S, Shift+N e outros atalhos reservados
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
				event.preventDefault();
				event.stopPropagation();
			}
			if (event.shiftKey && event.key.toLowerCase() === 'n' && !event.ctrlKey && !event.metaKey) {
				event.preventDefault();
				event.stopPropagation();
			}

			callback(event.key, event);
		};

		// Usar capture: true para interceptar ANTES do navegador
		window.addEventListener('keydown', handleKeyDown, true);
		return () => window.removeEventListener('keydown', handleKeyDown, true);
	}, deps ? deps : [callback]);
}
