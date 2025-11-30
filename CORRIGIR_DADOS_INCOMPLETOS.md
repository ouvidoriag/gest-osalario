# 🔧 Como Corrigir Dados Incompletos

## ❌ Problema Identificado

O sistema está mostrando apenas **R$ 10.500 de receitas** e **R$ 0 de despesas**. Isso significa que o setup foi executado parcialmente - só criou receitas, não despesas.

---

## ✅ Solução: Recriar Dados Completos

### **Passo a Passo:**

1. **Faça login como `admin` ou `teste`** (qualquer um)

2. **Abra o Console do Navegador:**
   - Pressione `F12`
   - Vá para a aba "Console"

3. **Execute este comando para limpar e recriar:**
   ```javascript
   localStorage.removeItem('teste_setup_completed');
   clearAllData();
   location.reload();
   ```

4. **Aguarde a página recarregar**

5. **Faça login novamente**

6. **Os dados completos serão criados automaticamente!**

---

## 🔍 Verificar se Funcionou

Após recarregar, você deve ver no console:
- ✅ Mensagens de criação de dados
- ✅ "✅ Setup concluído! XXX transações criadas"
- ✅ Resumo financeiro mostrando receitas E despesas

No Dashboard você deve ver:
- 💰 Receitas (várias transações)
- 💸 Despesas (muitas transações)
- 📊 Gráficos funcionando

---

## 🎯 Dados Esperados

Após a correção, você deve ter:
- **~171 transações** no total
- **Receitas:** Salário, Freelance, 13º Salário, etc.
- **Despesas:** Aluguel, Contas, Alimentação, Transporte, etc.
- **6 meses de dados:** Out/2025 até Mar/2026

---

## ⚠️ Se Ainda Não Funcionar

Se após seguir os passos acima ainda não funcionar, execute:

```javascript
// Limpa TUDO
clearEverything();

// Remove flag
localStorage.removeItem('teste_setup_completed');

// Força recriar dados
setupClienteTeste().then(() => {
  console.log('✅ Dados recriados! Recarregue a página.');
  location.reload();
});
```

---

**Depois de executar, os dados completos devem aparecer!** 🎉

