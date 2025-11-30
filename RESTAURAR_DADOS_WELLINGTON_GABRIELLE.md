# 📊 Restaurar Dados do Wellington e Gabrielle

## 🔄 Como Restaurar os Dados Originais

Os dados do **Wellington e Gabrielle** foram substituídos quando criamos o perfil "teste". Para restaurá-los:

### **Método 1: Via Console do Navegador (Recomendado)**

1. **Faça login como `admin`:**
   - Usuário: `admin`
   - Senha: `admin123`

2. **Abra o Console do Navegador:**
   - Pressione `F12`
   - Vá para a aba "Console"

3. **Execute o comando:**
   ```javascript
   populateDatabase()
   ```

4. **Aguarde a conclusão** (você verá logs no console)

5. **Recarregue a página** (`F5` ou `Ctrl+R`)

6. **Faça login novamente** como `admin`

---

## 📊 O que será criado:

### 👥 **Pessoas Cadastradas:**
- **Wellington**
  - Salário Bruto: R$ 4.500,00
  - Salário Líquido: R$ 3.750,00
  - 13º Salário: R$ 616,66
  - Dia de Pagamento: 5

- **Gabrielle**
  - Salário Bruto: R$ 1.800,00
  - Salário Líquido: R$ 1.400,00
  - 13º Salário: R$ 1.283,33
  - Dia de Pagamento: 5

### 📅 **Período de Dados:**
- **Dezembro 2025** (em aberto)
- **Janeiro 2026** (projetado)
- **Fevereiro 2026** (projetado)
- **Março 2026** (projetado)

### 💰 **Receitas em Dezembro 2025:**
- Gabrielle - Salário: R$ 1.400,00
- Gabrielle - 13º Salário: R$ 1.283,33
- Gabrielle - Pensão: R$ 400,00
- Wellington - Salário: R$ 3.750,00
- Wellington - Salário Retroativo: R$ 1.233,33
- Wellington - 13º Salário: R$ 616,66

**Total Receitas Dezembro:** ~R$ 8.683,32

### 💸 **Despesas Fixas (Todos os meses):**
- Aluguel: R$ 1.200,00
- Hildo: R$ 1.200,00
- Internet: R$ 112,76
- Telefone: R$ 54,27
- Água: R$ 56,36
- Luz: R$ 12,26
- Mercearia: R$ 220,00

### 📝 **Parcelas (Progressivas):**
- Celular: R$ 202,00 (parcela 8 de 10)
- Fran: R$ 100,00
- Paula: R$ 500,00
- Priscila: R$ 505,00 (parcela 3 de 3)
- Itaú: R$ 78,14 (parcela 10 de 13)
- Davi: R$ 1.000,00 (parcela 5 de 5)
- Óculos: R$ 375,00 (parcela 4 de 4)
- Fabi: R$ 500,00 (parcela 2 de 3)

---

## ⚠️ **Importante:**

- ⚠️ Este comando vai **APAGAR TODOS os dados atuais** do usuário logado
- ✅ Os dados serão associados ao usuário que está logado
- ✅ Se fizer login como `admin`, os dados ficam do `admin`
- ✅ Se fizer login como `teste`, os dados ficam do `teste`

---

## 🔍 **Verificar Dados Após Restaurar:**

1. Vá para a aba **"Transações"**
2. Você deve ver as transações de dezembro/2025 e meses futuros
3. Vá para a aba **"Pessoas"**
4. Você deve ver Wellington e Gabrielle cadastrados

---

## 💡 **Dica:**

Se você quer ter **ambos os dados** (Wellington/Gabrielle + Teste):

1. **Primeiro,** faça login como `teste` e veja os dados do teste
2. **Depois,** faça login como `admin` e execute `populateDatabase()`
3. Agora você tem dados diferentes para cada usuário! 🎉

---

## 📝 **Comandos Úteis no Console:**

```javascript
// Restaurar dados do Wellington e Gabrielle
populateDatabase()

// Criar dados do usuário teste
setupClienteTeste()

// Limpar todos os dados
clearEverything()

// Ver quantas transações existem
// (vai aparecer na aba Transações do sistema)
```

---

**Pronto!** Agora você pode restaurar os dados do Wellington e Gabrielle quando quiser! 🚀

