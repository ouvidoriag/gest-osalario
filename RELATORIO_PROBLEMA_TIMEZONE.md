# 🔍 Relatório Detalhado - Problema de Timezone

## 📋 **RESUMO DO PROBLEMA:**

Todas as despesas de **dezembro/2025** estão sendo exibidas como **novembro/2025** devido a um problema de conversão de timezone.

---

## 🔴 **DESPESAS AFETADAS:**

### **Total: 15 despesas afetadas**

Todas as despesas criadas com data `2025-12-01` estão sendo interpretadas como `30/11/2025` (30 de novembro) na interface.

### **Lista Completa de Despesas Afetadas:**

| # | Descrição | Valor | Data no Banco | Data Exibida | Status |
|---|-----------|-------|---------------|--------------|--------|
| 1 | Óculos | R$ 375,00 | 2025-12-01 | 30/11/2025 | ❌ Errado |
| 2 | Luz | R$ 12,26 | 2025-12-01 | 30/11/2025 | ❌ Errado |
| 3 | Priscila | R$ 505,00 | 2025-12-01 | 30/11/2025 | ❌ Errado |
| 4 | Fran | R$ 100,00 | 2025-12-01 | 30/11/2025 | ❌ Errado |
| 5 | Internet | R$ 112,76 | 2025-12-01 | 30/11/2025 | ❌ Errado |
| 6 | Fabi | R$ 500,00 | 2025-12-01 | 30/11/2025 | ❌ Errado |
| 7 | Celular | R$ 202,00 | 2025-12-01 | 30/11/2025 | ❌ Errado |
| 8 | Paula | R$ 500,00 | 2025-12-01 | 30/11/2025 | ❌ Errado |
| 9 | Itaú | R$ 78,14 | 2025-12-01 | 30/11/2025 | ❌ Errado |
| 10 | Aluguel | R$ 1.200,00 | 2025-12-01 | 30/11/2025 | ❌ Errado |
| 11 | Telefone | R$ 54,27 | 2025-12-01 | 30/11/2025 | ❌ Errado |
| 12 | Hildo | R$ 1.200,00 | 2025-12-01 | 30/11/2025 | ❌ Errado |
| 13 | Água | R$ 56,36 | 2025-12-01 | 30/11/2025 | ❌ Errado |
| 14 | Mercearia | R$ 220,00 | 2025-12-01 | 30/11/2025 | ❌ Errado |
| 15 | Davi | R$ 1.000,00 | 2025-12-01 | 30/11/2025 | ❌ Errado |

**Total afetado:** R$ 6.115,79

---

## 🔬 **CAUSA TÉCNICA:**

### **O Problema:**

1. **Data no Banco:** `"2025-12-01"` (formato string)
2. **Conversão JavaScript:** `new Date("2025-12-01")` interpreta como UTC (meia-noite UTC)
3. **Timezone Local:** UTC-3 (Brasil)
4. **Resultado:** Meia-noite UTC = 21h do dia anterior no horário local
   - `2025-12-01 00:00:00 UTC` = `2025-11-30 21:00:00 UTC-3`

### **Detalhes Técnicos:**

```
Timezone Offset: -180 minutos (UTC-3)
Data String: "2025-12-01"
Date Object (UTC): 2025-12-01T00:00:00.000Z
Date Object (Local): 2025-11-30T21:00:00.000-03:00
Mês Interpretado: 11 (novembro) ❌
Mês Esperado: 12 (dezembro) ✅
Dia Exibido: 30/11/2025 ❌
Dia Esperado: 01/12/2025 ✅
```

---

## ✅ **O QUE ESTÁ CORRETO:**

### **Receitas de Dezembro/2025:**
Todas as 6 receitas de dezembro estão **CORRETAS** porque foram salvas com horário específico:
- Data no banco: `2025-12-05` (dia 5)
- Ao converter para timezone local, ainda ficam em dezembro (05/12)

### **Despesas de Outros Meses:**
- Janeiro/2026: ✅ Correto (12 despesas)
- Fevereiro/2026: ✅ Correto (11 despesas)
- Março/2026: ✅ Correto (10 despesas)

---

## 🛠️ **SOLUÇÃO RECOMENDADA:**

### **Opção 1: Usar Datas com Horário Local**
Ao criar transações, usar formato que evita timezone:
```typescript
// Em vez de:
date: "2025-12-01"

// Usar:
date: "2025-12-01T12:00:00-03:00" // Meio-dia no horário local
// OU
const date = new Date(2025, 11, 1); // Mês 11 = dezembro (0-indexed)
date.toISOString().split('T')[0]; // Converte para string
```

### **Opção 2: Usar Método de Parsing que Ignora Timezone**
```typescript
// Criar função helper:
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month - 1 porque Date usa 0-11
}
```

### **Opção 3: Usar date-fns parseISO com timezone**
```typescript
import { parseISO } from 'date-fns';
// Mas precisa configurar timezone corretamente
```

---

## 📊 **IMPACTO:**

### **Contagem de Transações:**
- ✅ **Não afeta** a contagem total (todas as 48 despesas estão presentes)
- ❌ **Afeta** a exibição no mês correto
- ❌ **Afeta** o filtro por mês (despesas aparecem em novembro quando deveriam estar em dezembro)

### **Valores:**
- ✅ Valores estão corretos
- ❌ Apenas a data de exibição está incorreta

---

## 🎯 **CONCLUSÃO:**

**Todas as 15 despesas de dezembro/2025** estão sendo afetadas pelo problema de timezone. Elas aparecem como se fossem de novembro, mas os valores e a contagem estão corretos.

**Recomendação:** Corrigir o método de criação/parsing de datas para evitar problemas de timezone ao trabalhar apenas com datas (sem horário).

