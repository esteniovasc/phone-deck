# Guia de Uso - Parser Automático de GSMArena

## 🎯 Objetivo

O parser automático permite importar dados técnicos diretamente do HTML do GSMArena, preenchendo automaticamente os campos da interface. Isso economiza tempo e reduz erros de digitação.

## 📋 Estrutura de Dados Atualizada

A interface `Phone` agora inclui um objeto `specs` mais detalhado:

```typescript
specs: {
  screen?: string;        // ex: "6.8 inch P-OLED"
  chipset?: string;       // ex: "Snapdragon 765G"
  ram?: string;           // ex: "6GB/8GB"
  storage?: string;       // ex: "128GB"
  battery: string;        // ex: "4300 mAh"
  cameras?: string;       // ex: "48MP (Wide) | 8MP (Ultra)"
  dimensions?: string;    // ex: "167.2 x 74.1 x 7.9 mm"
  weight: string;         // ex: "180 g"
  thickness?: string;     // ex: "7.9mm"
}
```

> **Nota**: `battery` e `weight` são obrigatórios, todos os outros campos são opcionais.

## 🛠️ Como Usar

### Passo 1: Abrir a Página do GSMArena

1. Acesse [GSMArena](https://www.gsmarena.com/)
2. Procure pelo modelo desejado (ex: LG Velvet)
3. Abra a página de especificações do telefone

### Passo 2: Obter o HTML

Você pode obter o HTML de duas formas:

#### Opção A: Inspecionar Elemento (Recomendado)
1. Na página do GSMArena, clique com botão direito do mouse
2. Selecione "Inspecionar" ou "Inspecionar Elemento"
3. Procure pela tabela de especificações (geralmente com atributos `data-spec`)
4. Clique com botão direito no elemento da tabela e selecione "Copiar" → "Copiar como HTML"

#### Opção B: Copiar Página Completa
1. Pressione `Ctrl+A` para selecionar tudo
2. Pressione `Ctrl+C` para copiar
3. Cole no textarea (apenas a parte relevante será processada)

### Passo 3: Usar o Parser no Modal

1. Abra o modal "Editar Celular"
2. Clique no item "Importar Dados do GSMArena (HTML)" para expandir
3. Cole o HTML no textarea
4. Clique no botão "Processar HTML"
5. Os campos serão preenchidos automaticamente!

## 🔍 Seletores Utilizados

O parser procura pelos seguintes seletores CSS (baseados na estrutura do GSMArena):

| Campo | Seletor CSS |
|-------|------------|
| Modelo | `h1[data-spec="modelname"]` |
| Imagem | `div.specs-photo-main img` |
| Peso | `[data-spec="weight"]` |
| Dimensões | `[data-spec="dimensions"]` |
| Bateria | `[data-spec="batdescription1"]` ou `[data-spec="capacity"]` |
| Tela | `[data-spec="displaytype"]` |
| Chipset | `[data-spec="chipset"]` |
| RAM | `[data-spec="ram"]` |
| Armazenamento | `[data-spec="storage"]` |
| Câmeras | `[data-spec="cam1main"]` |

> Se os `data-spec` não forem encontrados, o parser usa um método fallback buscando por padrões de texto comuns em tabelas.

## 📝 Exemplo de Uso

**Entrada (HTML do GSMArena):**
```html
<h1 data-spec="modelname">LG Velvet</h1>
<div class="specs-photo-main">
  <img src="https://example.com/lgvelvet.jpg" alt="LG Velvet">
</div>
<td data-spec="weight">180 g</td>
<td data-spec="dimensions">167.2 x 74.1 x 7.9 mm</td>
<td data-spec="batdescription1">4300 mAh, Li-Po</td>
<td data-spec="displaytype">6.8 inch P-OLED</td>
```

**Resultado (Campos Preenchidos):**
- ✓ Modelo: "LG Velvet"
- ✓ Imagem: "https://example.com/lgvelvet.jpg"
- ✓ Peso: "180 g"
- ✓ Dimensões: "167.2 x 74.1 x 7.9 mm"
- ✓ Bateria: "4300 mAh, Li-Po"
- ✓ Tela: "6.8 inch P-OLED"

## 📚 Arquivos Criados/Modificados

### Novos Arquivos:
- **`src/utils/gsmParser.ts`**: Contém as funções de parsing
  - `parseGsmArenaHtml()`: Parser principal usando `data-spec`
  - `parseGsmArenaHtmlFallback()`: Parser alternativo para casos onde `data-spec` não existem

### Arquivos Modificados:
- **`src/types/index.ts`**: Expandida interface `Phone.specs`
- **`src/components/modals/EditModal.tsx`**: 
  - Adicionada seção de importação de HTML
  - Novos campos para todos os specs
  - Integração com as funções de parsing

## ⚠️ Limitações e Considerações

1. **Estrutura HTML**: O parser assume que o HTML segue o padrão do GSMArena. Se o site mudar sua estrutura, o parsing pode não funcionar perfeitamente.

2. **HTML Parcial**: Você pode colar apenas a tabela de especificações, não precisa de toda a página.

3. **Campos Opcionais**: Se algum campo não for encontrado, ele será ignorado e você poderá preenchê-lo manualmente.

4. **Validação**: Sempre revise os dados extraídos antes de salvar, especialmente a imagem (pode estar quebrada dependendo do domínio).

## 🐛 Troubleshooting

### "Nenhum dado foi encontrado"
- Verifique se o HTML copiado contém a tabela de especificações
- Tente copiar um HTML mais completo (incluindo mais contexto)
- Verifique se o GSMArena não mudou sua estrutura

### Campos aparecem em branco
- Nem todos os campos existem em todas as páginas do GSMArena
- Você pode preenchê-los manualmente
- O parser prioriza campos que consegue encontrar com confiança

### Imagem não carrega
- A URL da imagem pode ter expirado
- Tente fazer download da imagem manualmente e salvar em outro hosting
- Verifique se a URL está completa e acessível

## 🚀 Melhorias Futuras

- [ ] Suporte para parsing de outras fontes (Android Authority, PhoneArena)
- [ ] Cache de dados já parseados
- [ ] Validação automática de URLs de imagem
- [ ] Extração de análises/reviews do GSMArena
- [ ] Sincronização com banco de dados online
