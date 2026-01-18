# Verificar Variáveis de Ambiente

## Problema: "Invalid API key"

Isso significa que as variáveis de ambiente não estão sendo carregadas corretamente.

## Solução:

1. **Verifique o arquivo `.env` na raiz do projeto `project/`:**

O arquivo deve ter EXATAMENTE este formato (cada variável em uma linha separada):

```env
NEXT_PUBLIC_SUPABASE_URL=https://mhrescjawktjoiypeica.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocmVzY2phd2t0am9peXBlaWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjEyNjcsImV4cCI6MjA4NDI5NzI2N30.5zsIjHVw8ShkdTPurumEQ_WUVnBLtu5phRcTA2L443Q
```

**IMPORTANTE:**
- Cada variável deve estar em uma linha separada
- Não deixe espaços antes ou depois do `=`
- Não adicione aspas
- Não deixe linhas em branco extras no início

2. **Reinicie o servidor de desenvolvimento:**

Após atualizar o `.env`, você DEVE reiniciar o servidor:

```bash
# Pare o servidor (Ctrl+C)
# Depois inicie novamente:
npm run dev
```

3. **Verifique se as variáveis estão sendo carregadas:**

Adicione temporariamente no início de `app/login/page.tsx`:

```typescript
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
```

Se aparecer `undefined`, as variáveis não estão sendo carregadas.

## Checklist:

- [ ] Arquivo `.env` existe em `project/.env`
- [ ] Arquivo `.env` tem as duas variáveis corretas
- [ ] Cada variável está em uma linha separada
- [ ] Servidor foi reiniciado após atualizar `.env`
- [ ] Não há erros de sintaxe no `.env`

