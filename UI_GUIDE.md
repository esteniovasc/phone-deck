# 🎨 Guia Visual - Interface do Parser

## 1️⃣ Modal Fechado (Estado Normal)

```
┌────────────────────────────────────────┐
│ Editar Celular                      [×] │
├────────────────────────────────────────┤
│                                        │
│ ▼ Importar Dados do GSMArena...       │ ← Expandível
│                                        │
│ [Form fields abaixo...]                │
│                                        │
└────────────────────────────────────────┘
```

---

## 2️⃣ Modal Expandido - Seção de Import

```
┌────────────────────────────────────────────────────────┐
│ Editar Celular                                      [×] │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ▼ Importar Dados do GSMArena (HTML)                    │
│ ├─────────────────────────────────────────────────────┤
│ │ Cole aqui o HTML da página de especificações do     │
│ │ GSMArena para extrair dados automaticamente.        │
│ │                                                      │
│ │ ┌──────────────────────────────────────────────────┐│
│ │ │<h1 data-spec="modelname">LG Velvet</h1>         ││
│ │ │<div class="specs-photo-main">                    ││
│ │ │  <img src="https://...">                         ││
│ │ │</div>                                            ││
│ │ │<td data-spec="weight">180 g</td>                ││
│ │ │...                                               ││
│ │ └──────────────────────────────────────────────────┘│
│ │                                                      │
│ │ [Processar HTML]  [Limpar]                          │
│ │                                                      │
│ │ ✓ Dados extraídos: Modelo, Imagem, Peso...         │
│ └─────────────────────────────────────────────────────┘
│
│ Nome do Modelo
│ [____________________________]
│
│ [Resto do formulário...]
│
└────────────────────────────────────────────────────────┘
```

---

## 3️⃣ Estados de Feedback

### ✅ Sucesso
```
┌───────────────────────────────────────────┐
│ ✓ Dados extraídos com sucesso:            │
│   Modelo, Imagem, Peso, Bateria, Tela... │
└───────────────────────────────────────────┘
```
Cor: Verde (#10B981)
Duração: 2.5s → auto-close

---

### ⚠️ Aviso
```
┌───────────────────────────────────────────┐
│ ⚠ Nenhum dado foi encontrado.             │
│   Verifique o HTML.                       │
└───────────────────────────────────────────┘
```
Cor: Amarelo (#F59E0B)
Duração: Permanente (até interação do usuário)

---

### ✗ Erro
```
┌───────────────────────────────────────────┐
│ ✗ Erro ao processar HTML.                 │
│   Verifique o conteúdo.                   │
└───────────────────────────────────────────┘
```
Cor: Vermelho (#EF4444)
Duração: Permanente (até interação do usuário)

---

## 4️⃣ Estados dos Botões

### Habilitado (com HTML)
```
┌──────────────────┐
│ Processar HTML   │  ← Clicável
│ (bg-amber-600)   │
└──────────────────┘
```

### Desabilitado (vazio)
```
┌──────────────────┐
│ Processar HTML   │  ← Desabilitado
│ (bg-gray-300)    │
└──────────────────┘
```

---

## 5️⃣ Formulário de Specs (Completo)

```
Especificações

Tela
[6.8 inch P-OLED________________]

Chipset
[Snapdragon 765G________________]

RAM                          Armazenamento
[6GB/8GB________]           [128GB_________]

Bateria
[4300 mAh________________________]

Câmeras
[48MP (Wide) | 8MP (Ultra)_____]

Dimensões                    Espessura
[167.2 x 74.1 x 7.9 mm____] [7.9mm_______]

Peso
[180 g__________________________]
```

---

## 6️⃣ Responsividade (Mobile)

```
┌──────────────────┐
│ Editar Celular │×│
├──────────────────┤
│ ▼ Importar Dados │
│                  │
│ ┌──────────────┐ │
│ │   HTML       │ │
│ │   input      │ │
│ └──────────────┘ │
│ [Processar]      │
│ [Limpar]         │
│                  │
│ Nome do Modelo   │
│ [______________]│
│                  │
│ Tela             │
│ [______________]│
│                  │
│ [Cancelar]       │
│ [Salvar]         │
└──────────────────┘
```

---

## 7️⃣ Fluxo Visual Completo

### Step 1: Abrir Modal
```
[Editar Celular] button
     ↓ click
Modal abre com formData preenchido
```

### Step 2: Expandir Seção
```
Modal aberto
     ↓
▼ Importar Dados (clicado)
     ↓
Details expande com transição suave
```

### Step 3: Colar HTML
```
Textarea vazio
     ↓
[Ctrl+V] → Cola HTML
     ↓
Textarea preenchido + Botão habilitado
```

### Step 4: Processar
```
[Processar HTML] click
     ↓
handleProcessHtml() executa
     ↓
parseGsmArenaHtml(html)
     ↓
found < 2 fields? → fallback
     ↓
merge com formData
     ↓
Mensagem de sucesso ✓
     ↓
Campos atualizados visualmente
     ↓
2.5s → Details fecha, textarea limpa
```

---

## 8️⃣ Cores da Interface

| Elemento | Normal | Hover | Focus |
|----------|--------|-------|-------|
| **Import Section** | bg-amber-50 | bg-amber-100 | - |
| **Summary** | text-amber-900 | hover:bg-amber-100 | - |
| **Textarea** | border-amber-300 | focus:ring-amber-500 | ring-2 |
| **Botão Processar** | bg-amber-600 | hover:bg-amber-700 | - |
| **Botão Limpar** | border-amber-300 | hover:bg-amber-50 | - |
| **Sucesso** | bg-green-100 | - | border-green-300 |
| **Aviso** | bg-yellow-100 | - | border-yellow-300 |
| **Erro** | bg-red-100 | - | border-red-300 |

---

## 9️⃣ Ícones Utilizados

| Ícone | Origem | Uso |
|-------|--------|-----|
| `Download` | lucide-react | Ao lado do título "Importar Dados" |
| `X` | lucide-react | Fechar modal |
| `▼` | Símbolo Unicode | Indicador de estado `<details>` |

---

## 🔟 Comportamento de Animação

```
Details Expanding:
┌─────────┐
│ ▼ Title │  ← Click
└────┬────┘
     │ (smooth max-height transition)
     ▼
   ┌──────────────┐
   │  Content     │  (max-h: 0 → max-h: full)
   │  appears     │
   └──────────────┘

Group open state:
- bg changes: amber-50 → amber-100
- ▼ rotates: 0deg → 180deg
```

---

## 1️⃣1️⃣ Exemplo: Preenchimento Automático

**Antes:**
```
Modelo: [               ]  (vazio)
Tela:   [               ]  (vazio)
Peso:   [               ]  (vazio)
```

**Depois (após Processar):**
```
Modelo: [LG Velvet     ]  ← Preenchido
Tela:   [6.8 inch OLED]  ← Preenchido
Peso:   [180 g        ]  ← Preenchido
```

---

## 1️⃣2️⃣ Acessibilidade

✅ **ARIA Labels**
```html
<button aria-label="Fechar modal">
<textarea placeholder="Cole o HTML aqui...">
<details id="import-details">
```

✅ **Keyboard Navigation**
- Tab: Navega entre elementos
- Enter: Ativa botões
- Space: Abre/fecha `<details>`

✅ **Focus Visible**
```css
focus:ring-2 focus:ring-blue-500
```

✅ **Color Contrast**
- Texto: Suficiente (WCAG AA)
- Mensagens: Cores diferentes + ícones

---

## 1️⃣3️⃣ Estados de Erro Visualmente

```
❌ HTML vazio
   └─ Botão desabilitado (cinza)

⚠️ HTML inválido
   └─ Mensagem em amarelo
   └─ Textarea border: amarelo

✗ Erro ao processar
   └─ Mensagem em vermelho
   └─ Console error log

✓ Sucesso parcial
   └─ Verde com lista de campos encontrados
```

---

## 1️⃣4️⃣ Dica: Inspecionar Elemento

Para usuários que querem copiar HTML manualmente:

```
1. Abra página do GSMArena
2. Pressione F12 (Inspecionar)
3. Procure por: <table> com data-spec
4. Clique direito → "Copy" → "Copy outer HTML"
5. Cole aqui! ⬇️
```

---

## 1️⃣5️⃣ Fluxo Completo do Usuário

```
Tela Principal
   │
   └─ [Editar] button
        │
        ├─ Modal abre
        │   │
        │   ├─ [Expandir Import]
        │   │   │
        │   │   ├─ [Cola HTML] → Ctrl+V
        │   │   │
        │   │   └─ [Processar] → Click
        │   │        │
        │   │        ├─ ✓ Sucesso
        │   │        │   │
        │   │        │   └─ Campos preenchidos
        │   │        │
        │   │        └─ Details fecha
        │   │
        │   ├─ [Revisa/Edita dados]
        │   │
        │   └─ [Salvar]
        │        │
        │        └─ onSave(formData)
        │            └─ LocalStorage atualizado ✅
        │
        └─ Modal fecha
```

---

**Resultado Visual Final: Uma interface limpa, intuitiva e profissional!** ✨
