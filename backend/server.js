const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Backend do Project Finance rodando!' });
});

app.post('/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (error) throw error;

    res.status(201).json({ 
      success: true, 
      user: data.user,
      message: 'Usuário criado com sucesso' 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.post('/auth/recover', async (req, res) => {
  const { email } = req.body;

  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: 'projectfinance://reset-password' }
    });

    if (error) throw error;

    res.json({ 
      success: true, 
      link: data.properties.action_link,
      message: 'Link de recuperação gerado' 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/auth/password-otp-request', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });
  
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Sessão inválida' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/password_otp:${user.id}/${otp}/EX/600`, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
    });

    res.json({ success: true, otp, message: 'Token gerado' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar token no Redis' });
  }
});

app.post('/auth/password-otp-confirm', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });
  
  const { otp, newPassword } = req.body;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Sessão inválida' });

  const redisRes = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/password_otp:${user.id}`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
  });
  const { result: savedOtp } = await redisRes.json();

  if (!savedOtp || savedOtp !== otp) {
    return res.status(400).json({ error: 'Token inválido ou expirado' });
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword
  });

  if (updateError) return res.status(400).json({ error: updateError.message });
  await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/del/password_otp:${user.id}`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
  });

  res.json({ success: true, message: 'Senha alterada com sucesso!' });
});

app.get('/meus-dados', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });

  const token = authHeader.split(' ')[1];
  
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  res.json({ 
    message: `Olá ${user.user_metadata.full_name || 'Usuário'}!`,
    userId: user.id 
  });
});

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

app.post('/transactions', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Sessão inválida' });

  const { amount, description, categoryId, type, date, isPaid, installmentNumber, totalInstallments } = req.body;
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ 
      user_id: user.id, 
      amount, 
      description, 
      category_id: categoryId, 
      type, 
      date: date || new Date().toISOString(),
      is_paid: isPaid ?? false,
      installment_number: installmentNumber,
      total_installments: totalInstallments
    }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
});

app.put('/transactions/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Sessão inválida' });

  const { amount, description, categoryId, type, date, isPaid } = req.body;
  const { data, error } = await supabase
    .from('transactions')
    .update({ 
      amount, 
      description, 
      category_id: categoryId, 
      type, 
      date, 
      is_paid: isPaid 
    })
    .eq('id', req.params.id)
    .eq('user_id', user.id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

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

app.get('/categories', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Sessão inválida' });

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.eq.${user.id},user_id.is.null`);

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

app.put('/categories/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Sessão inválida' });

  const { name, icon, color, type, isActive } = req.body;
  const { data, error } = await supabase
    .from('categories')
    .update({ name, icon, color, type, is_active: isActive })
    .eq('id', req.params.id)
    .eq('user_id', user.id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/categories/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Sessão inválida' });

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', user.id);

  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
