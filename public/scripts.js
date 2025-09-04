
  // troque pelo domínio real do serviço backend no Render
  const API_BASE = "https://forma-o.onrender.com";

// =========================
//  Autenticação
// =========================
try {
  ensureAuthenticated();
  showLogoutIfAuthenticated();
} catch (e) {
  console.warn("auth.js não encontrado ou não inicializado.");
}

// =========================
//  Toasts Modernos
// =========================
function mostrarToast(msg, erro = false) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className = "toast mostrar" + (erro ? " erro" : "");
  setTimeout(() => toast.className = "toast", 4000);
}

// =========================
//  Modal (agendamentos.html)
// =========================
function abrirModal() {
  const modal = document.getElementById('modalAgendamento');
  if (modal) modal.style.display = 'block';
}
function fecharModal() {
  const modal = document.getElementById('modalAgendamento');
  if (modal) modal.style.display = 'none';
}

// =========================
//  Guardar Agendamento (localStorage)
// =========================
function guardarAgendamento() {
  if (!document.getElementById("form-agendamento")) return; // só corre no agendamentos.html

  const nomeEvento = document.getElementById("nomeEvento").value;
  const data = document.getElementById("data").value;
  const horaInicio = document.getElementById("horaInicio").value;
  const horaFim = document.getElementById("horaFim").value;
  const sala = document.getElementById("sala").value;

  const numMec = document.getElementById("numMec").value;
  const nomeReq = document.getElementById("nomeReq").value;
  const servicoReq = document.getElementById("servicoReq").value;
  const emailReq = document.getElementById("emailReq").value;
  const contactoReq = document.getElementById("contactoReq").value;

  const participantes = document.getElementById("participantes").value;
  const observacoes = document.getElementById("observacoes").value;
  const tipoEvento = document.getElementById("tipoEvento").value;
  const recursos = Array.from(document.querySelectorAll('input[name="recursos"]:checked')).map(e => e.value);

  // Validação
  if (!nomeEvento || !data || !horaInicio || !horaFim || !sala || !nomeReq || !emailReq || !numMec || !servicoReq || !contactoReq) {
    mostrarToast("Preencha todos os campos obrigatórios.", true);
    return;
  }
  if (horaFim <= horaInicio) {
    mostrarToast("A hora de fim deve ser posterior à de início.", true);
    return;
  }

  const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");

  // Verificar conflito
  const conflito = agendamentos.some(a =>
    a.extendedProps?.sala === sala &&
    a.start.startsWith(data) &&
    (
      (horaInicio >= a.start.slice(11, 16) && horaInicio < a.end.slice(11, 16)) ||
      (horaFim > a.start.slice(11, 16) && horaFim <= a.end.slice(11, 16)) ||
      (horaInicio <= a.start.slice(11, 16) && horaFim >= a.end.slice(11, 16))
    )
  );
  if (conflito) {
    mostrarToast("Já existe um agendamento para esta sala nesse horário.", true);
    return;
  }

  // Gravar
  agendamentos.push({
    title: tipoEvento + " - " + nomeEvento + " - " + sala,
    start: `${data}T${horaInicio}`,
    end: `${data}T${horaFim}`,
    extendedProps: {
      sala, participantes, observacoes, status: "em_aprovacao",
      numMec, nomeReq, servicoReq, emailReq, contactoReq, recursos
    }
  });
  localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

  mostrarToast("Agendamento submetido com sucesso!");
  document.getElementById("form-agendamento").reset();
  fecharModal();
  mostrarAgendamentosSemana();
}

// =========================
//  Atualizar Salas (localStorage)
// =========================
function atualizarSalasDisponiveis() {
  if (!document.getElementById("sala")) return;

  const data = document.getElementById("data").value;
  const inicio = document.getElementById("horaInicio").value;
  const fim = document.getElementById("horaFim").value;
  if (!data || !inicio || !fim) return;

  const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
  const salas = [
    "HGO - Sala Almada",
    "HGO - Sala Garcia de Orta",
    "HGO - Sala Tejo",
    "HGO - Sala Almada + Garcia de Orta",
    "CF Sobreda - Auditório Dr. Luís Amaro",
    "CF Sobreda - Sala Sado",
    "CF Sobreda - Sala Tejo",
    "CF Amora - Sala Amora"
  ];
  const ocupadas = new Set();

  const inicioSel = new Date(`${data}T${inicio}`);
  const fimSel = new Date(`${data}T${fim}`);

  agendamentos.forEach(ev => {
    const inicioEv = new Date(ev.start);
    const fimEv = new Date(ev.end);
    if (ev.start.startsWith(data) && fimSel > inicioEv && inicioSel < fimEv) {
      ocupadas.add(ev.extendedProps?.sala);
    }
  });

  const select = document.getElementById("sala");
  select.innerHTML = '<option value="">-- Selecione --</option>';
  salas.forEach(s => {
    if (!ocupadas.has(s)) {
      select.innerHTML += `<option>${s}</option>`;
    }
  });
}

// =========================
//  Mostrar agendamentos semanais (localStorage)
// =========================
function mostrarAgendamentosSemana() {
  const tabela = document.querySelector("#tabela-semanal tbody");
  if (!tabela) return; // só existe em agendamentos.html

  const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");

  const hoje = new Date();
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - (hoje.getDay() === 0 ? 6 : hoje.getDay() - 1));
  inicioSemana.setHours(0, 0, 0, 0);
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  fimSemana.setHours(23, 59, 59, 999);

  const salaSelecionada = document.getElementById("filtroSala")?.value || "todas";
  const eventos = agendamentos.filter(ev => {
    const inicio = new Date(ev.start);
    return inicio >= inicioSemana && inicio <= fimSemana &&
           (salaSelecionada === "todas" || ev.extendedProps?.sala === salaSelecionada);
  });

  tabela.innerHTML = "";
  eventos.forEach(ev => {
    const inicio = new Date(ev.start);
    const fim = new Date(ev.end);
    tabela.innerHTML += `
      <tr>
        <td>${inicio.toLocaleDateString()}</td>
        <td>${inicio.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
        <td>${fim.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
        <td>${ev.extendedProps?.sala || ""}</td>
        <td>${ev.title.split(" - ")[0]}</td>
        <td>${ev.extendedProps?.participantes || ""}</td>
      </tr>`;
  });
}

// =========================
//  Submissão para API (novo-agendamento.html)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  // Se existir tabela, inicializa agendamentos semanais
  if (document.getElementById("tabela-semanal")) {
    mostrarAgendamentosSemana();
    const dataInput = document.getElementById("data");
    if (dataInput) {
      const hoje = new Date();
      hoje.setDate(hoje.getDate() + 1);
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const dia = String(hoje.getDate()).padStart(2, '0');
      dataInput.min = `${ano}-${mes}-${dia}`;
    }
  }

  // Se existir formulário API, ativa submissão
  const formAPI = document.getElementById("agendamento-form");
  if (formAPI) {
    formAPI.addEventListener("submit", async function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const dados = Object.fromEntries(formData.entries());
      dados.recursos = formData.getAll("recursos");

      try {
        const token = localStorage.getItem("token");
        const resposta = await fetch(`${API_BASE}/api/agendamentos`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify(dados)
        });
        if (resposta.ok) {
          mostrarToast("Agendamento submetido com sucesso!");
          setTimeout(()=> window.location.href = "agendamentos.html", 1500);
        } else {
          const erro = await resposta.json();
          mostrarToast("Erro: " + (erro.message || "Não foi possível gravar."), true);
        }
      } catch (err) {
        mostrarToast("Erro de ligação ao servidor.", true);
      }
    });
  }
});

function calcularTaxaOcupacao() {
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    let participantesPrevistos = 0;
    let participantesEfetivos = 0;
    let horasPrevistas = 0;
    let horasEfetivas = 0;

    agendamentos.forEach(ev => {
        const inicio = new Date(ev.start);
        const fim = new Date(ev.end);
        const duracaoHoras = (fim - inicio) / (1000 * 60 * 60);
        const participantes = parseInt(ev.extendedProps?.participantes || "0");

        if (ev.extendedProps?.status === "aprovado") {
            participantesPrevistos += participantes;
            horasPrevistas += duracaoHoras;
        }
        if (ev.extendedProps?.status === "concluido") {
            participantesEfetivos += participantes;
            horasEfetivas += duracaoHoras;
        }
    });

    const totalHoras = horasPrevistas + horasEfetivas;
    const totalParticipantes = participantesPrevistos + participantesEfetivos;
    const salas = new Set(agendamentos.map(ev => ev.extendedProps?.sala));
    const totalSalas = salas.size || 1;
    const taxaHoras = ((totalHoras / (12 * totalSalas)) * 100).toFixed(2);
    const taxaParticipantes = totalParticipantes;

    const resultado = `Participantes previstos: ${participantesPrevistos}
Participantes efetivos: ${participantesEfetivos}
Horas previstas: ${horasPrevistas.toFixed(2)}
Horas efetivas: ${horasEfetivas.toFixed(2)}

Taxa Ocupação (Horas): ${taxaHoras}%
Taxa Ocupação (Participantes): ${taxaParticipantes}`;
    document.getElementById("resultado-ocupacao").innerText = resultado;
}

function exportarParaExcel() {
    const texto = document.getElementById("resultado-ocupacao").innerText;
    const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "taxa_ocupacao.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
