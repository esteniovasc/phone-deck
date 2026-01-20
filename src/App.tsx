import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  type Node,
  type NodeTypes,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EditModal } from './components/modals/EditModal';
import { FloatingDock } from './components/ui/FloatingDock';
import { ModeSelector } from './components/ui/ModeSelector';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDecisionEngine } from './hooks/useDecisionEngine';
import PhoneNode from './components/canvas/PhoneNode';
import type { Phone, AnalysisMode } from './types';

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

  /**
   * Converter phones em nodes para React Flow
   * Se o phone não tiver posição, distribui em grid
   */
  const createNodesFromPhones = useCallback((phones: Phone[]) => {
    return phones.map((phone, index) => ({
      id: phone.id,
      data: {
        phone,
        visualStatus: useDecisionEngine(phone, analysisMode),
        onEdit: handleEditPhone,
        onDelete: handleDeletePhone,
      },
      position: phone.position || {
        x: (index % 3) * 420,
        y: Math.floor(index / 3) * 520,
      },
      type: 'phoneNode',
    } as Node));
  }, [analysisMode]);

  /**
   * Sincronizar nodes quando phones ou analysisMode mudam
   */
  const updateNodesFromPhones = useCallback(() => {
    setNodes(createNodesFromPhones(phones));
  }, [phones, createNodesFromPhones]);

  // Inicializar nodes quando phones carregam
  useEffect(() => {
    updateNodesFromPhones();
  }, [updateNodesFromPhones]);

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

  const handleAddPhone = () => {
    const newPhone: Phone = {
      id: crypto.randomUUID(),
      model: 'Novo Celular',
      year: new Date().getFullYear(),
      image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=400&h=600&fit=crop',
      position: {
        x: Math.random() * 400,
        y: Math.random() * 300,
      },
      specs: { battery: '---', weight: '---', thickness: '---' },
      badges: { network: '4G', resilience: 'medium', batteryStatus: 'neutral' },
      highlight: 'Adicione informações do aparelho',
      price: { installment: 'A definir', total: 'A definir' },
      isMinimized: false,
    };
    const newPhones = [...phones, newPhone];
    setPhones(newPhones);
    setNodes(createNodesFromPhones(newPhones));
  };

  const handleEditPhone = (phone: Phone) => {
    setEditingId(phone.id);
  };

  const handleSaveEdit = (updatedPhone: Phone) => {
    const newPhones = phones.map((phone) =>
      phone.id === updatedPhone.id ? updatedPhone : phone
    );
    setPhones(newPhones);
    setNodes(createNodesFromPhones(newPhones));
    setEditingId(null);
  };

  const handleDeletePhone = (id: string) => {
    const newPhones = phones.filter((phone) => phone.id !== id);
    setPhones(newPhones);
    setNodes(createNodesFromPhones(newPhones));
  };

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
        <Controls />
      </ReactFlow>

      {/* Header Flutuante (Fixed + z-index alto) */}
      <ModeSelector 
        currentMode={analysisMode} 
        onModeChange={(newMode) => {
          setAnalysisMode(newMode);
          setNodes(createNodesFromPhones(phones));
        }}
      />

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
