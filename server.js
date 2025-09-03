<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8"/>
  <title>Agendamentos</title>
  <link href="style.css" rel="stylesheet"/>
  <script src="auth.js"></script>
  <style>
    /* estilos iguais aos teus (mantidos) */
  </style>
</head>
<body>
  <div class="header">
    <img alt="Logotipo ULSAS" class="logo" src="/ulsas_logotipo.png"/>
  </div>

  <div class="sidebar">
    <ul>
      <li><a href="index.html">Início</a></li>
      <li><a href="agendamentos.html">Agendamentos</a></li>
      <li><a href="calendario.html">Calendário</a></li>
      <li><a href="salas.html">Salas</a></li>
      <li><a href="admin.html">Administração</a></li>
    </ul>
  </div>

  <div class="main-content">
    <h1>Agendamentos</h1>
    <a class="botao-novo" href="#" onclick="abrirModal()">+ Novo Agendamento</a>

    <h2>Agendamentos da Semana</h2>
    <label for="filtroSala"><strong>Filtrar por Sala:</strong></label>
    <select id="filtroSala" onchange="mostrarAgendamentosSemana()">
      <option value="todas">Ver Todas</option>
      <!-- opções iguais às tuas -->
    </select>

    <table id="tabela-semanal">
      <thead>
        <tr>
          <th>Data</th>
          <th>Hora Início</th>
          <th>Hora Fim</th>
          <th>Sala</th>
          <th>Evento</th>
          <th>Participantes</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>

  <!-- Modal Novo Agendamento -->
  <div class="modal" id="modalAgendamento">
    <div class="modal-content">
      <span class="fechar" onclick="fecharModal()">×</span>
      <h2>Novo Agendamento</h2>
      <form id="agendamento-form">
        <!-- todos os fieldsets iguais aos teus -->
        <fieldset>
          <legend><strong>Observações</strong></legend>
          <textarea id="observacoes" placeholder="Escreva aqui.." rows="4"></textarea>
        </fieldset>

        <button class="botao-novo" type="submit">Submeter</button>
      </form>
    </div>
  </div>

  <!-- Popup de sucesso -->
  <div id="successPopup" class="popup">
    <div class="popup-content">
      <p>O seu pedido foi submetido com sucesso<br>
      e será validado por e-mail em breve.</p>
      <button onclick="fecharPopup()">OK</button>
    </div>
  </div>

  <script>
    function mostrarAgendamentosSemana(agendamentos = []) {
      const tabela = document.getElementById("tabela-semanal").querySelector("tbody");
      tabela.innerHTML = "";
      agendamentos.forEach(ag => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
          <td>${ag.data}</td>
          <td>${ag.horaInicio}</td>
          <td>${ag.horaFim}</td>
          <td>${ag.sala}</td>
          <td>${ag.evento || ag.nomeEvento || ""}</td>
          <td>${ag.participantes}</td>
        `;
        tabela.appendChild(linha);
      });
    }

    function abrirModal() {
      document.getElementById("modalAgendamento").style.display = "block";
    }

    function fecharModal() {
      document.getElementById("modalAgendamento").style.display = "none";
    }

    function fecharPopup() {
      document.getElementById("successPopup").style.display = "none";
    }

    document.addEventListener("DOMContentLoaded", () => {
      const form = document.getElementById("agendamento-form");
      const popup = document.getElementById("successPopup");

      if (form) {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();

          // recolher checkboxes selecionados
          const recursosSelecionados = Array.from(
            document.querySelectorAll('input[name="recursos"]:checked')
          ).map(el => el.value);

          const pedido = {
            nome: document.getElementById("nomeReq").value,
            numMec: document.getElementById("numMec").value,
            servico: document.getElementById("servicoReq").value,
            email: document.getElementById("emailReq").value,
            contacto: document.getElementById("contactoReq").value,
            data: document.getElementById("data").value,
            horaInicio: document.getElementById("horaInicio").value,
            horaFim: document.getElementById("horaFim").value,
            sala: document.getElementById("sala").value,
            tipoEvento: document.getElementById("tipoEvento").value,
            nomeEvento: document.getElementById("nomeEvento").value,
            participantes: document.getElementById("participantes").value,
            observacoes: document.getElementById("observacoes").value,
            recursos: recursosSelecionados
          };

          try {
            const resp = await fetch("https://teu-servidor.onrender.com/api/agendamentos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(pedido)
            });

            if (!resp.ok) throw new Error("Erro ao enviar");

            fecharModal();
            popup.style.display = "flex";
            form.reset();
          } catch (err) {
            alert("Erro ao submeter agendamento: " + err.message);
          }
        });
      }
    });
  </script>
</body>
</html>


