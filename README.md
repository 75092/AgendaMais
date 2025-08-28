# Forma-o

Aplicação web com autenticação de utilizadores (admin/convidado) ligada a SQL Server.

---

## 🚀 Requisitos

- [Node.js](https://nodejs.org/) (versão 18+)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (Developer ou Express)
- [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms)

---

## ⚙️ Instalação

1. **Clonar repositório**
   ```bash
   git clone https://github.com/seu-usuario/Forma-o.git
   cd Forma-o
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**
   - Copiar `.env.example` para `.env`:
     ```bash
     cp .env.example .env
     ```
   - Preencher com os dados do SQL Server:
     ```ini
     DB_USER=admin
     DB_PASSWORD=12345
     DB_SERVER=localhost
     DB_PORT=1433
     DB_NAME=formanos
     JWT_SECRET=uma_chave_segura_aqui
     ```

---

## 🗄️ Base de dados

1. **Executar script inicial**
   - Abrir o ficheiro `setup-users.sql` no SSMS.
   - Executar para criar a base `formanos`, o login `admin` e o login `convidado`.

2. **Utilizadores iniciais da aplicação**
   - O `server.js` cria automaticamente na tabela `users`:
     - `admin / 12345` (role = admin)
     - `convidado / 12345` (role = user)

3. **Ver/gerir utilizadores**
   - Opcional: usar o ficheiro `manage-users.sql` para consultar ou alterar registos manualmente.

---

## ▶️ Executar a aplicação

```bash
npm start
```

Por padrão, o servidor corre em [http://localhost:10000](http://localhost:10000).

---

## 🔑 Credenciais de teste

- **Admin:**  
  - utilizador: `admin`  
  - senha: `12345`  
  - role: `admin`  

- **Convidado:**  
  - utilizador: `convidado`  
  - senha: `12345`  
  - role: `user`  

---

## 📂 Estrutura do projeto

```
Forma-o/
│── public/           # ficheiros frontend (HTML, CSS, JS)
│   └── login.html    # página de login
│── server.js         # backend em Node.js/Express
│── package.json
│── setup-users.sql   # script inicial de configuração da BD
│── manage-users.sql  # script auxiliar para gerir tabela users
│── .env.example      # exemplo de configuração ambiente
│── README.md
```

---

## 🛡️ Notas de segurança

- Não faças commit do `.env` (já está no `.gitignore`).
- Em produção, usa senhas fortes e muda o `JWT_SECRET`.
- O utilizador `convidado` tem apenas leitura e escrita na base, sem permissões administrativas.
