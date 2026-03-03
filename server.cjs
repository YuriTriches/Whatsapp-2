const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'yubi',
  password: '123', 
  port: 5432,
});

// 1. REGISTRAR NOVO USUÁRIO
app.post('/registrar', async (req, res) => {
  const { nome, senha } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nome_usuario, senha) VALUES ($1, $2) RETURNING *',
      [nome, senha]
    );
    res.json(result.rows[0]);
  } catch (err) { 
    res.status(500).json({ error: "Este nome de usuário já está em uso!" }); 
  }
});

// 2. LOGIN
app.post('/login', async (req, res) => {
  const { nome, senha } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE nome_usuario = $1 AND senha = $2', [nome, senha]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: "Usuário ou senha incorretos" });
    }
  } catch (err) { res.status(500).send(err.message); }
});

// 3. BUSCAR TODOS OS USUÁRIOS (Para a lista de contatos)
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome_usuario, foto_url FROM usuarios');
    res.json(result.rows);
  } catch (err) { res.status(500).send(err.message); }
});

// 4. ATUALIZAR PERFIL (NOME, SENHA, FOTO)
// MANTIVE APENAS UMA VERSÃO DESTA ROTA (A COMPLETA)
app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, senha, foto } = req.body;
  try {
    await pool.query(
      'UPDATE usuarios SET nome_usuario = $1, senha = $2, foto_url = $3 WHERE id = $4',
      [nome, senha, foto, id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).send(err.message); }
});

// 5. BUSCAR MENSAGENS
app.get('/mensagens', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mensagens ORDER BY enviada_em ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).send(err.message); }
});

// 6. ENVIAR MENSAGEM
app.post('/mensagens', async (req, res) => {
  const { remetente_id, destinatario_id, conteudo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO mensagens (remetente_id, destinatario_id, conteudo) VALUES ($1, $2, $3) RETURNING *',
      [remetente_id, destinatario_id, conteudo]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).send(err.message); }
});

app.listen(3001, () => {
  console.log("--------------------------------");
  console.log("🚀 SERVIDOR RODANDO NA PORTA 3001");
  console.log("✅ BANCO CONECTADO: yubi");
  console.log("--------------------------------");
});