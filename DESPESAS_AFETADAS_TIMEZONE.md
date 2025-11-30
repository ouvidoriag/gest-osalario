# 📋 Quais Despesas Estão Afetadas pelo Problema de Timezone

## 🔴 **TODAS AS 15 DESPESAS DE DEZEMBRO/2025 ESTÃO AFETADAS**

### **Resumo:**
- **Total afetado:** 15 despesas
- **Valor total:** R$ 6.115,79
- **Problema:** Aparecem como novembro quando deveriam ser dezembro

---

## 📝 **Lista Completa das Despesas Afetadas:**

### **1. Gastos Fixos (7 despesas):**

1. ✅ **Aluguel** - R$ 1.200,00
   - Data no banco: `2025-12-01`
   - Aparece como: `30/11/2025` ❌

2. ✅ **Hildo** - R$ 1.200,00
   - Data no banco: `2025-12-01`
   - Aparece como: `30/11/2025` ❌

3. ✅ **Internet** - R$ 112,76
   - Data no banco: `2025-12-01`
   - Aparece como: `30/11/2025` ❌

4. ✅ **Telefone** - R$ 54,27
   - Data no banco: `2025-12-01`
   - Aparece como: `30/11/2025` ❌

5. ✅ **Água** - R$ 56,36
   - Data no banco: `2025-12-01`
   - Aparece como: `30/11/2025` ❌

6. ✅ **Luz** - R$ 12,26
   - Data no banco: `2025-12-01`
   - Aparece como: `30/11/2025` ❌

7. ✅ **Mercearia** - R$ 220,00
   - Data no banco: `2025-12-01`
   - Aparece como: `30/11/2025` ❌

---

### **2. Parcelas de Dezembro (8 despesas):**

8. ✅ **Celular** (8/10) - R$ 202,00
   - Data no banco: `2025-12-01`
   - Aparece como: `30/11/2025` ❌

9. ✅ **Fran** (1/1) - R$ 100,00
   - Data no banco: `2025-12-01`
   - Aparece como: `30/11/2025` ❌

10. ✅ **Paula** (1/1) - R$ 500,00
    - Data no banco: `2025-12-01`
    - Aparece como: `30/11/2025` ❌

11. ✅ **Priscila** (3/3) - R$ 505,00
    - Data no banco: `2025-12-01`
    - Aparece como: `30/11/2025` ❌

12. ✅ **Itaú** (10/13) - R$ 78,14
    - Data no banco: `2025-12-01`
    - Aparece como: `30/11/2025` ❌

13. ✅ **Davi** (5/5) - R$ 1.000,00
    - Data no banco: `2025-12-01`
    - Aparece como: `30/11/2025` ❌

14. ✅ **Óculos** (4/4) - R$ 375,00
    - Data no banco: `2025-12-01`
    - Aparece como: `30/11/2025` ❌

15. ✅ **Fabi** (2/3) - R$ 500,00
    - Data no banco: `2025-12-01`
    - Aparece como: `30/11/2025` ❌

---

## ✅ **O QUE ESTÁ CORRETO:**

### **Receitas de Dezembro:**
- ✅ **6 receitas** estão corretas (aparecem em dezembro)
- Datas: `2025-12-05` (dia 5)
- Não são afetadas porque têm horário específico

### **Despesas de Outros Meses:**
- ✅ Janeiro/2026: 12 despesas corretas
- ✅ Fevereiro/2026: 11 despesas corretas  
- ✅ Março/2026: 10 despesas corretas

---

## 📊 **IMPACTO:**

- **Valores:** ✅ Todos corretos
- **Contagem:** ✅ Todas as 48 despesas estão presentes
- **Data de Exibição:** ❌ 15 despesas aparecem no mês errado
- **Filtro por Mês:** ❌ Despesas de dezembro aparecem em novembro

---

## 🔧 **SOLUÇÃO:**

Para corrigir, é necessário ajustar o método de criação/parsing de datas para evitar problemas de timezone ao trabalhar apenas com datas (sem horário).

**Relatório técnico completo:** Veja `RELATORIO_PROBLEMA_TIMEZONE.md`

