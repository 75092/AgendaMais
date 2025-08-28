-- Script opcional para criar a tabela (caso desejes via DB tool)
CREATE TABLE IF NOT EXISTS agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nomeEvento TEXT,
  data TEXT,
  horaInicio TEXT,
  horaFim TEXT,
  sala TEXT,
  participantes INTEGER,
  observacoes TEXT
);
