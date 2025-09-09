// scripts.js
const API_BASE = "https://forma-o.onrender.com";

let agendamentos = [];

// =========================
//  Lógica Comum
// =========================

function mostrarToast(msg, erro = false) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.className = "toast mostrar" + (erro ? " erro" : "");
    setTimeout(() => toast.className = "toast", 4000);
}

function abrirModal() {
    const modal = document.getElementById("modalAgendamento");
    if (modal) modal.style.display = "block";
}

function fecharModal() {
    const modal = document.getElementById("modalAgendamento");
    if (modal) modal.style.display = "none";
}

// ===================================
//  Lógica Específica da Página de Agendamentos
// ===================================
function setupAgendamentosPage() {
    const form = document.getElementById("agendamento-form");
    if (form) {
        form.addEventListener("submit", submeterAgendamento);
    }
    const salaFiltro = document.getElementById("filtroSala");
    if (salaFiltro) {
        salaFiltro.addEventListener("change", mostrarAgendamentosSemana);
    }
    const dataInput = document.getElementById("data");
    const horaInicioInput = document.getElementById("horaInicio");
    const horaFimInput = document.getElementById("horaFim");
    if (dataInput && horaInicioInput && horaFimInput) {
        dataInput.addEventListener("change", atualizarSalasDisponiveis);
        horaInicioInput.addEventListener("change", atualizarSalasDisponiveis);
        horaFimInput.addEventListener("change", atualizarSalasDisponiveis);
    }

    mostrarAgendamentosSemana();
}

async function atualizarSalasDisponiveis() {
    const select = document.getElementById("sala");
    if (!select) return;

    const data = document.getElementById("data")?.value;
    const inicio = document.getElementById("horaInicio")?.value;
    const fim = document.getElementById("horaFim")?.value;
    if (!data || !inicio || !fim) return;

    try {
        const token = localStorage.getItem("token");
        const resp = await fetch(`${API_BASE}/api/agendamentos`, {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!resp.ok) throw new Error("Erro ao carregar agendamentos");

        const agendamentosExistentes = await resp.json();

        const inicioSel = new Date(`${data}T${inicio}`);
        const fimSel = new Date(`${data}T${fim}`);
        const ocupadas = new Set();

        agendamentosExistentes.forEach(ev => {
            const inicioEv = new Date(ev.data_hora_inicio);
            const fimEv = new Date(ev.data_hora_fim);
            if (ev.data_hora_inicio && ev.data_hora_inicio.startsWith(data) && fimSel > inicioEv && inicioSel < fimEv) {
                ocupadas.add(ev.sala);
            }
        });

        const salas = [
            "HGO - Sala Almada", "HGO - Sala Garcia de Orta", "HGO - Sala Tejo",
            "HGO - Sala Almada + Garcia de Orta", "CF Sobreda - Auditório Dr. Luís Amaro",
            "CF Sobreda - Sala Sado", "CF Sobreda - Sala Tejo", "CF Amora - Sala Amora"
        ];

        select.innerHTML = '<option value="">-- Selecione --</option>';
        salas.forEach(s => {
            if (!ocupadas.has(s)) {
                const option = document.createElement("option");
                option.value = s;
                option.textContent = s;
                select.appendChild(option);
            }
        });

    } catch (err) {
        console.error("Erro ao atualizar salas:", err);
    }
}

async function mostrarAgendamentosSemana() {
    const tabela = document.querySelector("#tabela-semanal tbody");
    if (!tabela) return;

    try {
        const token = localStorage.getItem("token");
        const resp = await fetch(`${API_BASE}/api/agendamentos`, {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!resp.ok) throw new Error("Erro ao carregar agendamentos");

        const agendamentos = await resp.json();
        const hoje = new Date();
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - (hoje.getDay() === 0 ? 6 : hoje.getDay() - 1));
        inicioSemana.setHours(0, 0, 0, 0);

        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        fimSemana.setHours(23, 59, 59, 999);

        const salaSelecionada = document.getElementById("filtroSala")?.value || "todas";

        const eventos = agendamentos.filter(ev => {
            const inicio = new Date(ev.data_hora_inicio);
            return (
                inicio >= inicioSemana &&
                inicio <= fimSemana &&
                (salaSelecionada === "todas" || ev.sala === salaSelecionada)
            );
        });

        tabela.innerHTML = "";
        eventos.forEach(ev => {
            const inicio = new Date(ev.data_hora_inicio);
            const fim = new Date(ev.data_hora_fim);
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${inicio.toLocaleDateString("pt-PT")}</td>
                <td>${inicio.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                <td>${fim.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                <td>${ev.sala}</td>
                <td>${ev.nome_evento}</td>
                <td>${ev.participantes}</td>
            `;
            tabela.appendChild(tr);
        });
    } catch (err) {
        console.error("Erro ao mostrar agendamentos semanais:", err);
    }
}

async function submeterAgendamento(e) {
    e.preventDefault();
    const form = document.getElementById("agendamento-form");
    const formData = new FormData(form);
    const dados = {
        nome_requerente: formData.get("nome_requerente"),
        num_mecanografico: formData.get("num_mecanografico"),
        servico: formData.get("servico"),
        email: formData.get("email"),
        contacto: formData.get("contacto"),
        data: formData.get("data"),
        hora_inicio: formData.get("hora_inicio"),
        hora_fim: formData.get("hora_fim"),
        sala: formData.get("sala"),
        tipo_evento: formData.get("tipo_evento"),
        nome_evento: formData.get("nome_evento"),
        participantes: formData.get("participantes"),
        observacoes: formData.get("observacoes"),
        recursos: formData.getAll("recursos")
    };

    try {
        const token = localStorage.getItem("token");
        const resposta = await fetch(`${API_BASE}/api/agendamentos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(dados)
        });

        if (resposta.ok) {
            mostrarToast("Agendamento submetido com sucesso!");
            form.reset();
            fecharModal();
            mostrarAgendamentosSemana();
        } else {
            const erro = await resposta.json();
            mostrarToast("Erro: " + (erro.message || "Não foi possível gravar."), true);
        }
    } catch (err) {
        console.error("Erro ao submeter agendamento:", err);
        mostrarToast("Erro ao submeter agendamento. Verifique a ligação ao servidor.", true);
    }
}

// ===================================
//  Lógica Específica da Página de Admin
// ===================================
let agendamentoIndexParaPresencas = null;

function abrirModalPresencas(index) {
    const agendamento = agendamentos[index];
    document.getElementById("horasEfetivas").value = agendamento.extendedProps?.horasEfetivas || "";
    document.getElementById("participantesEfetivos").value = agendamento.extendedProps?.participantesEfetivos || "";
    agendamentoIndexParaPresencas = index;
    document.getElementById("modal-presencas").style.display = "block";
}

function fecharModalPresencas() {
    document.getElementById("modal-presencas").style.display = "none";
}

async function guardarPresencas() {
    if (agendamentoIndexParaPresencas === null) return;
    const agendamento = agendamentos[agendamentoIndexParaPresencas];
    const horas = document.getElementById("horasEfetivas").value;
    const participantes = document.getElementById("participantesEfetivos").value;

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/api/agendamentos/${agendamento.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                horasEfetivas: horas,
                participantesEfetivos: participantes
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar as presenças');
        }

        alert("Presenças guardadas com sucesso!");
        fecharModalPresencas();
        loadAndRender();
    } catch (error) {
        console.error("Erro ao guardar presenças:", error);
        alert("Erro ao guardar presenças.");
    }
}

async function loadAndRender() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Sessão expirada. Faça login novamente.");
            window.location.href = "/login.html";
            return;
        }

        const resp = await fetch(`${API_BASE}/api/agendamentos`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!resp.ok) {
            throw new Error("Erro ao carregar agendamentos");
        }
        agendamentos = await resp.json();
        renderAgendamentos();
        preencherSelectAnos();
    } catch (err) {
        console.error("Erro ao carregar agendamentos:", err);
        alert("Não foi possível carregar os agendamentos. Verifique a ligação ao servidor.");
    }
}

function renderAgendamentos() {
    const filtroDataStr = document.getElementById("filtro-data")?.value;
    const filtroData = filtroDataStr ? new Date(filtroDataStr + "T00:00:00") : null;
    const filtroConcluido = document.getElementById("filtro-concluido")?.value || "todas";

    const aprovacaoDiv = document.getElementById("aprovacao");
    const pendenteDiv = document.getElementById("pendente");
    const emAprovacaoDiv = document.getElementById("em_aprovacao");
    const concluidoDiv = document.getElementById("lista-concluido");

    if (!aprovacaoDiv || !pendenteDiv || !emAprovacaoDiv || !concluidoDiv) return;

    [aprovacaoDiv, pendenteDiv, emAprovacaoDiv, concluidoDiv].forEach(div => div.innerHTML = "");

    agendamentos.forEach((p, index) => {
        const card = document.createElement("div");
        card.className = "agendamento-card";

        const inicio = new Date(p.data_hora_inicio);
        const fim = new Date(p.data_hora_fim);

        if (filtroData && inicio.toISOString().substring(0, 10) !== filtroDataStr) {
            return;
        }

        card.innerHTML = `
            <strong>${p.nome_evento}</strong><br>
            Requerente: ${p.nome}<br>
            Serviço: ${p.servico}<br>
            Data: ${inicio.toLocaleDateString()}<br>
            Hora: ${inicio.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})} - ${fim.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}<br>
            Sala: ${p.sala}<br>
            Nº de participantes: ${p.participantes || "-"}<br>
            Recursos: ${(p.recursos || []).join(", ") || "-"}<br>
            Observações: ${p.observacoes || "-"}<br>
            Estado: ${p.estado}<br>
            ${p.horas_efetivas ? "Horas Efetivas: " + p.horas_efetivas + "<br>" : ""}
            ${p.participantes_efetivos ? "Participantes Efetivos: " + p.participantes_efetivos + "<br>" : ""}
        `;

        if (p.estado === "Pendente") {
            card.innerHTML += `
                <button onclick="atualizarEstado(${p.id}, 'Aprovado', '${p.email}', '${p.nome_evento}')">Aprovar</button>
                <button onclick="atualizarEstado(${p.id}, 'Rejeitado')">Rejeitar</button>
            `;
            pendenteDiv.appendChild(card);
        } else if (p.estado === "Aprovado") {
            card.innerHTML += `
                <button onclick="atualizarEstado(${p.id}, 'Pendente')">Tornar Pendente</button>
                <button onclick="atualizarEstado(${p.id}, 'Rejeitado')">Cancelar</button>
            `;
            aprovacaoDiv.appendChild(card);
        } else if (p.estado === "Reservado") {
             card.innerHTML += `
                <button onclick="atualizarEstado(${p.id}, 'Aprovado', '${p.email}', '${p.nome_evento}')">Aprovar</button>
                <button onclick="atualizarEstado(${p.id}, 'Pendente')">Tornar Pendente</button>
                <button onclick="atualizarEstado(${p.id}, 'Rejeitado')">Rejeitar</button>
            `;
            emAprovacaoDiv.appendChild(card);
        } else if (p.estado === "Concluido") {
            const salaLower = p.sala.toLowerCase();
            const incluir = (filtroConcluido === "todas" ||
                             (filtroConcluido === "hgo" && salaLower.includes("hgo")) ||
                             (filtroConcluido === "sobreda" && salaLower.includes("sobreda")));
            if (incluir) {
                card.innerHTML += `<button onclick="abrirModalPresencas(${index})">Registar Presenças</button>`;
                concluidoDiv.appendChild(card);
            }
        }
    });
}

async function atualizarEstado(id, estado, email, nomeEvento) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/api/agendamentos/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ estado })
        });
        if (!response.ok) {
            throw new Error("Erro ao atualizar o estado do agendamento");
        }
        
        if (estado === "Aprovado" && email && nomeEvento) {
            await enviarEmailConfirmacao(email, nomeEvento);
        }

        await loadAndRender();
        alert(`Agendamento atualizado para "${estado}" com sucesso!`);
    } catch (error) {
        console.error("Erro ao atualizar o agendamento:", error);
        alert("Erro ao atualizar o agendamento.");
    }
}

async function enviarEmailConfirmacao(email, nomeEvento) {
    try {
        await emailjs.send("service_osoiajl", "template_oizzjid", {
            nome: "Utilizador",
            email: email,
            evento: nomeEvento
        });
        const popup = document.getElementById("popupEmailConfirmado");
        if (popup) {
            popup.style.display = "block";
            setTimeout(() => popup.style.display = "none", 5000);
        }
    } catch (error) {
        console.error("Erro ao enviar email:", error);
        alert("Erro ao enviar email de confirmação.");
    }
}

function preencherSelectAnos() {
    const selectAno = document.getElementById("ocupacao-ano");
    if (!selectAno) return;
    const anos = new Set();
    agendamentos.forEach(ag => anos.add(new Date(ag.data_hora_inicio).getFullYear()));
    selectAno.innerHTML = '<option value="">--</option>';
    [...anos].sort().forEach(y => {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        selectAno.appendChild(opt);
    });
}

function calcularTaxaOcupacao() {
    const salaFiltro = document.getElementById("ocupacao-sala")?.value;
    const anoFiltro = parseInt(document.getElementById("ocupacao-ano")?.value);
    const mesInicioFiltro = document.getElementById("mes-inicio")?.value !== "" ? parseInt(document.getElementById("mes-inicio").value) : null;
    const mesFimFiltro = document.getElementById("mes-fim")?.value !== "" ? parseInt(document.getElementById("mes-fim").value) : null;
    const diaFiltro = document.getElementById("ocupacao-dia")?.value !== "" ? parseInt(document.getElementById("ocupacao-dia").value) : null;
    const resultadoDiv = document.getElementById("resultado-ocupacao");
    if (!resultadoDiv || !salaFiltro || !anoFiltro) {
        if (resultadoDiv) resultadoDiv.innerHTML = "<p style='color:red;'>Por favor, selecione um ano e sala.</p>";
        return;
    }

    resultadoDiv.innerHTML = "";
    let horasPrevistas = 0;
    let participantesPrevistos = 0;
    let horasEfetivas = 0;
    let participantesEfetivos = 0;

    agendamentos.forEach(ag => {
        const inicio = new Date(ag.data_hora_inicio);
        const fim = new Date(ag.data_hora_fim);

        const dataValida =
            inicio.getFullYear() === anoFiltro &&
            (mesInicioFiltro === null || inicio.getMonth() >= mesInicioFiltro) &&
            (mesFimFiltro === null || inicio.getMonth() <= mesFimFiltro) &&
            (diaFiltro === null || inicio.getDate() === diaFiltro);
        
        if (!dataValida) return;

        const salaLower = (ag.sala || "").toLowerCase();
        const salaValida = 
            salaFiltro === "todas" ||
            ag.sala === salaFiltro ||
            (salaFiltro === "hgo" && salaLower.includes("hgo")) ||
            (salaFiltro === "sobreda" && salaLower.includes("sobreda"));

        if (!salaValida) return;

        const duracaoHoras = (fim - inicio) / (1000 * 60 * 60);

        if (ag.estado === "Aprovado" || ag.estado === "Concluido") {
            horasPrevistas += duracaoHoras;
            participantesPrevistos += parseInt(ag.participantes || 0);
        }
        if (ag.estado === "Concluido") {
            horasEfetivas += parseFloat(ag.horas_efetivas || 0);
            participantesEfetivos += parseInt(ag.participantes_efetivos || 0);
        }
    });

    const horasUteisPorSala = 12;
    let numSalasSelecionadas = 0;
    const salasFiltradas = agendamentos.filter(ag => {
        const salaLower = (ag.sala || "").toLowerCase();
        return salaFiltro === "todas" ||
               ag.sala === salaFiltro ||
               (salaFiltro === "hgo" && salaLower.includes("hgo")) ||
               (salaFiltro === "sobreda" && salaLower.includes("sobreda"));
    });
    
    const salasUnicas = new Set(salasFiltradas.map(ag => ag.sala));
    numSalasSelecionadas = salasUnicas.size > 0 ? salasUnicas.size : 1;

    const totalHorasDisponiveis = horasUteisPorSala * numSalasSelecionadas;
    const taxaHorasTotal = totalHorasDisponiveis ? ((horasPrevistas + horasEfetivas) / totalHorasDisponiveis) * 100 : 0;
    const taxaParticipantesTotal = totalHorasDisponiveis ? ((participantesPrevistos + participantesEfetivos) / (totalHorasDisponiveis * 10)) * 100 : 0;
    
    resultadoDiv.innerHTML = `
        <p><strong>Participantes previstos:</strong> ${participantesPrevistos}</p>
        <p><strong>Participantes efetivos:</strong> ${participantesEfetivos}</p>
        <p><strong>Horas previstas:</strong> ${horasPrevistas.toFixed(2)}</p>
        <p><strong>Horas efetivas:</strong> ${horasEfetivas.toFixed(2)}</p>
        <p><strong>Taxa Ocupação (Horas):</strong> ${taxaHorasTotal.toFixed(1)}%</p>
        <p><strong>Taxa Ocupação (Participantes):</strong> ${taxaParticipantesTotal.toFixed(1)}%</p>
    `;
}

function exportarParaExcel() {
    const resultadoDiv = document.getElementById("resultado-ocupacao");
    if (!resultadoDiv) return;
    const texto = resultadoDiv.innerText;
    const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "taxa_ocupacao.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===================================
//  Configuração de Listeners
// ===================================

document.addEventListener("DOMContentLoaded", () => {
    ensureAuthenticated();
    showLogoutIfAuthenticated();
    
    const isAgendamentosPage = !!document.getElementById("tabela-semanal");
    const isAdminPage = !!document.getElementById("aprovacao");

    if (isAgendamentosPage) {
        setupAgendamentosPage();
    }
    
    if (isAdminPage) {
        if (ensureRole("admin", false)) {
            loadAndRender();
            setupAdminEventListeners();
        } else {
            alert("Acesso restrito a administradores.");
            window.location.href = "/index.html";
        }
    }
});

function setupAdminEventListeners() {
    document.getElementById("filtro-data")?.addEventListener("change", renderAgendamentos);
    document.getElementById("limparFiltroBtn")?.addEventListener("click", () => {
        document.getElementById('filtro-data').value = '';
        renderAgendamentos();
    });
    document.getElementById("filtro-concluido")?.addEventListener("change", renderAgendamentos);
    document.getElementById("calcularOcupacaoBtn")?.addEventListener("click", calcularTaxaOcupacao);
    document.getElementById("exportarExcelBtn")?.addEventListener("click", exportarParaExcel);
    document.getElementById("guardarPresencasBtn")?.addEventListener("click", guardarPresencas);

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(tab).classList.add('active');
            renderAgendamentos();
        });
    });
}