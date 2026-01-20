# 🧪 Teste Prático - Parser Automático

## HTML de Exemplo para Testar

Se você quiser testar o parser sem ir ao GSMArena, você pode usar este HTML de exemplo:

```html
<h1 data-spec="modelname">LG Velvet</h1>
<div class="specs-photo-main">
  <img src="https://fdn2.gsmarena.com/vv/pics/lg/lg-velvet-1.jpg" alt="LG Velvet">
</div>
<table>
  <tr>
    <td data-spec="weight">180 g</td>
  </tr>
  <tr>
    <td data-spec="dimensions">167.2 x 74.1 x 7.9 mm</td>
  </tr>
  <tr>
    <td data-spec="batdescription1">4300 mAh, Li-Po (non-removable)</td>
  </tr>
  <tr>
    <td data-spec="displaytype">6.8 inch OLED</td>
  </tr>
  <tr>
    <td data-spec="chipset">Qualcomm Snapdragon 765 5G</td>
  </tr>
  <tr>
    <td data-spec="ram">8GB</td>
  </tr>
  <tr>
    <td data-spec="storage">128GB</td>
  </tr>
  <tr>
    <td data-spec="cam1main">48 MP</td>
  </tr>
</table>
```

### Como Testar:

1. Abra a aplicação
2. Clique em "Editar" em um celular existente (ou crie um novo)
3. Expanda a seção "Importar Dados do GSMArena (HTML)"
4. Cole o HTML acima no textarea
5. Clique em "Processar HTML"
6. Observe os campos sendo preenchidos automaticamente! ✨

**Resultado esperado:**
- ✅ Modelo: "LG Velvet"
- ✅ Imagem: URL da imagem
- ✅ Tela: "6.8 inch OLED"
- ✅ Chipset: "Qualcomm Snapdragon 765 5G"
- ✅ RAM: "8GB"
- ✅ Armazenamento: "128GB"
- ✅ Bateria: "4300 mAh, Li-Po (non-removable)"
- ✅ Câmeras: "48 MP"
- ✅ Peso: "180 g"

## 🔄 Fluxo de Funcionamento

```
┌─────────────────────────────────────┐
│  Usuário abre EditModal             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Expande seção "Importar Dados"     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Cola HTML do GSMArena              │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Clica em "Processar HTML"          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  parseGsmArenaHtml() executa        │
│  - Cria DOMParser                   │
│  - Busca por data-spec attributes   │
│  - Extrai valores                   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Se < 2 campos, tenta fallback()    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Atualiza formData com valores      │
│  extraídos (merge com existentes)   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Mostra mensagem de sucesso         │
│  Fecha details após 2.5s            │
└─────────────────────────────────────┘
```

## 🎨 Interface do Parser

A seção de importação aparece como um `<details>` expandível no topo do modal:

```
┌─────────────────────────────────────────┐
│ ▼ Importar Dados do GSMArena (HTML)     │
├─────────────────────────────────────────┤
│ Cole aqui o HTML...                     │
│ [                                       │
│  textarea com HTML                      │
│  ...                                    │
│ ]                                       │
│ [Processar HTML] [Limpar]               │
│                                         │
│ ✓ Dados extraídos com sucesso:          │
│   Modelo, Imagem, Peso, Bateria...      │
└─────────────────────────────────────────┘
```

## 📊 Dados Extraíveis

| Campo | Prioridade | Seletor Primário | Seletor Fallback |
|-------|------------|------------------|------------------|
| Modelo | ⭐⭐⭐ | `h1[data-spec="modelname"]` | `h1.caption`, `h1` |
| Imagem | ⭐⭐⭐ | `div.specs-photo-main img` | `img[alt*="image"]` |
| Peso | ⭐⭐⭐ | `[data-spec="weight"]` | Procura "weight" em tabelas |
| Bateria | ⭐⭐⭐ | `[data-spec="batdescription1"]` | `[data-spec="capacity"]` |
| Tela | ⭐⭐ | `[data-spec="displaytype"]` | Procura "display" em tabelas |
| Chipset | ⭐⭐ | `[data-spec="chipset"]` | Procura "processor" em tabelas |
| RAM | ⭐⭐ | `[data-spec="ram"]` | Procura "memory" em tabelas |
| Armazenamento | ⭐⭐ | `[data-spec="storage"]` | Procura "internal" em tabelas |
| Câmeras | ⭐ | `[data-spec="cam1main"]` | Procura "câmera" em tabelas |
| Dimensões | ⭐ | `[data-spec="dimensions"]` | Procura "dimension" em tabelas |

## ✨ Funcionalidades Implementadas

✅ Parser com DOMParser nativo do navegador  
✅ Suporte a múltiplos seletores CSS  
✅ Método fallback para HTML não padronizado  
✅ Validação e tratamento de erros  
✅ Merge inteligente com dados existentes  
✅ Mensagens de feedback ao usuário  
✅ Auto-limpeza do textarea após sucesso  
✅ Interface responsiva com detalhes expandível  

## 🚨 Casos de Erro Tratados

- HTML vazio ou inválido → Mensagem de erro
- Nenhum campo encontrado → Aviso
- Seletores não encontrados → Fallback automático
- Parse do DOM falhar → Console log + mensagem de erro
- Valores vazios ou "-" → Ignorados
