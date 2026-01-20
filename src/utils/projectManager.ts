/**
 * Project Manager: Exportar/Importar projetos em JSON
 * Permite salvar e carregar coleções de phones com posições e imagens Base64
 */

import type { Phone } from '../types';

export interface ProjectData {
  version: string;
  createdAt: string;
  phones: Phone[];
}

/**
 * Exportar projeto como arquivo JSON
 * @param phones - Array de phones para exportar
 * @returns void (dispara download automático)
 */
export function exportProject(phones: Phone[]): void {
  const projectData: ProjectData = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    phones: phones,
  };

  const jsonString = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Criar link e disparar download
  const link = document.createElement('a');
  link.href = url;
  link.download = `phonedeck-project-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Limpar URL temporária
  URL.revokeObjectURL(url);
}

/**
 * Validar estrutura do projeto importado
 */
function validateProjectStructure(data: unknown): data is ProjectData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const project = data as ProjectData;

  // Verificar campos principais
  if (!project.phones || !Array.isArray(project.phones)) {
    return false;
  }

  // Verificar estrutura mínima de cada phone
  const isValidPhone = (phone: unknown): phone is Phone => {
    if (!phone || typeof phone !== 'object') return false;
    const p = phone as any;
    return (
      typeof p.id === 'string' &&
      typeof p.model === 'string' &&
      typeof p.year === 'number' &&
      typeof p.image === 'string' &&
      p.position &&
      typeof p.position.x === 'number' &&
      typeof p.position.y === 'number' &&
      p.specs &&
      typeof p.specs.battery === 'string' &&
      typeof p.specs.weight === 'string' &&
      p.badges &&
      typeof p.badges.network === 'string' &&
      typeof p.badges.resilience === 'string' &&
      typeof p.badges.batteryStatus === 'string' &&
      typeof p.price === 'object' &&
      typeof p.price.installment === 'string' &&
      typeof p.price.total === 'string'
    );
  };

  return project.phones.every(isValidPhone);
}

/**
 * Importar projeto de um arquivo JSON
 * @param file - Arquivo para importar
 * @returns Promise com dados do projeto ou erro
 */
export async function importProject(
  file: File
): Promise<{ phones: Phone[]; error?: string }> {
  return new Promise((resolve) => {
    // Validar tipo de arquivo
    if (!file.name.endsWith('.json')) {
      resolve({
        phones: [],
        error: 'Arquivo deve ser JSON (.json)',
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        // Validar estrutura
        if (!validateProjectStructure(data)) {
          resolve({
            phones: [],
            error: 'Estrutura do arquivo inválida',
          });
          return;
        }

        // Retornar dados válidos
        resolve({
          phones: data.phones,
        });
      } catch (error) {
        resolve({
          phones: [],
          error: `Erro ao ler arquivo: ${error instanceof Error ? error.message : 'desconhecido'}`,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        phones: [],
        error: 'Erro ao ler arquivo',
      });
    };

    reader.readAsText(file);
  });
}

/**
 * Gerar nome de backup com data
 */
export function getBackupFileName(): string {
  return `phonedeck-project-${new Date().toISOString().split('T')[0]}.json`;
}
