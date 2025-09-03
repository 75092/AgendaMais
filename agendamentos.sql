CREATE TABLE agendamentos (
  id SERIAL PRIMARY KEY,
  nome_evento VARCHAR(100),
  data DATE,
  hora_inicio TIME,
  hora_fim TIME,
  sala VARCHAR(100),
  num_mec VARCHAR(20),
  nome_req VARCHAR(100),
  servico_req VARCHAR(100),
  email_req VARCHAR(100),
  contacto_req VARCHAR(20),
  participantes INTEGER,
  observacoes TEXT,
  tipo_evento VARCHAR(100),
  recursos TEXT
);
