# Schema do Banco de Dados SQLite

## Estrutura das Tabelas

### Tabela: transactions
Armazena todas as transações financeiras (receitas e despesas).

```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                    -- 'income' ou 'expense'
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,                     -- Formato: YYYY-MM-DD
  category TEXT NOT NULL,
  tags TEXT,                              -- JSON array de tags
  priority TEXT,                          -- 'low', 'medium', 'high' (apenas despesas)
  status TEXT,                            -- 'paid', 'open', 'overdue' (apenas despesas)
  installment_current INTEGER,            -- Parcela atual (ex: 8)
  installment_total INTEGER,              -- Total de parcelas (ex: 10)
  is_fixed_expense INTEGER DEFAULT 0,     -- 1 se é gasto fixo recorrente
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_transactions_date` - Busca por data
- `idx_transactions_type` - Busca por tipo
- `idx_transactions_status` - Busca por status
- `idx_transactions_category` - Busca por categoria
- `idx_transactions_date_type` - Busca combinada (data + tipo)

### Tabela: categories
Armazena as categorias de transações.

```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,                    -- Código hexadecimal
  icon TEXT NOT NULL,                     -- Emoji ou ícone
  type TEXT NOT NULL,                     -- 'income' ou 'expense'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_categories_type` - Busca por tipo
- `idx_categories_name` - Busca por nome

### Tabela: tags
Armazena as tags para organização.

```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,                    -- Código hexadecimal
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_tags_name` - Busca por nome

### Tabela: thirteenth_salaries
Armazena informações sobre 13º salário.

```sql
CREATE TABLE thirteenth_salaries (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  entry_date TEXT NOT NULL,               -- Formato: YYYY-MM-DD
  installments INTEGER NOT NULL,          -- 1 ou 2 parcelas
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_thirteenth_entry_date` - Busca por data de entrada

### Tabela: people
Armazena informações das pessoas (casal).

```sql
CREATE TABLE people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gross_salary REAL NOT NULL,             -- Salário bruto
  net_salary REAL NOT NULL,               -- Salário líquido
  thirteenth_salary REAL NOT NULL,         -- 13º salário
  payment_day INTEGER NOT NULL CHECK(payment_day >= 1 AND payment_day <= 31),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_people_name` - Busca por nome

## Dados Populados

O script `populateDatabase.ts` cria automaticamente:

- **Agosto 2025**: Todas as despesas com status "paid" (pago)
- **Setembro 2025**: Todas as despesas com status "paid" (pago)
- **Outubro 2025**: Todas as despesas com status "paid" (pago)
- **Novembro 2025**: Todas as despesas com status "paid" (pago)
- **Dezembro 2025**: Todas as despesas com status "open" (em aberto)

### Gastos Fixos (todos os meses):
- Aluguel: R$ 1.200,00
- Hildo: R$ 1.200,00
- Internet: R$ 112,76
- Telefone: R$ 54,27
- Água: R$ 56,36
- Luz: R$ 12,26
- Mercearia: R$ 220,00

### Parcelas (variam por mês):
- Celular: R$ 202,00 (parcelas variam)
- Fran: R$ 100,00
- Paula: R$ 500,00
- Priscila: R$ 505,00
- Itaú: R$ 78,14 (parcelas variam)
- Davi: R$ 1.000,00
- Óculos: R$ 375,00
- Fabi: R$ 500,00 (parcelas variam)

## Como Usar

1. Clique no botão verde com ícone de banco de dados no header
2. Confirme a ação
3. O banco será limpo e populado com os dados históricos
4. A página será recarregada automaticamente

## Backup

O banco SQLite é salvo automaticamente no localStorage como base64 após cada operação.

