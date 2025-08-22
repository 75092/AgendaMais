import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pkg from "pg";

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(bodyParser.json());

// Configuração do PostgreSQL (via Render ENV VAR)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Testar ligação
pool.connect()
  .then(() => console.log("✅ Ligação ao PostgreSQL feita com sucesso!"))
  .catch(err => console.error("❌ Erro ao ligar ao PostgreSQL:", err));

// ---------------- ROTAS ---------------- //

// Rota de teste
app.get("/", (req, res) => {
  res.send("Servidor online e a ligar ao PostgreSQL!");
});

// Exemplo: registar utilizador
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Faltam dados" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [username, hashedPassword]
    );

    res.status(201).json({ message: "Utilizador registado!", userId: result.rows[0].id });
  } catch (err) {
    console.error("Erro no registo:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Exemplo: login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "Utilizador não encontrado" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Password incorreta" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login efetuado com sucesso!", token });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// --------------------------------------- //

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});

