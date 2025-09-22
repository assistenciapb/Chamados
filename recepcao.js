// =======================
// Configuração Firebase
// =======================
const firebaseConfig = {
    apiKey: "AIzaSyDI5-NlhqEInMh4VYEg2zBjwWn8fmmBhjQ",
    authDomain: "agendamentos-348f3.firebaseapp.com",
    projectId: "agendamentos-348f3",
    storageBucket: "agendamentos-348f3.firebasestorage.app",
    messagingSenderId: "691316969145",
    appId: "1:691316969145:web:eff04404e65e384c70d568"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// =======================
// Elementos do DOM
// =======================
const btnReceberChamados = document.getElementById('btnReceberChamados');
const statusRecebimento = document.getElementById('statusRecebimento');
const nomeChamado = document.getElementById('nomeChamado');
const motivoChamado = document.getElementById('motivoChamado');
const btnAtendente = document.getElementById('btnAtendente');
const btnLogout = document.getElementById('btnLogout'); // Novo botão logout

let receberChamadosAtivo = false;
let ultimoChamadoId = null;

// =======================
// Navegar para página do atendente
// =======================
btnAtendente.addEventListener('click', () => {
    window.location.href = "atendente.html";
});

// =======================
// Logout
// =======================
btnLogout.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        window.location.href = "index.html"; // Redireciona para login
    }).catch((error) => {
        alert("Erro ao sair: " + error.message);
    });
});

// =======================
// Ativar/desativar recebimento
// =======================
btnReceberChamados.addEventListener('click', () => {
    receberChamadosAtivo = !receberChamadosAtivo;
    btnReceberChamados.classList.toggle('active', receberChamadosAtivo);
    statusRecebimento.textContent = receberChamadosAtivo ? "Ativo" : "Desativado";
});

// =======================
// Listener do chamado atual
// =======================
db.collection('chamados_controle').doc('chamado_atual')
  .onSnapshot((doc) => {
      if(!receberChamadosAtivo) return; // só toca quando ativo
      if(!doc.exists) return;

      const data = doc.data();
      if(!data.idAtendimento) return;

      // Atualiza chamado na tela (permite repetir o mesmo atendimento)
      ultimoChamadoId = data.idAtendimento;
      nomeChamado.textContent = data.nome;
      motivoChamado.textContent = data.motivo;

      // Chamado sonoro
      const utterance = new SpeechSynthesisUtterance(`Atendimento: ${data.nome}`);
      window.speechSynthesis.speak(utterance);
  });
