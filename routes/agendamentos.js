
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

    const pedido = {
      nomeReq: document.getElementById("nomeReq").value,
      numMec: document.getElementById("numMec").value,
      servicoReq: document.getElementById("servicoReq").value,
      emailReq: document.getElementById("emailReq").value,
      contactoReq: document.getElementById("contactoReq").value,
      data: document.getElementById("data").value,
      horaInicio: document.getElementById("horaInicio").value,
      horaFim: document.getElementById("horaFim").value,
      sala: document.getElementById("sala").value,
      tipoEvento: document.getElementById("tipoEvento").value,
      nomeEvento: document.getElementById("nomeEvento").value,
      participantes: document.getElementById("participantes").value,
      observacoes: document.getElementById("observacoes").value,
      recursos: Array.from(document.querySelectorAll("input[name='recursos']:checked")).map(el => el.value)
    };

    await pool.query(query, valores);
    res.status(200).json({ message: "✅ Agendamento guardado com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao guardar agendamento:", err);
    res.status(500).json({ message: "Erro ao guardar agendamento." });
  }
});

export default router;
