import type { Phone } from '../types';

/**
 * Extrai dados técnicos de um HTML do GSMArena
 * e retorna um objeto parcial de Phone com os campos preenchidos
 */
export function parseGsmArenaHtml(html: string): Partial<Phone> {
  try {
    // Cria um parser DOM a partir da string HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const result: Partial<Phone> = {
      specs: {
        battery: '',
        weight: '',
      },
    };

    // ========== NOME DO MODELO ==========
    // Tenta múltiplos seletores comuns
    const modelName =
      doc.querySelector('h1[data-spec="modelname"]')?.textContent ||
      doc.querySelector('h1.caption')?.textContent ||
      doc.querySelector('h1')?.textContent;

    if (modelName) {
      result.model = modelName.trim();
    }

    // ========== IMAGEM ==========
    // Procura por div com class specs-photo-main ou similar
    const imgElement =
      doc.querySelector('div.specs-photo-main img') ||
      doc.querySelector('.phone-image img') ||
      doc.querySelector('img[alt*="image"]');

    if (imgElement && imgElement instanceof HTMLImageElement) {
      const imgSrc = imgElement.src || imgElement.getAttribute('data-src');
      if (imgSrc) {
        result.image = imgSrc;
      }
    }

    // ========== EXTRAÇÃO DE SPECS USANDO ATRIBUTOS data-spec ==========
    // Peso
    const weightEl = doc.querySelector('[data-spec="weight"]');
    if (weightEl) {
      const weight = weightEl.textContent?.trim();
      if (weight && weight !== '-') {
        result.specs!.weight = weight;
      }
    }

    // Dimensões
    const dimensionsEl = doc.querySelector('[data-spec="dimensions"]');
    if (dimensionsEl) {
      const dimensions = dimensionsEl.textContent?.trim();
      if (dimensions && dimensions !== '-') {
        result.specs!.dimensions = dimensions;
      }
    }

    // Bateria (descrição completa)
    const batteryEl = doc.querySelector('[data-spec="batdescription1"]');
    if (batteryEl) {
      const battery = batteryEl.textContent?.trim();
      if (battery && battery !== '-') {
        result.specs!.battery = battery;
      }
    }

    // Se não encontrou bateria completa, tenta apenas o valor mAh
    if (!result.specs?.battery) {
      const batteryCapacityEl = doc.querySelector('[data-spec="capacity"]');
      if (batteryCapacityEl) {
        const capacity = batteryCapacityEl.textContent?.trim();
        if (capacity && capacity !== '-') {
          result.specs!.battery = capacity;
        }
      }
    }

    // Tela (Display)
    const screenEl = doc.querySelector('[data-spec="displaytype"]');
    if (screenEl) {
      const screen = screenEl.textContent?.trim();
      if (screen && screen !== '-') {
        result.specs!.screen = screen;
      }
    }

    // Chipset
    const chipsetEl = doc.querySelector('[data-spec="chipset"]');
    if (chipsetEl) {
      const chipset = chipsetEl.textContent?.trim();
      if (chipset && chipset !== '-') {
        result.specs!.chipset = chipset;
      }
    }

    // RAM
    const ramEl = doc.querySelector('[data-spec="ram"]');
    if (ramEl) {
      const ram = ramEl.textContent?.trim();
      if (ram && ram !== '-') {
        result.specs!.ram = ram;
      }
    }

    // Armazenamento
    const storageEl = doc.querySelector('[data-spec="storage"]');
    if (storageEl) {
      const storage = storageEl.textContent?.trim();
      if (storage && storage !== '-') {
        result.specs!.storage = storage;
      }
    }

    // Câmeras (tenta múltiplos seletores)
    let camerasText: string | undefined;

    // Tenta data-spec específico para câmera principal
    const mainCameraEl = doc.querySelector('[data-spec="cam1main"]');
    if (mainCameraEl) {
      camerasText = mainCameraEl.textContent?.trim();
    }

    // Se não encontrou, tenta procurar em tabelas de specs
    if (!camerasText) {
      const cameraSection = Array.from(doc.querySelectorAll('td')).find(
        (td) => td.textContent?.toLowerCase().includes('camera') || 
                td.textContent?.toLowerCase().includes('câmera')
      );
      if (cameraSection) {
        camerasText = cameraSection.nextElementSibling?.textContent?.trim();
      }
    }

    if (camerasText && camerasText !== '-') {
      result.specs!.cameras = camerasText;
    }

    return result;
  } catch (error) {
    console.error('Erro ao fazer parsing do HTML do GSMArena:', error);
    return { 
      specs: {
        battery: '',
        weight: '',
      }
    };
  }
}

/**
 * Extrai dados técnicos procurando por padrões HTML comuns
 * Alternativa mais robusta quando os data-spec não estão presentes
 */
export function parseGsmArenaHtmlFallback(html: string): Partial<Phone> {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const result: Partial<Phone> = {
      specs: {
        battery: '',
        weight: '',
      },
    };

    // Procura em todas as linhas da tabela
    const rows = doc.querySelectorAll('table tr, .specs-table-row');

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td, th');
      if (cells.length >= 2) {
        const label = cells[0]?.textContent?.toLowerCase().trim() || '';
        const value = cells[1]?.textContent?.trim() || '';

        if (!value || value === '-') return;

        // Mapeamento de labels para specs
        if (label.includes('weight') || label.includes('peso')) {
          result.specs!.weight = value;
        } else if (label.includes('dimension') || label.includes('dimensão')) {
          result.specs!.dimensions = value;
        } else if (label.includes('battery') || label.includes('bateria')) {
          result.specs!.battery = value;
        } else if (label.includes('display') || label.includes('screen') || label.includes('tela')) {
          result.specs!.screen = value;
        } else if (label.includes('chipset') || label.includes('processor')) {
          result.specs!.chipset = value;
        } else if (label.includes('ram') || label.includes('memory')) {
          result.specs!.ram = value;
        } else if (label.includes('storage') || label.includes('internal')) {
          result.specs!.storage = value;
        } else if (label.includes('camera') || label.includes('câmera')) {
          result.specs!.cameras = value;
        }
      }
    });

    return result;
  } catch (error) {
    console.error('Erro no parsing fallback:', error);
    return { 
      specs: {
        battery: '',
        weight: '',
      }
    };
  }
}
