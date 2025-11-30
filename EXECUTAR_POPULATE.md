# Como Executar o Script de População do Banco

## Opção 1: Via Botão no Dashboard (Recomendado)

1. Abra o aplicativo no navegador (geralmente em `http://localhost:5173`)
2. No canto superior direito, clique no botão verde com ícone de banco de dados (Database)
3. Confirme a ação quando solicitado
4. O banco será apagado e populado com os dados históricos
5. A página será recarregada automaticamente

## Opção 2: Via Console do Navegador

1. Abra o aplicativo no navegador
2. Pressione `F12` para abrir as Ferramentas de Desenvolvedor
3. Vá para a aba "Console"
4. Digite e pressione Enter:
   ```javascript
   populateDatabase()
   ```
5. Aguarde a mensagem de sucesso
6. Recarregue a página (`F5` ou `Ctrl+R`)

## Opção 3: Via URL

1. Abra o aplicativo no navegador
2. Adicione `?populate=true` na URL:
   ```
   http://localhost:5173/?populate=true
   ```
3. O script será executado automaticamente
4. A página será recarregada após a conclusão

## Dados que serão criados:

- **Agosto 2025**: 15 transações (status: pago)
- **Setembro 2025**: 15 transações (status: pago)
- **Outubro 2025**: 15 transações (status: pago)
- **Novembro 2025**: 15 transações (status: pago)
- **Dezembro 2025**: 15 transações (status: em aberto)

**Total: 75 transações**

### Gastos Fixos (todos os meses):
- Aluguel: R$ 1.200,00
- Hildo: R$ 1.200,00
- Internet: R$ 112,76
- Telefone: R$ 54,27
- Água: R$ 56,36
- Luz: R$ 12,26
- Mercearia: R$ 220,00

### Parcelas (variam por mês):
- Celular: R$ 202,00
- Fran: R$ 100,00
- Paula: R$ 500,00
- Priscila: R$ 505,00
- Itaú: R$ 78,14
- Davi: R$ 1.000,00
- Óculos: R$ 375,00
- Fabi: R$ 500,00

