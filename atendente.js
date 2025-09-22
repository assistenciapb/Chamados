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
const listaChamados = document.getElementById('listaChamados');
const nomeAtual = document.getElementById('nomeAtual');
const motivoAtual = document.getElementById('motivoAtual');
const btnProximo = document.getElementById('btnProximo');
const btnAnterior = document.getElementById('btnAnterior');
const btnRepetir = document.getElementById('btnRepetir');
const atendenteSelect = document.getElementById('atendenteSelect');

let chamados = [];
let filaFiltrada = [];
let indiceAtual = -1;
let ultimoChamado = null;

// =======================
// Atendentes e motivos
// =======================
const atendentes = [
    { nome: "Pablo", motivos: ["Novo Bolsa Familia","Inclusão","Transferência"] },
    { nome: "Tailandia", motivos: ["SIBEC","Carteira do Idoso"] }
];

// Preencher select de atendente
const optionVazio = document.createElement('option');
optionVazio.value = "";
optionVazio.textContent = "Selecione um atendente (opcional)";
atendenteSelect.appendChild(optionVazio);
atendentes.forEach(a => {
    const option = document.createElement('option');
    option.value = a.nome;
    option.textContent = a.nome;
    atendenteSelect.appendChild(option);
});

// =======================
// Atualiza Firestore com chamado atual
// =======================
function atualizarChamadoFirestore(chamado) {
    db.collection('chamados_controle').doc('chamado_atual')
      .set({
          idAtendimento: chamado.id,
          nome: chamado.nome,
          motivo: chamado.motivo,
          timestamp: new Date().toISOString()
      });
}

// =======================
// Aplicar filtro do atendente
// =======================
function aplicarFiltro() {
    const selecionado = atendenteSelect.value;
    if(!selecionado){
        filaFiltrada = [...chamados];
    } else {
        const atendente = atendentes.find(a => a.nome === selecionado);
        filaFiltrada = chamados.filter(c => atendente.motivos.includes(c.motivo));
    }

    // Salvar estado
    sessionStorage.setItem('filaFiltrada', JSON.stringify(filaFiltrada));
    sessionStorage.setItem('atendenteSelecionado', selecionado);
}

// =======================
// Preencher lista lateral
// =======================
function preencherLista() {
    listaChamados.innerHTML = "";
    filaFiltrada.forEach((c, i) => {
        const li = document.createElement('li');
        li.textContent = `${c.nome} - ${c.motivo}`;
        li.style.cursor = "pointer";

        // Destaca item ativo
        if(ultimoChamado && ultimoChamado.id === c.id) {
            li.classList.add("chamadoAtivo");
        } else {
            li.classList.remove("chamadoAtivo");
        }

        li.addEventListener('click', () => {
            indiceAtual = i;
            chamarAtendimento();
        });

        listaChamados.appendChild(li);
    });
}

// =======================
// Chamar atendimento
// =======================
function chamarAtendimento() {
    if(indiceAtual < 0 || indiceAtual >= filaFiltrada.length) return;
    const atual = filaFiltrada[indiceAtual];
    nomeAtual.textContent = atual.nome;
    motivoAtual.textContent = atual.motivo;
    ultimoChamado = atual;

    atualizarChamadoFirestore(atual);
    preencherLista();
    sessionStorage.setItem('indiceAtual', indiceAtual);
}

// =======================
// Botões de controle
// =======================
btnProximo.addEventListener('click', () => {
    if(filaFiltrada.length === 0) return;
    if(indiceAtual < filaFiltrada.length - 1) {
        indiceAtual++;
        chamarAtendimento();
    } else {
        alert("Último atendimento da lista atingido.");
    }
});

btnAnterior.addEventListener('click', () => {
    if(filaFiltrada.length === 0) return;
    if(indiceAtual > 0) {
        indiceAtual--;
        chamarAtendimento();
    } else {
        alert("Primeiro atendimento da lista atingido.");
    }
});

btnRepetir.addEventListener('click', () => {
    if(!ultimoChamado) return alert("Nenhum chamado foi realizado ainda.");
    atualizarChamadoFirestore(ultimoChamado);
});

// =======================
// Listener do select (filtro)
// =======================
atendenteSelect.addEventListener('change', () => {
    indiceAtual = -1;
    ultimoChamado = null;
    aplicarFiltro();      // aplica filtro com o atendente novo
    preencherLista();     // atualiza a lista imediatamente
    nomeAtual.textContent = "Nenhum usuário";
    motivoAtual.textContent = "";
    sessionStorage.removeItem('indiceAtual');
});

// =======================
// Listener Firestore (em tempo real)
// =======================
db.collection('atendimentos_gerais')
  .orderBy('data')
  .onSnapshot(snapshot => {
      // Atualiza array de atendimentos
      chamados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Aplica filtro usando o valor atual do select
      aplicarFiltro();  

      // Atualiza a lista lateral
      preencherLista();
  });

// =======================
// Restaurar estado da sessão
// =======================
const savedAtendente = sessionStorage.getItem('atendenteSelecionado');
const savedFila = sessionStorage.getItem('filaFiltrada');
const savedIndice = sessionStorage.getItem('indiceAtual');

if(savedAtendente) atendenteSelect.value = savedAtendente;
if(savedFila) filaFiltrada = JSON.parse(savedFila);
if(savedIndice !== null) {
    indiceAtual = parseInt(savedIndice, 10);
    if(indiceAtual >= 0 && indiceAtual < filaFiltrada.length) {
        chamarAtendimento();
    }
}
