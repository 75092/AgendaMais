USE formanos;
GO

-- Ver todos os utilizadores atuais
SELECT id, username, role FROM users;
GO

-- Inserir utilizador ADMIN (com password em texto simples, o Node.js irá encriptar quando regista)
-- ⚠️ Normalmente deves deixar o Node.js fazer o hash, mas aqui está para testes rápidos
INSERT INTO users (username, password, role)
VALUES ('admin2', '12345', 'admin');
GO

-- Inserir utilizador CONVIDADO (role = user)
INSERT INTO users (username, password, role)
VALUES ('convidado', '12345', 'user');
GO

-- Atualizar role de um utilizador existente
UPDATE users SET role = 'admin' WHERE username = 'joao';
GO

-- Eliminar um utilizador
DELETE FROM users WHERE username = 'teste';
GO
