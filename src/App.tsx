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
    const dataStr = JSON.stringify(phones, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `phonedeck-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="w-screen h-screen bg-slate-50 relative">
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
    </div>
  );
}

export default App;

