// Inicializa Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDI5-NlhqEInMh4VYEg2zBjwWn8fmmBhjQ",
  authDomain: "agendamentos-348f3.firebaseapp.com",
  projectId: "agendamentos-348f3",
  storageBucket: "agendamentos-348f3.firebasestorage.app",
  messagingSenderId: "691316969145",
  appId: "1:691316969145:web:eff04404e65e384c70d568"
};
firebase.initializeApp(firebaseConfig);

// Elementos do formulário
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const errorMsg = document.getElementById('errorMsg');

// Evento submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    if (!email || !senha) {
        errorMsg.textContent = "Preencha todos os campos!";
        return;
    }

    try {
        // Login com Firebase Auth
        await firebase.auth().signInWithEmailAndPassword(email, senha);

        // Redireciona para a página principal
        window.location.href = "recepcao.html";

    } catch (err) {
        console.error(err);
        errorMsg.textContent = "Erro no login: " + err.message;
    }
});
