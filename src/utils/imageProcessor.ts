/**
 * Image Processor: Compressão e redimensionamento de imagens
 * Usa Canvas API para processar no cliente (zero servidor necessário)
 */

export interface ImageProcessResult {
  base64: string;
  width: number;
  height: number;
  sizeKB: number;
}

/**
 * Redimensionar e comprimir imagem para Base64
 * @param file - Arquivo de imagem
 * @param maxWidth - Largura máxima em pixels
 * @param quality - Qualidade JPEG (0-1)
 * @returns Promise com dados da imagem processada
 */
export async function processImage(
  file: File,
  maxWidth: number = 500,
  quality: number = 0.8
): Promise<ImageProcessResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        // Calcular dimensões mantendo aspect ratio
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = Math.round(height * ratio);
        }

        // Criar canvas e desenhar imagem redimensionada
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Falha ao obter contexto do canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Converter para Base64 com compressão
        const base64 = canvas.toDataURL('image/jpeg', quality);

        // Calcular tamanho em KB
        const sizeBytes = base64.length;
        const sizeKB = Math.round(sizeBytes / 1024);

        resolve({
          base64,
          width,
          height,
          sizeKB,
        });
      };

      img.onerror = () => {
        reject(new Error('Falha ao carregar imagem'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Falha ao ler arquivo'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validar arquivo de imagem
 * @param file - Arquivo a validar
 * @returns true se é imagem válida
 */
export function validateImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!validTypes.includes(file.type)) {
    return false;
  }

  if (file.size > maxSize) {
    return false;
  }

  return true;
}

/**
 * Formatar tamanho de arquivo em texto legível
 */
export function formatFileSize(sizeKB: number): string {
  if (sizeKB > 1024) {
    return `${(sizeKB / 1024).toFixed(1)} MB`;
  }
  return `${sizeKB} KB`;
}
