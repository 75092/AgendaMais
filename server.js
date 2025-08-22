const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Porta → Render usa process.env.PORT
const PORT = process.env.PORT || 3000;

// Secret → vem de variável de ambiente
const SECRET = process.env.JWT_SECRET || 'dev-secret';

// Conexão à base de dados Postgres
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // necessário no Render
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Criar tabelas
db.query(`
  CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    nomeEvento TEXT,
    data TEXT,
    horaInicio TEXT,
    horaFim TEXT,
    sala TEXT,
    participantes INTEGER,
    observacoes TEXT
  )
`);

db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  )
`);

// Inserir utilizadores iniciais (se não existirem)
const insertUser = async (username, role) => {
  try {
    const password = '123';
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO users (username, password, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING`,
      [username, hash, role]
    );
  } catch (err) {
    console.error(err);
  }
};

insertUser('utilizador', 'user');
insertUser('admin', 'admin');

// ---------------- ROTAS ----------------

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET,
      { expiresIn: '2h' }
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no login' });
  }
});

// Middleware de autenticação
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Middleware de autorização
function authorize(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.sendStatus(403);
    next();
  };
}

// Guardar agendamento (user/admin)
app.post('/api/agendamentos', authenticate, authorize(['user', 'admin']), async (req, res) => {
  const { nomeEvento, data, horaInicio, horaFim, sala, participantes, observacoes } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO agendamentos
      (nomeEvento, data, horaInicio, horaFim, sala, participantes, observacoes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id`,
      [nomeEvento, data, horaInicio, horaFim, sala, participantes, observacoes]
    );
    res.status(200).json({ message: 'Agendamento guardado com sucesso!', id: result.rows[0].id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erro ao guardar agendamento' });
  }
});

// Listar agendamentos (user/admin)
app.get('/api/agendamentos', authenticate, authorize(['user', 'admin']), async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM agendamentos');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

// Apenas admin
app.get('/api/admin-area', authenticate, authorize(['admin']), (req, res) => {
  res.send('Bem-vindo à área de administração!');
});

// ---------------- START ----------------
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
