/**
 * Position Finder: Encontra posição inteligente para novos cards
 * Usa detecção de colisão para evitar sobreposição e coloca cards de forma aleatória
 */

import type { Node } from '@xyflow/react';

export interface GridPosition {
  x: number;
  y: number;
}

/**
 * Constantes de dimensionamento
 */
const CARD_WIDTH = 330; // Largura real de um card preenchido
const CARD_HEIGHT = 520; // Altura real de um card
const SAFETY_MARGIN = 60; // Margem de segurança ao redor dos cards para evitar proximidade
const INITIAL_POSITION = { x: 50, y: 50 }; // Primeira posição padrão

/**
 * Verificar se duas regiões se sobrepõem (com margem de segurança)
 */
function doRectanglesCollide(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    rect1.x + rect1.width + SAFETY_MARGIN < rect2.x ||
    rect2.x + rect2.width + SAFETY_MARGIN < rect1.x ||
    rect1.y + rect1.height + SAFETY_MARGIN < rect2.y ||
    rect2.y + rect2.height + SAFETY_MARGIN < rect1.y
  );
}

/**
 * Gerar posição aleatória em volta dos bounds existentes
 */
function generateRandomPosition(
  existingCards: Array<{ x: number; y: number }>
): GridPosition {
  if (existingCards.length === 0) {
    return INITIAL_POSITION;
  }

  // Calcular limites do canvas com cards existentes
  const minX = Math.min(...existingCards.map((c) => c.x));
  const maxX = Math.max(...existingCards.map((c) => c.x));
  const minY = Math.min(...existingCards.map((c) => c.y));
  const maxY = Math.max(...existingCards.map((c) => c.y));

  // Expandir a área de busca para colocar cards ao redor
  const searchMinX = minX - 600;
  const searchMaxX = maxX + 600;
  const searchMinY = minY - 600;
  const searchMaxY = maxY + 600;

  // Gerar posição aleatória dentro dessa área
  return {
    x: Math.random() * (searchMaxX - searchMinX) + searchMinX,
    y: Math.random() * (searchMaxY - searchMinY) + searchMinY,
  };
}

/**
 * Encontrar posição não-colidindo para novo card
 * Tenta posições aleatórias até encontrar uma que não colida
 * @param nodes - Array de nodes existentes (com suas posições)
 * @returns Posição segura {x, y}
 */
export function findSmartPosition(nodes: Node[]): GridPosition {
  const existingCards = nodes.map((n) => ({
    x: n.position.x,
    y: n.position.y,
  }));

  if (existingCards.length === 0) {
    return INITIAL_POSITION;
  }

  // Máximo de tentativas para encontrar uma posição válida
  const maxAttempts = 30;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateRandomPosition(existingCards);

    // Verificar se essa posição colide com algum card existente
    const newCardRect = {
      x: candidate.x,
      y: candidate.y,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    };

    let hasCollision = false;
    for (const card of existingCards) {
      const existingCardRect = {
        x: card.x,
        y: card.y,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      };

      if (doRectanglesCollide(newCardRect, existingCardRect)) {
        hasCollision = true;
        break;
      }
    }

    // Se não há colisão, retornar essa posição
    if (!hasCollision) {
      return {
        x: Math.round(candidate.x),
        y: Math.round(candidate.y),
      };
    }
  }

  // Se todas as tentativas falharem, colocar bem longe
  return {
    x: Math.max(...existingCards.map((c) => c.x)) + 700,
    y: Math.max(...existingCards.map((c) => c.y)) + 600,
  };
}

/**
 * Calcular bounds de todos os nodes
 * Útil para encontrar o "canto" do canvas com nodes
 */
export function calculateNodesBounds(nodes: Node[]) {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  return {
    minX: Math.min(...nodes.map((n) => n.position.x)),
    minY: Math.min(...nodes.map((n) => n.position.y)),
    maxX: Math.max(...nodes.map((n) => n.position.x + CARD_WIDTH)),
    maxY: Math.max(...nodes.map((n) => n.position.y + CARD_HEIGHT)),
  };
}
