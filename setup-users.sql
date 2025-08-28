/**************************************************************
 * CONFIGURAÇÃO DE UTILIZADORES NO SQL SERVER
 * Cria a base de dados (se não existir), logins e permissões
 **************************************************************/

-- 1) Criar a base de dados (se não existir)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'MinhaBase')
BEGIN
    CREATE DATABASE MinhaBase;
    PRINT 'Base de dados MinhaBase criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Base de dados MinhaBase já existe.';
END
GO


-- 2) Criar login e utilizador ADMIN com todas as permissões
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = N'admin')
BEGIN
    CREATE LOGIN admin WITH PASSWORD = '12345';
    PRINT 'Login admin criado.';
END
ELSE
BEGIN
    PRINT 'Login admin já existe.';
END
GO

USE MinhaBase;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'admin')
BEGIN
    CREATE USER admin FOR LOGIN admin;
    PRINT 'User admin criado dentro da base MinhaBase.';
END
ELSE
BEGIN
    PRINT 'User admin já existe dentro da base MinhaBase.';
END
GO

-- Dar todas as permissões ao admin (db_owner = dono da base)
ALTER ROLE db_owner ADD MEMBER admin;
GO



-- 3) Criar login e utilizador CONVIDADO com permissões limitadas
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = N'convidado')
BEGIN
    CREATE LOGIN convidado WITH PASSWORD = '12345';
    PRINT 'Login convidado criado.';
END
ELSE
BEGIN
    PRINT 'Login convidado já existe.';
END
GO

USE MinhaBase;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = N'convidado')
BEGIN
    CREATE USER convidado FOR LOGIN convidado;
    PRINT 'User convidado criado dentro da base MinhaBase.';
END
ELSE
BEGIN
    PRINT 'User convidado já existe dentro da base MinhaBase.';
END
GO

-- Permissões básicas: leitura e escrita
EXEC sp_addrolemember 'db_datareader', 'convidado'; -- SELECT
EXEC sp_addrolemember 'db_datawriter', 'convidado'; -- INSERT, UPDATE, DELETE

-- Revogar poderes administrativos do convidado
DENY ALTER ANY LOGIN TO convidado;
DENY ALTER ANY DATABASE TO convidado;
DENY ALTER ANY ROLE TO convidado;
DENY CONTROL SERVER TO convidado;
GO

PRINT 'Configuração concluída com sucesso!';
