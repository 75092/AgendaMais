CREATE TABLE agendamentos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  num_mec TEXT,
  servico TEXT NOT NULL,
  email TEXT NOT NULL,
  contacto TEXT NOT NULL,
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  sala TEXT NOT NULL,
  tipo_evento TEXT NOT NULL,
  nome_evento TEXT NOT NULL,
  participantes INTEGER,
  observacoes TEXT,
  estado VARCHAR(20) DEFAULT 'Pendente'
);
