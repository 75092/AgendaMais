import express from "express";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;
const router = express.Router();

// Conexão à BD
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ➡️ Criar agendamento (recebe dados do frontend via fetch)
router.post("/", (req, res) => {
  try {
    const {
      nomeEvento,
      data,
      horaInicio,
      horaFim,
      sala,
      numMec,
      nomeReq,
      servicoReq,
      emailReq,
      contactoReq,
      participantes,
      observacoes,
      tipoEvento,
      recursos
    } = req.body;

    const query = `
      INSERT INTO agendamentos (
        nome_evento, data, hora_inicio, hora_fim, sala, num_mec, nome_req,
        servico_req, email_req, contacto_req, participantes, observacoes, tipo_evento, recursos
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    `;

    const valores = [
      nomeEvento,
      data,
      horaInicio,
      horaFim,
      sala,
      numMec,
      nomeReq,
      servicoReq,
      emailReq,
      contactoReq,
      participantes,
      observacoes,
      tipoEvento,
      JSON.stringify(recursos) // Guardamos array como texto JSON
    ];

    await pool.query(query, valores);
    res.status(200).json({ message: "✅ Agendamento guardado com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao guardar agendamento:", err);
    res.status(500).json({ message: "Erro ao guardar agendamento." });
  }
});

// ➡️ Listar todos os agendamentos
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM agendamentos ORDER BY data, hora_inicio");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erro ao carregar agendamentos:", err);
    res.status(500).json({ message: "Erro ao carregar agendamentos." });
  }
});

export default router;
