const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do Supabase no Backend
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Chave mestra (cuidado!)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

app.use(cors());
app.use(express.json());

// Rota de exemplo
app.get('/', (req, res) => {
  res.json({ message: 'Backend do Project Finance rodando!' });
});

// Exemplo de rota protegida que o Frontend chamaria
app.get('/meus-dados', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });

  const token = authHeader.split(' ')[1]; // Esse é o JWT enviado pelo Frontend
  
  // Opcional: Validar o token manualmente com o Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  res.json({ 
    message: `Olá ${user.user_metadata.full_name || 'Usuário'}!`,
    userId: user.id 
  });
});

// Listar transações do usuário
app.get('/transactions', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Sessão inválida' });

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Inserir transação
app.post('/transactions', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Sessão inválida' });

  const { amount, description, category_id, type, date, is_paid } = req.body;
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ 
      user_id: user.id, amount, description, category_id, type, 
      date: date || new Date().toISOString(),
      is_paid: is_paid ?? false
    }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
});

// Deletar transação
app.delete('/transactions/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Sessão inválida' });

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', user.id);

  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

// --- Categorias ---

app.get('/categories', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Sessão inválida' });

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.eq.${user.id},user_id.is.null`); // Pega as do usuário e as globais (se houver)

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post('/categories', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Sessão inválida' });

  const { name, icon, color, type } = req.body;
  const { data, error } = await supabase
    .from('categories')
    .insert([{ user_id: user.id, name, icon, color, type }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
