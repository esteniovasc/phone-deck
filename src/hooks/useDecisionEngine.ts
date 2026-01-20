import type { Phone, AnalysisMode, VisualStatus } from '../types';

/**
 * Extrai o preço total em número a partir da string de preço
 * Ex: "R$ 850" → 850
 */
function extractPrice(priceString: string): number {
  const match = priceString.replace('total', '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Hook para determinar o status visual do card baseado no modo de análise
 */
export function useDecisionEngine(phone: Phone, mode: AnalysisMode): VisualStatus {
  switch (mode) {
    case 'default':
      return evaluateDefault();

    case 'backup_city':
      return evaluateBackupCity(phone);

    case 'collection':
      return evaluateCollection(phone);

    case 'kids_safe':
      return evaluateKidsSafe(phone);

    default:
      return 'neutral';
  }
}

/**
 * Modo Default: Todos os phones em estado neutro
 */
function evaluateDefault(): VisualStatus {
  return 'neutral';
}

/**
 * Modo Backup/Cidade:
 * - Highlight: Tem 5G AND Preço < 1000
 * - Dimmed: Sem 5G OR Preço > 1500
 * - Neutral: Resto
 */
function evaluateBackupCity(phone: Phone): VisualStatus {
  const has5G = phone.badges.network === '5G';
  const price = extractPrice(phone.price.total);

  // Highlight: 5G + Barato
  if (has5G && price < 1000) {
    return 'highlight';
  }

  // Dimmed: Sem 5G OU Caro demais
  if (!has5G || price > 1500) {
    return 'dimmed';
  }

  return 'neutral';
}

/**
 * Modo Coleção:
 * - Highlight: Ano < 2019 OR Tem destaque preenchido
 * - Dimmed: Ano > 2021 (muito novo)
 * - Neutral: Resto
 */
function evaluateCollection(phone: Phone): VisualStatus {
  const isOldPhone = phone.year < 2019;
  const hasHighlightText = phone.highlight && phone.highlight.trim().length > 0 && 
                           phone.highlight !== 'Adicione informações do aparelho';

  // Highlight: Relíquias (pré-2019) ou com destaque especial
  if (isOldPhone || hasHighlightText) {
    return 'highlight';
  }

  // Dimmed: Muito novo (pós-2021)
  if (phone.year > 2021) {
    return 'dimmed';
  }

  return 'neutral';
}

/**
 * Modo Kids Safe:
 * - Highlight: Preço < 800 AND (Resiliência alta OR inferir plástico traseiro)
 * - Dimmed: Preço > 1000 (risco financeiro alto)
 * - Neutral: Resto
 *
 * Nota: "Traseira de plástico" é inferido como phones baratos ou modelos antigos
 */
function evaluateKidsSafe(phone: Phone): VisualStatus {
  const price = extractPrice(phone.price.total);
  const hasHighResilience = phone.badges.resilience === 'high';
  
  // Inferir se pode ser plástico (phones mais antigos ou baratos costumam ser)
  const likelyPlasticBack = phone.year < 2018 || price < 600;

  // Highlight: Barato + Seguro (resiliente ou plástico)
  if (price < 800 && (hasHighResilience || likelyPlasticBack)) {
    return 'highlight';
  }

  // Dimmed: Caro (risco financeiro)
  if (price > 1000) {
    return 'dimmed';
  }

  return 'neutral';
}
