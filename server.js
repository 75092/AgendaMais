import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sql from "mssql";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// SQL Server config
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433,
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // true se usares Azure
    trustServerCertificate: true
  }
};

// Inicializar base de dados
async function initDatabase() {
  try {
    await sql.connect(config);

    // Criar tabela users se não existir
    await sql.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
      CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(255) UNIQUE NOT NULL,
        password NVARCHAR(255) NOT NULL,
        role NVARCHAR(50) DEFAULT 'user'
      );
    `);

    // Criar admin se não existir
    const adminCheck = await sql.query(`SELECT * FROM users WHERE username = 'admin'`);
    if (adminCheck.recordset.length === 0) {
      const hashedPassword = await bcrypt.hash("12345", 10);
      await sql.query(`
        INSERT INTO users (username, password, role)
        VALUES ('admin', '${hashedPassword}', 'admin')
      `);
      console.log("✅ Utilizador admin criado: admin / 12345");
    }

    // Criar convidado se não existir
    const guestCheck = await sql.query(`SELECT * FROM users WHERE username = 'convidado'`);
    if (guestCheck.recordset.length === 0) {
      const hashedPassword = await bcrypt.hash("12345", 10);
      await sql.query(`
        INSERT INTO users (username, password, role)
        VALUES ('convidado', '${hashedPassword}', 'user')
      `);
      console.log("✅ Utilizador convidado criado: convidado / 12345");
    }

  } catch (err) {
    console.error("❌ Erro ao inicializar base de dados:", err);
  }
}
initDatabase();

// Rotas
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Registo
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username e password obrigatórios" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await sql.query(`
      INSERT INTO users (username, password, role)
      VALUES ('${username}', '${hashedPassword}', '${role || "user"}')
    `);
    res.status(201).json({ message: "✅ Utilizador registado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao registar utilizador" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await sql.query(`SELECT * FROM users WHERE username = '${username}'`);
    if (result.recordset.length === 0) {
      return res.status(400).json({ error: "Utilizador não encontrado" });
    }
    const user = result.recordset[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Password incorreta" });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ message: "✅ Login efetuado com sucesso!", token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor online na porta ${PORT}`);
});