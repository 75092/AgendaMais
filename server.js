const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Porta → usa a do Render/Heroku ou 3000 local
const PORT = process.env.PORT || 3000;

// Secret → NUNCA deixar fixo em produção
const SECRET = process.env.JWT_SECRET || 'dev-secret';

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Base de dados SQLite (ficheiro local)
const db = new sqlite3.Database('database.db');

// Criar tabelas
db.run(`CREATE TABLE IF NOT EXISTS agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nomeEvento TEXT,
  data TEXT,
  horaInicio TEXT,
  horaFim TEXT,
  sala TEXT,
  participantes INTEGER,
  observacoes TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL
)`);

// Inserir utilizadores iniciais (se não existirem)
const insertUser = (username, role) => {
  const password = '123';
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return console.error(err);
    db.run(
      `INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`,
      [username, hash, role]
    );
  });
};

insertUser('utilizador', 'user');
insertUser('admin', 'admin');

// ---------------- ROTAS ----------------

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Credenciais inválidas' });

    bcrypt.compare(password, user.password, (err, result) => {
      if (!result) return res.status(401).json({ error: 'Credenciais inválidas' });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        SECRET,
        { expiresIn: '2h' }
      );
      res.json({ token });
    });
  });
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
app.post('/api/agendamentos', authenticate, authorize(['user', 'admin']), (req, res) => {
  const { nomeEvento, data, horaInicio, horaFim, sala, participantes, observacoes } = req.body;

  const stmt = db.prepare(
    'INSERT INTO agendamentos (nomeEvento, data, horaInicio, horaFim, sala, participantes, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  stmt.run(nomeEvento, data, horaInicio, horaFim, sala, participantes, observacoes, function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Erro ao guardar agendamento' });
    }
    res.status(200).json({ message: 'Agendamento guardado com sucesso!', id: this.lastID });
  });
});

// Listar agendamentos (user/admin)
app.get('/api/agendamentos', authenticate, authorize(['user', 'admin']), (req, res) => {
  db.all('SELECT * FROM agendamentos', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
    res.json(rows);
  });
});

// Apenas admin
app.get('/api/admin-area', authenticate, authorize(['admin']), (req, res) => {
  res.send('Bem-vindo à área de administração!');
});

// ---------------- START ----------------
app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});
