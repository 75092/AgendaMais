// =========================
//  Autenticação
// =========================
try {
  ensureAuthenticated();
  showLogoutIfAuthenticated();
} catch (e) {
  console.warn("auth.js não encontrado ou não inicializado.");
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html"; // ou página de login
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
//  Popup Sucesso
// =========================
function fecharPopup() {
  document.getElementById("successPopup").style.display = "none";
  window.location.href = "agendamentos.html";
}

// =========================
//  Submissão para API
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

  // Submissão API
  const formAPI = document.getElementById("agendamento-form");
  if (formAPI) {
    formAPI.addEventListener("submit", async function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const dados = Object.fromEntries(formData.entries());
      dados.recursos = formData.getAll("recursos");

      try {
        const token = localStorage.getItem("token");
        const resposta = await fetch("/api/agendamentos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify(dados)
        });
        if (resposta.ok) {
          const popup = document.getElementById("successPopup");
          if (popup) popup.style.display = "flex";
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

