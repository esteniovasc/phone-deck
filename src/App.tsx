import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
	ReactFlow,
	Background,
	MiniMap,
	applyNodeChanges,
	type Node,
	type NodeTypes,
	type OnNodesChange,
	type OnEdgesChange,
	useReactFlow,
	Controls,
	PanOnScrollMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AnimatePresence } from 'framer-motion';
import { EditModal } from './components/modals/EditModal';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { EditProjectNameModal } from './components/modals/EditProjectNameModal';
import { HelpModal } from './components/modals/HelpModal';
import { ResetBoardModal } from './components/modals/ResetBoardModal';
import { SettingsModal, type NavigationMode } from './components/modals/SettingsModal';
import { FloatingDock } from './components/ui/FloatingDock';
import { ModeSelector } from './components/ui/ModeSelector';
import { NavigationControls } from './components/ui/NavigationControls';
import { HelpButton } from './components/ui/HelpButton';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDecisionEngine } from './hooks/useDecisionEngine';
import PhoneNode from './components/canvas/PhoneNode';
import { Eye, EyeOff, Activity } from 'lucide-react';
import { Toast } from './components/ui/Toast';
import { useHotkeys } from './hooks/useHotkeys';
import { findSmartPosition } from './utils/positionFinder';
import { importProject, exportProject } from './utils/projectManager';
import type { Phone, AnalysisMode } from './types';

/**
 * Componente auxiliar que centraliza a visualização quando um novo card é criado
 */
function AutoFitViewOnDraft({ phones }: { phones: Phone[] }) {
	const { fitView } = useReactFlow();

	useEffect(() => {
		const draftPhone = phones.find((p) => p.isDraft);
		if (draftPhone) {
			setTimeout(() => {
				fitView({
					nodes: [{ id: draftPhone.id }],
					padding: 1.0, //Variavel para ajustar nível de zoom ao criar novo card
					duration: 600,
				});
			}, 100);
		}
	}, [phones, fitView]);

	return null;
}

/**
 * Componente que força o ajuste da câmera quando acionado
 */
function FitViewHandler({ trigger, onComplete }: { trigger: boolean; onComplete: () => void }) {
	const { fitView } = useReactFlow();

	useEffect(() => {
		if (trigger) {
			// Pequeno delay para garantir que os nodes foram renderizados com novas posições
			const timer = setTimeout(() => {
				fitView({ padding: 0.2, duration: 800 });
				onComplete();
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [trigger, fitView, onComplete]);

	return null;
}

/**
 * Componente que gerencia zoom via teclado
 */
function KeyboardZoomHandler({
	onZoomIn,
	onZoomOut
}: {
	onZoomIn: () => void;
	onZoomOut: () => void;
}) {
	const { zoomIn, zoomOut } = useReactFlow();

	useEffect(() => {
		const handleZoom = (action: 'in' | 'out') => {
			if (action === 'in') {
				zoomIn();
				onZoomIn();
			} else {
				zoomOut();
				onZoomOut();
			}
		};

		// Armazenar referência para cleanup
		(window as any).__phonedeckZoomHandler = handleZoom;

		return () => {
			delete (window as any).__phonedeckZoomHandler;
		};
	}, [zoomIn, zoomOut, onZoomIn, onZoomOut]);

	return null;
}

type MinimapBehavior = 'auto' | 'visible' | 'hidden';

function App() {
	const [phones, setPhones] = useLocalStorage<Phone[]>('phonedeck-data', []);
	const [projectName, setProjectName] = useLocalStorage<string>('phonedeck-project-name', 'Sem Título');
	const [isViewMode, setIsViewMode] = useState(false);
	const [showNewProjectModal, setShowNewProjectModal] = useState(false);
	const [showEditProjectName, setShowEditProjectName] = useState(false);
	const [showHelpModal, setShowHelpModal] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('default');
	const [nodes, setNodes] = useState<Node[]>([]);
	const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
	const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
	const [lastSavedPhones, setLastSavedPhones] = useState<Phone[]>(phones);
	const [pendingImport, setPendingImport] = useState<{ phones: Phone[]; fileName: string; projectName?: string } | null>(null);
	const [showConfirmImport, setShowConfirmImport] = useState(false);
	const [showMiniMap, setShowMiniMap] = useState(false);
	const [minimapBehavior, setMinimapBehavior] = useState<MinimapBehavior>('auto');
	const [toastState, setToastState] = useState<{ show: boolean; message: string; icon: React.ReactNode }>({
		show: false,
		message: '',
		icon: null,
	});
	const miniMapTimeoutRef = useRef<number | null>(null);
	const [triggerFitView, setTriggerFitView] = useState(false);
	const [showResetModal, setShowResetModal] = useState(false);
	const [showSettingsModal, setShowSettingsModal] = useState(false);
	const [navigationMode, setNavigationMode] = useState<NavigationMode>(() => {
		const saved = localStorage.getItem('phone-deck-nav-mode');
		return (saved as NavigationMode) || 'default';
	});

	useEffect(() => {
		localStorage.setItem('phone-deck-nav-mode', navigationMode);
	}, [navigationMode]);

	const fitViewRef = useRef<((options?: any) => void) | null>(null);

	// Refs para handlers (para evitar problemas de dependência)
	const handlersRef = useRef({
		handleBackupJSON: () => { },
		handleAddPhone: () => { },
		handleToggleViewMode: () => { },
		handleZoomIn: () => { },
		handleZoomOut: () => { },
	});

	// Calcular se há mudanças não salvas
	const isDirty = useMemo(() => {
		return JSON.stringify(phones) !== JSON.stringify(lastSavedPhones);
	}, [phones, lastSavedPhones]);

	// Node Types para React Flow
	const nodeTypes = useMemo<NodeTypes>(
		() => ({
			phoneNode: PhoneNode,
		}),
		[]
	);

	const handleNodesChange: OnNodesChange = useCallback(
		(changes) => {
			setNodes((nds) => applyNodeChanges(changes, nds));
		},
		[]
	);

	const handleEdgesChange: OnEdgesChange = useCallback(
		() => {
			// Para edges, não precisamos fazer muita coisa
			// Apenas mantemos o estado vazio por enquanto
		},
		[]
	);

	/**
	 * Salvar posição do node quando o drag termina
	 */
	const handleNodeDragStop = useCallback(
		(_: any, node: Node) => {
			setPhones(
				phones.map((phone) =>
					phone.id === node.id
						? {
							...phone,
							position: {
								x: Math.round(node.position.x),
								y: Math.round(node.position.y),
							},
						}
						: phone
				)
			);
		},
		[phones, setPhones]
	);

	const handleAddPhone = useCallback(() => {
		const smartPosition = findSmartPosition(nodes);
		const newPhone: Phone = {
			id: crypto.randomUUID(),
			model: '',
			year: new Date().getFullYear(),
			image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=400&h=600&fit=crop',
			position: smartPosition,
			isDraft: true,
			specs: { battery: '---', weight: '---', thickness: '---' },
			badges: { network: '4G', resilience: 'medium', batteryStatus: 'neutral' },
			highlight: 'Adicione informações do aparelho',
			price: { installment: 'A definir', total: 'A definir' },
			isMinimized: false,
		};
		const newPhonesList = [...phones, newPhone];
		setPhones(newPhonesList);
	}, [phones, nodes]);

	const handleEditPhone = useCallback((phone: Phone) => {
		setEditingId(phone.id);
	}, []);

	const handleSaveEdit = useCallback((updatedPhone: Phone) => {
		const updatedPhonesList = phones.map((phone) =>
			phone.id === updatedPhone.id ? updatedPhone : phone
		);
		setPhones(updatedPhonesList);
		setEditingId(null);
	}, [phones]);

	const handleSaveDraft = useCallback((id: string, modelName: string) => {
		const updatedPhonesList = phones.map((phone) =>
			phone.id === id
				? { ...phone, model: modelName, isDraft: false }
				: phone
		);
		setPhones(updatedPhonesList);
	}, [phones]);

	const handleDeletePhone = useCallback((id: string) => {
		const filteredPhones = phones.filter((phone) => phone.id !== id);
		setPhones(filteredPhones);
	}, [phones]);

	/**
	 * Handler para processar import com validação de mudanças não salvas
	 */
	const handleProcessImport = useCallback(
		async (file: File) => {
			const result = await importProject(file);

			if (result.error) {
				setImportMessage({ type: 'error', text: result.error });
				setTimeout(() => setImportMessage(null), 4000);
				return;
			}

			// Se há mudanças não salvas, pedir confirmação
			if (isDirty) {
				setPendingImport({ phones: result.phones, fileName: file.name, projectName: result.projectName });
				setShowConfirmImport(true);
				return;
			}

			// Carregar direto se não há mudanças
			setPhones(result.phones);
			setProjectName(result.projectName);
			setLastSavedPhones(result.phones);
			setImportMessage({
				type: 'success',
				text: '✓ Projeto carregado!',
			});
			setTimeout(() => setImportMessage(null), 3000);
			setTriggerFitView(true);
		},
		[isDirty, setPhones]
	);

	/**
	 * Confirmar import descartando mudanças anteriores
	 */
	const handleConfirmImport = useCallback(() => {
		if (pendingImport) {
			setPhones(pendingImport.phones);
			setProjectName(pendingImport.projectName || 'Sem Título');
			setLastSavedPhones(pendingImport.phones);
			setImportMessage({
				type: 'success',
				text: '✓ Projeto carregado!',
			});
			setTimeout(() => setImportMessage(null), 3000);
			setTriggerFitView(true);
		}
		setShowConfirmImport(false);
		setPendingImport(null);
	}, [pendingImport, setPhones]);

	/**
	 * Cancelar import
	 */
	const handleCancelImport = useCallback(() => {
		setShowConfirmImport(false);
		setPendingImport(null);
	}, []);

	/**
	 * Handler para abrir arquivo via input file
	 */
	const handleOpenProjectClick = useCallback(() => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				await handleProcessImport(file);
			}
		};
		input.click();
	}, [handleProcessImport]);

	/**
	 * Handler para Drag Over no canvas
	 */
	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOverCanvas(true);
	}, []);

	/**
	 * Handler para Drag Leave do canvas
	 */
	const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		// Só remove o estado se sair do container principal
		if (e.currentTarget === e.target) {
			setIsDragOverCanvas(false);
		}
	}, []);

	/**
	 * Handler para Drop de arquivo no canvas
	 */
	const handleDrop = useCallback(
		async (e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragOverCanvas(false);

			const files = e.dataTransfer.files;
			if (!files || files.length === 0) return;

			const file = files[0];

			// Verificar se é arquivo JSON
			if (file.name.endsWith('.json')) {
				await handleProcessImport(file);
			} else {
				setImportMessage({
					type: 'error',
					text: 'Por favor, arraste um arquivo .json',
				});
				setTimeout(() => setImportMessage(null), 3000);
			}
		},
		[handleProcessImport]
	);

	const handleViewportChange = useCallback(() => {
		setShowMiniMap(true);

		if (miniMapTimeoutRef.current) {
			clearTimeout(miniMapTimeoutRef.current);
		}

		miniMapTimeoutRef.current = setTimeout(() => {
			if (minimapBehavior === 'auto') {
				setShowMiniMap(false);
			}
		}, 2000);
	}, [minimapBehavior]);

	// Hook para fitView (usado em shortcuts)
	// Removido - agora usa KeyboardShortcutsHandler dentro do ReactFlow

	/**

	/**
	 * Sincronizar nodes quando phones ou analysisMode mudam
	 * Isso mantém os nodes sempre em sync com o estado de phones
	 */
	useEffect(() => {
		const newNodes = phones.map((phone, index) => ({
			id: phone.id,
			data: {
				phone,
				visualStatus: useDecisionEngine(phone, analysisMode),
				onEdit: handleEditPhone,
				onDelete: handleDeletePhone,
				onSaveDraft: handleSaveDraft,
			},
			position: phone.position || {
				x: (index % 3) * 420,
				y: Math.floor(index / 3) * 520,
			},
			type: 'phoneNode',
			draggable: !isViewMode, // Desabilita drag em modo visualização
			connectable: !isViewMode, // Desabilita conexões em modo visualização
		} as Node));
		setNodes(newNodes);
	}, [phones, analysisMode, isViewMode, handleEditPhone, handleDeletePhone, handleSaveDraft]);

	// Fazer focus no input do draft quando há novo card
	useEffect(() => {
		const draftPhone = phones.find((p) => p.isDraft);
		if (draftPhone) {
			setTimeout(() => {
				const input = document.getElementById(`draft-input-${draftPhone.id}`);
				if (input) {
					input.focus();
				}
			}, 500);
		}
	}, [phones]);

	const handleBackupJSON = () => {
		exportProject(phones, projectName);
		setLastSavedPhones(phones);
		setToastState({
			show: true,
			message: `✓ Projeto "${projectName}" salvo`,
			icon: <Activity size={20} />,
		});
		setTimeout(() => setToastState({ ...toastState, show: false }), 2000);
	};

	const handleReset = () => {
		setShowResetModal(true);
	};

	const handleConfirmReset = () => {
		setPhones([]);
		setImportMessage({
			type: 'success',
			text: 'Board limpo com sucesso',
		});
		setShowResetModal(false);
		setTimeout(() => setImportMessage(null), 2000);
	};

	const handleNewProject = useCallback(
		(name: string) => {
			setProjectName(name);
			setPhones([]);
			setLastSavedPhones([]);
			setShowNewProjectModal(false);
			setToastState({
				show: true,
				message: `✓ Novo projeto: "${name}"`,
				icon: <Activity size={20} />,
			});
			setTimeout(() => setToastState({ ...toastState, show: false }), 2000);
		},
		[toastState]
	);

	const handleToggleViewMode = useCallback(() => {
		const newMode = !isViewMode;
		setIsViewMode(newMode);
		setToastState({
			show: true,
			message: newMode ? '🔒 Modo Visualização' : '✏️ Modo Edição',
			icon: newMode ? <Eye size={20} /> : <EyeOff size={20} />,
		});
		setTimeout(() => {
			setToastState((prev) => ({ ...prev, show: false }));
		}, 1500);
	}, [isViewMode]);

	const handleZoomIn = useCallback(() => {
		setToastState({
			show: true,
			message: '🔍 Zoom +',
			icon: <Activity size={20} />,
		});
	}, []);

	const handleZoomOut = useCallback(() => {
		setToastState({
			show: true,
			message: '🔍 Zoom -',
			icon: <Activity size={20} />,
		});
	}, []);

	// Sincronizar refs dos handlers (sem dependências)
	useEffect(() => {
		handlersRef.current = {
			handleBackupJSON,
			handleAddPhone,
			handleToggleViewMode,
			handleZoomIn,
			handleZoomOut,
		};
	});

	// Atalhos de Teclado Global (Todos fora do ReactFlow context)
	useHotkeys((key, event) => {
		// Ctrl+S para salvar
		if (event.ctrlKey || event.metaKey) {
			const lowerKey = key.toLowerCase();
			if (lowerKey === 's') {
				event.preventDefault();
				handlersRef.current.handleBackupJSON();
				return;
			}
		}

		// Shift+N para novo projeto
		if ((event.shiftKey && key.toLowerCase() === 'n') && !event.ctrlKey && !event.metaKey) {
			event.preventDefault();
			setShowNewProjectModal(true);
			return;
		}

		// N para novo card
		if (key.toLowerCase() === 'n' && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
			handlersRef.current.handleAddPhone();
			return;
		}

		// C para centralizar
		if (key.toLowerCase() === 'c' && !event.ctrlKey && !event.metaKey) {
			setTriggerFitView(true);
			setToastState({
				show: true,
				message: '🎯 Centralizado',
				icon: <Activity size={20} />,
			});
			return;
		}

		// T para alternar modo visualização
		if (key.toLowerCase() === 't' && !event.ctrlKey && !event.metaKey) {
			handlersRef.current.handleToggleViewMode();
			return;
		}

		// V para minimapa
		if (key.toLowerCase() === 'v') {
			setMinimapBehavior((prev) => {
				let next: MinimapBehavior;
				let message: string;
				let icon: React.ReactNode;

				if (prev === 'auto') {
					next = 'visible';
					message = 'Minimapa Sempre Visível';
					icon = <Eye size={18} className="text-blue-400" />;
				} else if (prev === 'visible') {
					next = 'hidden';
					message = 'Minimapa Oculto';
					icon = <EyeOff size={18} className="text-slate-400" />;
				} else {
					next = 'auto';
					message = 'Minimapa Automático';
					icon = <Activity size={18} className="text-green-400" />;
				}

				// Usar timeout para atualizar toast e visibilidade após state update
				setTimeout(() => {
					setToastState({ show: true, message, icon });
					if (next === 'visible') setShowMiniMap(true);
					if (next === 'hidden') setShowMiniMap(false);
				}, 0);

				return next;
			});
		}

		// + para aumentar zoom
		if (key === '+' || key === '=') {
			event.preventDefault();
			handlersRef.current.handleZoomIn();
			// Chamar zoom via referência global criada pelo KeyboardZoomHandler
			if ((window as any).__phonedeckZoomHandler) {
				(window as any).__phonedeckZoomHandler('in');
			}
			return;
		}

		// - para diminuir zoom
		if (key === '-' || key === '_') {
			event.preventDefault();
			handlersRef.current.handleZoomOut();
			// Chamar zoom via referência global criada pelo KeyboardZoomHandler
			if ((window as any).__phonedeckZoomHandler) {
				(window as any).__phonedeckZoomHandler('out');
			}
			return;
		}

		// ? para ajuda (Shift+/)
		if (event.shiftKey && event.key === '?') {
			event.preventDefault();
			setShowHelpModal(true);
			return;
		}
	}, []);

	return (
		<div
			className={`w-screen h-screen bg-slate-50 relative transition-colors ${isDragOverCanvas ? 'bg-blue-50' : ''
				}`}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			{/* React Flow Canvas */}
			<ReactFlow
				nodes={nodes}
				edges={[]}
				onNodesChange={handleNodesChange}
				onEdgesChange={handleEdgesChange}
				onNodeDragStop={handleNodeDragStop}
				nodeTypes={nodeTypes}
				onMove={handleViewportChange}
				onMoveStart={() => setShowMiniMap(true)}
				fitView
				minZoom={0.1} // Ajusta o zoom mínimo do canvas
				panOnScroll={navigationMode === 'figma'}
				zoomOnScroll={navigationMode === 'default'}
				panOnScrollMode={PanOnScrollMode.Free}
				selectionOnDrag={false}
				panOnDrag={true} // Permite arrastar com botão esquerdo
			>
				<Background />
				<AutoFitViewOnDraft phones={phones} />
				<FitViewHandler trigger={triggerFitView} onComplete={() => setTriggerFitView(false)} />
				<KeyboardZoomHandler onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />


				{/* MiniMap estilizado */}
				<MiniMap
					position="bottom-right"
					style={{
						backgroundColor: 'rgba(255, 255, 255, 0.5)',
						backgroundImage: 'none',
						opacity:
							minimapBehavior === 'visible' ? 1 :
								minimapBehavior === 'hidden' ? 0 :
									showMiniMap ? 1 : 0,
						transition: 'opacity 0.5s ease-in-out',
						pointerEvents:
							minimapBehavior === 'hidden' ? 'none' :
								minimapBehavior === 'visible' ? 'all' :
									showMiniMap ? 'all' : 'none',
					}}
					maskColor="rgba(240, 242, 245, 0.6)"
					nodeColor={() => {
						// Color based on status/type - Todo node tem cor azul no minimap
						return 'rgba(59, 130, 246, 0.6)'; // Blue tint
					}}
					pannable
					zoomable
				/>
			</ReactFlow>

			{/* Título do Projeto - Top Left */}
			<div className="fixed top-6 left-6 z-40">
				<button
					onClick={() => setShowEditProjectName(true)}
					className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 hover:bg-white/90 transition-all cursor-pointer group text-left"
					title="Clique para editar nome do projeto"
				>
					<p className="text-sm font-medium text-slate-600">Projeto:</p>
					<p className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{projectName}</p>
					{isViewMode && (
						<p className="text-xs text-amber-600 mt-1">🔒 Modo Visualização</p>
					)}
				</button>
			</div>

			{/* Header Flutuante (Fixed + z-index alto) */}
			<ModeSelector
				currentMode={analysisMode}
				onModeChange={setAnalysisMode}
			/>

			{/* Botão de Ajuda - Top Right */}
			<HelpButton onClick={() => setShowHelpModal(true)} />

			{/* Navigation Controls (Zoom + Fit View) */}
			<NavigationControls />

			{/* Action Dock Flutuante (Inferior) */}
			<FloatingDock
				onAddPhone={handleAddPhone}
				onBackup={handleBackupJSON}
				onReset={handleReset}
				onOpenProject={handleOpenProjectClick}
				onNewProject={() => setShowNewProjectModal(true)}
				onSettings={() => setShowSettingsModal(true)}
				isEmpty={phones.length === 0}
			/>

			{/* Modal de Edição */}
			<AnimatePresence>
				{editingId && (
					<EditModal
						phone={phones.find((p) => p.id === editingId)!}
						onSave={handleSaveEdit}
						onCancel={() => setEditingId(null)}
					/>
				)}
			</AnimatePresence>

			{/* Modal de Novo Projeto */}
			<AnimatePresence>
				{showNewProjectModal && (
					<NewProjectModal
						onConfirm={handleNewProject}
						onCancel={() => setShowNewProjectModal(false)}
					/>
				)}
			</AnimatePresence>

			{/* Modal de Limpar Board */}
			<AnimatePresence>
				{showResetModal && (
					<ResetBoardModal
						onConfirm={handleConfirmReset}
						onCancel={() => setShowResetModal(false)}
					/>
				)}
			</AnimatePresence>

			{/* Modal de Configurações */}
			<AnimatePresence>
				{showSettingsModal && (
					<SettingsModal
						currentMode={navigationMode}
						onModeChange={setNavigationMode}
						onClose={() => setShowSettingsModal(false)}
					/>
				)}
			</AnimatePresence>

			{/* Modal de Editar Nome do Projeto */}
			<AnimatePresence>
				{showEditProjectName && (
					<EditProjectNameModal
						currentName={projectName}
						onConfirm={(newName) => {
							setProjectName(newName);
							setShowEditProjectName(false);
							setToastState({
								show: true,
								message: `✓ Projeto renomeado para "${newName}"`,
								icon: <Activity size={20} />,
							});
							setTimeout(() => setToastState({ ...toastState, show: false }), 2000);
						}}
						onCancel={() => setShowEditProjectName(false)}
					/>
				)}
			</AnimatePresence>

			{/* Mensagem vazia (overlay) */}
			{phones.length === 0 && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/10">
					<div className="bg-white rounded-lg shadow-lg p-8 text-center">
						<p className="text-slate-500 text-lg mb-4">Nenhum telefone adicionado ainda.</p>
						<button
							onClick={handleAddPhone}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
						>
							Adicionar Primeiro Telefone
						</button>
					</div>
				</div>
			)}

			{/* Notification de Import */}
			{importMessage && (
				<div className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 animate-pulse ${importMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
					}`}>
					{importMessage.text}
				</div>
			)}

			{/* Modal de Confirmação de Import */}
			{showConfirmImport && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
						<h3 className="text-lg font-bold text-slate-900 mb-2">Carregar Projeto?</h3>
						<p className="text-slate-600 mb-6">
							Você tem mudanças não salvas no projeto atual. Deseja descartar e carregar <span className="font-semibold">{pendingImport?.fileName}</span>?
						</p>
						<div className="flex gap-3 justify-end">
							<button
								onClick={handleCancelImport}
								className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-medium"
							>
								Cancelar
							</button>
							<button
								onClick={handleConfirmImport}
								className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
							>
								Carregar
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Drag & Drop Overlay */}
			{isDragOverCanvas && (
				<div className="fixed inset-0 z-30 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm pointer-events-none">
					<div className="bg-blue-600 text-white px-8 py-6 rounded-lg shadow-lg text-center">
						<p className="text-xl font-semibold">📁 Solte o arquivo .json aqui</p>
						<p className="text-blue-100 text-sm mt-1">Arraste seu projeto para carregar</p>
					</div>
				</div>
			)}

			{/* Modal de Ajuda */}
			<AnimatePresence>
				{showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
			</AnimatePresence>

			{/* Toast de Feedback */}
			<Toast
				message={toastState.message}
				icon={toastState.icon}
				isVisible={toastState.show}
				onClose={() => setToastState((prev) => ({ ...prev, show: false }))}
			/>
		</div>
	);
}

export default App;

