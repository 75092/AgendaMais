import express from "express";
const router = express.Router();
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

router.post("/", async (req, res) => {
  try {
    const dados = req.body;
    const query = `INSERT INTO agendamentos (
      nome_evento, data, hora_inicio, hora_fim, sala, num_mec, nome_req,
      servico_req, email_req, contacto_req, participantes, observacoes, tipo_evento, recursos
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`;

    const valores = [
      dados.nomeEvento, dados.data, dados.horaInicio, dados.horaFim, dados.sala,
      dados.numMec, dados.nomeReq, dados.servicoReq, dados.emailReq, dados.contactoReq,
      dados.participantes, dados.observacoes, dados.tipoEvento, JSON.stringify(dados.recursos)
    ];

    await pool.query(query, valores);
    res.status(200).json({ message: "✅ Agendamento guardado com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao guardar agendamento:", err);
    res.status(500).json({ message: "Erro ao guardar agendamento." });
  }
});

// Endpoint GET para listar todos os agendamentos
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM agendamentos ORDER BY data DESC, hora_inicio DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erro ao buscar agendamentos:", err);
    res.status(500).json({ message: "Erro ao buscar agendamentos." });
  }
});

export default router;

