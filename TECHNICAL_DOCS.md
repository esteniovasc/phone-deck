# 📚 Documentação Técnica - Parser Automático

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    EditModal Component                   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Import Data Section (Detalhes Expandível)      │    │
│  │  - Textarea para HTML                           │    │
│  │  - Botão "Processar HTML"                       │    │
│  │  - Feedback de Status                           │    │
│  └────────┬────────────────────────────────────────┘    │
│           │ (onclick)                                    │
│           ▼                                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │  handleProcessHtml()                            │    │
│  │  - Valida entrada                              │    │
│  │  - Chama parseGsmArenaHtml()                    │    │
│  │  - Fallback para parseGsmArenaHtmlFallback()   │    │
│  │  - Atualiza formData via setFormData()         │    │
│  │  - Exibe mensagem de sucesso/erro              │    │
│  └────────┬────────────────────────────────────────┘    │
│           │                                              │
└───────────┼──────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│              src/utils/gsmParser.ts                      │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  parseGsmArenaHtml(html: string)                │    │
│  │  ├─ Cria DOMParser                              │    │
│  │  ├─ Busca por data-spec attributes             │    │
│  │  ├─ Extrai: modelo, imagem, specs              │    │
│  │  └─ Retorna Partial<Phone>                      │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  parseGsmArenaHtmlFallback(html: string)        │    │
│  │  ├─ Procura por padrões em <tr>                │    │
│  │  ├─ Mapeia labels para campos                   │    │
│  │  └─ Retorna Partial<Phone>                      │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│           src/types/index.ts                             │
│                                                           │
│  interface Phone {                                      │
│    id: string;                                          │
│    model: string;                                       │
│    year: number;                                        │
│    image: string;                                       │
│    specs: {                                             │
│      screen?: string;                                   │
│      chipset?: string;                                  │
│      ram?: string;                                      │
│      storage?: string;                                  │
│      battery: string;      ← obrigatório                │
│      cameras?: string;                                  │
│      dimensions?: string;                               │
│      weight: string;       ← obrigatório                │
│      thickness?: string;                                │
│    };                                                   │
│    ... (resto da interface)                             │
│  }                                                       │
└─────────────────────────────────────────────────────────┘
```

## Fluxo de Dados Detalhado

### 1. Extração de HTML
```typescript
// Entrada: string HTML bruto
const html = "<h1 data-spec='modelname'>LG Velvet</h1>...";

// Processamento
const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');

// Extração com querySelectorAll
const elements = doc.querySelectorAll('[data-spec]');
// Resultado: NodeList com todos os elementos com data-spec
```

### 2. Mapeamento de Campos
```typescript
// Para cada seletor, extraímos o textContent
const mapping = {
  'weight': doc.querySelector('[data-spec="weight"]')?.textContent,
  'battery': doc.querySelector('[data-spec="batdescription1"]')?.textContent,
  // ... etc
};
```

### 3. Validação de Valores
```typescript
// Ignoramos valores vazios ou "-"
if (value && value !== '-') {
  result.specs!.weight = value;
}
```

### 4. Merge com Dados Existentes
```typescript
// O formData anterior é mantido
// Apenas campos extraídos sobrescrevem os antigos
updated.specs = {
  ...prev.specs,        // mantém campos existentes
  ...parsed.specs,      // sobrescreve com novos valores
};
```

## Seletores Suportados

### Primários (Usar data-spec)
```
[data-spec="weight"]         → td.textContent
[data-spec="dimensions"]     → td.textContent
[data-spec="batdescription1"] → td.textContent
[data-spec="displaytype"]    → td.textContent
[data-spec="chipset"]        → td.textContent
[data-spec="ram"]            → td.textContent
[data-spec="storage"]        → td.textContent
[data-spec="cam1main"]       → td.textContent
[data-spec="capacity"]       → td.textContent (fallback bateria)
h1[data-spec="modelname"]    → h1.textContent
```

### Secundários (Busca em Tabelas)
```
"weight" em td      → peso
"battery" em td     → bateria
"dimension" em td   → dimensões
"display" em td     → tela
"chipset" em td     → processador
"ram" em td         → memória
"storage" em td     → armazenamento
"camera" em td      → câmera
```

## Tratamento de Erros

```typescript
try {
  // Tenta parsing principal
  let parsed = parseGsmArenaHtml(htmlInput);
  
  // Se encontrou poucos campos, tenta fallback
  if (Object.keys(parsed.specs || {}).length < 2) {
    parsed = parseGsmArenaHtmlFallback(htmlInput);
  }
  
  // Atualiza formulário
  setFormData(prev => ({ ...prev, ...parsed }));
  
} catch (error) {
  console.error('Erro ao fazer parsing:', error);
  setParseMessage('✗ Erro ao processar HTML');
}
```

## Performance

- **DOMParser**: ~2-10ms para HTML até 1MB
- **querySelectorAll**: ~1-5ms por busca
- **Processamento Total**: ~20-50ms (bem rápido!)
- **Memória**: Temporária (liberada após uso)

## Compatibilidade

- ✅ Chrome/Edge (Chromium 90+)
- ✅ Firefox (88+)
- ✅ Safari (14+)
- ✅ React 17+ (testado com React 18)
- ✅ TypeScript 4.5+
- ✅ Vite (sem dependencies externas)

## Segurança

### DOMParser vs innerHTML
```typescript
// ✅ Seguro: DOMParser não executa scripts
const doc = parser.parseFromString(html, 'text/html');

// ❌ Inseguro: innerHTML pode executar scripts
document.innerHTML = html;
```

### Validação de Valores
```typescript
// Sempre usa .textContent (text-safe)
// Nunca usa .innerHTML
const value = element.textContent?.trim();
```

### CORS
- O parsing é local (nenhuma requisição externa)
- Seguro contra CORS e XSS

## Extensibilidade

Para adicionar suporte a novo site:

```typescript
export function parseMyPhoneShop(html: string): Partial<Phone> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const result: Partial<Phone> = {
    specs: {
      battery: '',
      weight: '',
    },
  };
  
  // Seus seletores customizados
  result.model = doc.querySelector('.phone-name')?.textContent;
  result.image = doc.querySelector('.phone-image img')?.src;
  
  return result;
}
```

Depois integre no `handleProcessHtml()`:

```typescript
const handleProcessHtml = () => {
  // Tenta GSMArena
  let parsed = parseGsmArenaHtml(htmlInput);
  
  // Fallback para outro site
  if (!parsed.model) {
    parsed = parseMyPhoneShop(htmlInput);
  }
  
  // ... resto do código
};
```

## Testes Sugeridos

```typescript
// Unit Tests
describe('parseGsmArenaHtml', () => {
  it('deve extrair modelo do h1', () => {
    const html = '<h1 data-spec="modelname">iPhone 13</h1>';
    const result = parseGsmArenaHtml(html);
    expect(result.model).toBe('iPhone 13');
  });
  
  it('deve extrair peso de data-spec', () => {
    const html = '<td data-spec="weight">180 g</td>';
    const result = parseGsmArenaHtml(html);
    expect(result.specs?.weight).toBe('180 g');
  });
  
  it('deve ignorar valores "-"', () => {
    const html = '<td data-spec="weight">-</td>';
    const result = parseGsmArenaHtml(html);
    expect(result.specs?.weight).toBeUndefined();
  });
});
```

## Logs de Debug

Quando `parseMessage` é ativado:

```typescript
console.log('Parsed data:', parsed);
console.error('Parse error:', error);
```

Mensagens do usuário:

```
✓ Dados extraídos: Modelo, Imagem, Peso, Bateria
⚠ Nenhum dado encontrado
✗ Erro ao processar HTML
```
