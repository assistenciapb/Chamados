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
const nomeChamado = document.getElementById('nomeChamado');
const motivoChamado = document.getElementById('motivoChamado');
const btnLogout = document.getElementById('btnLogout');

let receberChamadosAtivo = false;

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
    btnReceberChamados.textContent = receberChamadosAtivo ? "Recebendo Chamados" : "Receber Chamados";
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

      // Atualiza chamado na tela
      nomeChamado.textContent = data.nome;
      motivoChamado.textContent = data.motivo;

      // Sempre toca o chamado (mesmo que seja o mesmo idAtendimento)
      const utterance = new SpeechSynthesisUtterance(`Atendimento: ${data.nome}`);
      window.speechSynthesis.speak(utterance);
  });
