import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import agendamentosRouter from "./routes/agendamentos.js";

dotenv.config();
const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({
  origin: "https://forma-o.onrender.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL
      );
    `);

    const adminCheck = await pool.query("SELECT * FROM users WHERE username = $1", ["admin"]);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash("12345", 10);
      await pool.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
        ["admin", hashedPassword, "admin"]
      );
      console.log("✅ Utilizador admin criado (admin/12345)");
    }

    const guestCheck = await pool.query("SELECT * FROM users WHERE username = $1", ["convidado"]);
    if (guestCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash("12345", 10);
      await pool.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
        ["convidado", hashedPassword, "user"]
      );
      console.log("✅ Utilizador convidado criado (convidado/12345)");
    }
  } catch (err) {
    console.error("❌ Erro ao inicializar BD:", err);
  }
}
initDatabase();

app.use("/api/agendamentos", agendamentosRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Utilizador não encontrado" });
    }

    const user = result.rows[0];
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
    res.status(500).json({ error: "Erro no servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor online na porta ${PORT}`);
});
