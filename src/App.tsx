import { useState, useCallback, useMemo, useEffect } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EditModal } from './components/modals/EditModal';
import { FloatingDock } from './components/ui/FloatingDock';
import { ModeSelector } from './components/ui/ModeSelector';
import { NavigationControls } from './components/ui/NavigationControls';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDecisionEngine } from './hooks/useDecisionEngine';
import PhoneNode from './components/canvas/PhoneNode';
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

function App() {
  const [phones, setPhones] = useLocalStorage<Phone[]>('phonedeck-data', []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('default');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastSavedPhones, setLastSavedPhones] = useState<Phone[]>(phones);
  const [pendingImport, setPendingImport] = useState<{ phones: Phone[]; fileName: string } | null>(null);
  const [showConfirmImport, setShowConfirmImport] = useState(false);

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
        setPendingImport({ phones: result.phones, fileName: file.name });
        setShowConfirmImport(true);
        return;
      }

      // Carregar direto se não há mudanças
      setPhones(result.phones);
      setLastSavedPhones(result.phones);
      setImportMessage({
        type: 'success',
        text: `✓ Projeto carregado! ${result.phones.length} aparelhos importados.`,
      });
      setTimeout(() => setImportMessage(null), 3000);
    },
    [isDirty, setPhones]
  );

  /**
   * Confirmar import descartando mudanças anteriores
   */
  const handleConfirmImport = useCallback(() => {
    if (pendingImport) {
      setPhones(pendingImport.phones);
      setLastSavedPhones(pendingImport.phones);
      setImportMessage({
        type: 'success',
        text: `✓ Projeto carregado! ${pendingImport.phones.length} aparelhos importados.`,
      });
      setTimeout(() => setImportMessage(null), 3000);
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
    } as Node));
    setNodes(newNodes);
  }, [phones, analysisMode, handleEditPhone, handleDeletePhone, handleSaveDraft]);

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
    exportProject(phones);
    setLastSavedPhones(phones);
    setImportMessage({
      type: 'success',
      text: '✓ Projeto salvo com sucesso',
    });
    setTimeout(() => setImportMessage(null), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja limpar o board? Essa ação não pode ser desfeita.')) {
      setPhones([]);
      setImportMessage({
        type: 'success',
        text: 'Board limpo com sucesso',
      });
      setTimeout(() => setImportMessage(null), 2000);
    }
  };

  return (
    <div 
      className={`w-screen h-screen bg-slate-50 relative transition-colors ${
        isDragOverCanvas ? 'bg-blue-50' : ''
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
        fitView
      >
        <Background />
        <AutoFitViewOnDraft phones={phones} />
        
        {/* MiniMap estilizado */}
        <MiniMap
          position="bottom-right"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backgroundImage: 'none',
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

      {/* Header Flutuante (Fixed + z-index alto) */}
      <ModeSelector 
        currentMode={analysisMode} 
        onModeChange={setAnalysisMode}
      />

      {/* Navigation Controls (Zoom + Fit View) */}
      <NavigationControls />

      {/* Action Dock Flutuante (Inferior) */}
      <FloatingDock
        onAddPhone={handleAddPhone}
        onBackup={handleBackupJSON}
        onReset={handleReset}
        onOpenProject={handleOpenProjectClick}
      />

      {/* Modal de Edição */}
      {editingId && (
        <EditModal
          phone={phones.find((p) => p.id === editingId)!}
          onSave={handleSaveEdit}
          onCancel={() => setEditingId(null)}
        />
      )}

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
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 animate-pulse ${
          importMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
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
    </div>
  );
}

export default App;

