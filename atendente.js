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
    { nome: "Pablo", motivos: ["Novo Bolsa Familia","Transferência","Inclusão", "Atualização", "Carteira do Idoso", "ID jovem", "Exclusão", "Folha Resumo", "Informações", "Outros"] },
    { nome: "Tailandia", motivos: ["Novo Bolsa Familia","Transferência","Inclusão", "Atualização", "SIBEC", "Carteira do Idoso", "ID jovem", "Exclusão", "Folha Resumo", "Informações", "Outros"] },
    { nome: "Lissandra", motivos: ["Novo Bolsa Familia","Transferência","Inclusão", "Atualização", "Carteira do Idoso", "ID jovem", "Exclusão", "Folha Resumo", "Informações", "Outros"] },
    { nome: "Ana", motivos: ["Novo Bolsa Familia","Transferência","Inclusão", "Atualização", "Carteira do Idoso", "ID jovem", "Exclusão", "Folha Resumo", "Informações", "Outros"] },
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
// Aplicar filtro do atendente e do dia atual
// =======================
function aplicarFiltro() {
    const selecionado = atendenteSelect.value;
    const hoje = new Date().toDateString();
    let atendimentosHoje = chamados.filter(c => new Date(c.data).toDateString() === hoje);

    if (!selecionado) {
        filaFiltrada = [...atendimentosHoje];
    } else {
        const atendente = atendentes.find(a => a.nome === selecionado);
        filaFiltrada = atendimentosHoje.filter(c => atendente.motivos.includes(c.motivo));
    }

    sessionStorage.setItem('filaFiltrada', JSON.stringify(filaFiltrada));
    sessionStorage.setItem('atendenteSelecionado', selecionado);
}

// =======================
// Preencher lista lateral (com botão "Pronto", sem clique no chamado)
// =======================
function preencherLista() {
    listaChamados.innerHTML = "";
    filaFiltrada.forEach((c, i) => {
        const li = document.createElement('li');
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";

        // Texto do chamado
        const textoChamado = document.createElement('span');
        textoChamado.textContent = `${c.nome} - ${c.motivo}`;
        li.appendChild(textoChamado);

        // Botão "Pronto"
        const btnPronto = document.createElement('button');
        btnPronto.textContent = "Pronto";
        btnPronto.style.marginLeft = "8px";
        btnPronto.style.padding = "4px 8px";
        btnPronto.style.fontSize = "12px";
        btnPronto.style.cursor = "pointer";
        btnPronto.style.border = "none";
        btnPronto.style.borderRadius = "4px";
        btnPronto.style.transition = "0.2s";

        if(c.docsProntos) {
            btnPronto.style.background = "#27ae60";
            btnPronto.style.color = "#fff";
        } else {
            btnPronto.style.background = "#ccc";
            btnPronto.style.color = "#333";

            btnPronto.addEventListener('mouseenter', () => {
                btnPronto.style.background = "#5dade2";
                btnPronto.style.color = "#fff";
            });
            btnPronto.addEventListener('mouseleave', () => {
                btnPronto.style.background = "#ccc";
                btnPronto.style.color = "#333";
            });
        }

        btnPronto.addEventListener('click', (e) => {
            e.stopPropagation();
            db.collection('atendimentos_gerais').doc(c.id)
              .update({ docsProntos: true })
              .then(() => {
                  c.docsProntos = true;
                  btnPronto.style.background = "#27ae60";
                  btnPronto.style.color = "#fff";
                  btnPronto.onmouseenter = null;
                  btnPronto.onmouseleave = null;
              })
              .catch(err => console.error("Erro ao atualizar: " + err.message));
        });

        li.appendChild(btnPronto);

        // Destaca item ativo
        if(ultimoChamado && ultimoChamado.id === c.id) {
            li.classList.add("chamadoAtivo");
        } else {
            li.classList.remove("chamadoAtivo");
        }

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

    let encontrado = false;
    while(indiceAtual < filaFiltrada.length - 1 && !encontrado) {
        indiceAtual++;
        if(filaFiltrada[indiceAtual].docsProntos) {
            encontrado = true;
            chamarAtendimento();
        }
    }

    if(!encontrado) alert("Nenhum atendimento com documentação pronta disponível.");
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
    aplicarFiltro();
    preencherLista();
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
      chamados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      aplicarFiltro();
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
        const atual = filaFiltrada[indiceAtual];
        if(atual) {
            nomeAtual.textContent = atual.nome;
            motivoAtual.textContent = atual.motivo;
            ultimoChamado = atual;
        }
    }
}
