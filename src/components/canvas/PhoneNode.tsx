import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { Phone, VisualStatus } from '../../types';
import { PhoneCard } from '../cards/PhoneCard';

/**
 * PhoneNode: Custom Node wrapper para React Flow
 * 
 * Responsabilidades:
 * - Renderizar o PhoneCard dentro do nó
 * - Fornecer Handles (invisíveis se não houver conexões)
 * - Repassar visualStatus do Motor de Decisão
 * - Sincronizar dados entre React Flow e localStorage
 */

interface PhoneNodeData {
  phone: Phone;
  visualStatus: VisualStatus;
  onEdit: (phone: Phone) => void;
  onDelete: (id: string) => void;
  onSaveDraft?: (id: string, modelName: string) => void;
}

export default function PhoneNode(props: NodeProps & { data: PhoneNodeData }) {
  const { phone, visualStatus, onEdit, onDelete, onSaveDraft } = props.data;

  return (
    <div className="relative">
      {/* Handles invisíveis para futuras conexões */}
      <Handle position={Position.Top} type="target" style={{ visibility: 'hidden' }} />
      <Handle position={Position.Bottom} type="source" style={{ visibility: 'hidden' }} />
      
      {/* Render do PhoneCard com propriedades dinâmicas */}
      <PhoneCard
        data={phone}
        onEdit={() => onEdit(phone)}
        onDelete={() => onDelete(phone.id)}
        onToggleMinimize={() => {}}
        onSaveDraft={onSaveDraft}
        visualStatus={visualStatus}
      />
    </div>
  );
}
