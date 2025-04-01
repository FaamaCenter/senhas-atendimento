let contadorSenhas = {
    financeiro: { normal: 0, preferencial: 0 },
    secretaria: { normal: 0, preferencial: 0 },
    filantropia: { normal: 0, preferencial: 0 }
};

let filasPorSegmento = {
    financeiro: [],
    secretaria: [],
    filantropia: []
};

const painelEmissao = document.querySelector('.painel-emissao');
const painelSenha = document.querySelector('.painel-senha');

// ====== Funções principais ======

function gerarSenha(categoria, preferencial = false) {
    const tipo = preferencial ? 'preferencial' : 'normal';
    contadorSenhas[categoria][tipo]++;
    const numero = contadorSenhas[categoria][tipo];
    const prefixo = preferencial ? 'P' : '';

    switch (categoria) {
        case 'financeiro': return `${prefixo}FIN${numero.toString().padStart(3, '0')}`;
        case 'secretaria': return `${prefixo}S${numero.toString().padStart(3, '0')}`;
        case 'filantropia': return `${prefixo}F${numero.toString().padStart(3, '0')}`;
        default: throw new Error('Categoria inválida');
    }
}

function adicionarAFila(categoria, senha, preferencial) {
    const fila = filasPorSegmento[categoria];

    if (preferencial) {
        const indice = fila.findLastIndex(s => s.startsWith('P')) + 1;
        fila.splice(indice, 0, senha);
    } else {
        fila.push(senha);
    }

    salvarEstadoLocal();
    atualizarInterface();
}

function emitirSenha(categoria, preferencial) {
    const senha = gerarSenha(categoria, preferencial);
    adicionarAFila(categoria, senha, preferencial);
    alert(`Senha emitida: ${senha}`);

    if (painelSenha) {
        painelSenha.innerHTML = `
            <h2>Senha Emitida</h2>
            <div class="senha">${senha}</div>
        `;
    }
}

// ====== Atendimento ======

function chamarProximaSenha(categoria) {
    const fila = filasPorSegmento[categoria];

    if (fila.length === 0) {
        alert(`Não há senhas na fila de ${categoria}`);
        return;
    }

    const senhaAtual = fila.shift();

    localStorage.setItem(`senhaChamadaAtual_${categoria}`, senhaAtual);
    localStorage.setItem(`senhaChamadaData_${categoria}`, Date.now());
    

    exibirSenhaAtual(senhaAtual);

    const audio = new Audio('ding.mp3');
    audio.play();

    salvarEstadoLocal();
    atualizarInterface();
}

function exibirSenhaAtual(senha) {
    console.log(`Senha atual: ${senha}`);
}

// ====== Interface ======

function atualizarInterface() {
    renderizarBotoesEmissao();

    if (document.getElementById('painel-container')) {
        renderizarPainelAtendimentoTodos();
    }
}

function renderizarBotoesEmissao() {
    if (!painelEmissao) return;
    painelEmissao.innerHTML = `
        <h2>Emissão de Senhas</h2>
        <div class="categoria">
            <h3>Financeiro</h3>
            <button onclick="emitirSenha('financeiro', false)">Normal</button>
            <button onclick="emitirSenha('financeiro', true)">Preferencial</button>
        </div>
        <div class="categoria">
            <h3>Secretaria</h3>
            <button onclick="emitirSenha('secretaria', false)">Normal</button>
            <button onclick="emitirSenha('secretaria', true)">Preferencial</button>
        </div>
        <div class="categoria">
            <h3>Filantropia</h3>
            <button onclick="emitirSenha('filantropia', false)">Normal</button>
            <button onclick="emitirSenha('filantropia', true)">Preferencial</button>
        </div>
    `;
}

function renderizarPainelAtendimentoTodos() {
    const container = document.getElementById('painel-container');
    if (!container) return;

    container.innerHTML = ['financeiro', 'secretaria', 'filantropia'].map(categoria => {
        const fila = filasPorSegmento[categoria];
        const senhaChamada = localStorage.getItem(`senhaChamadaAtual_${categoria}`) || '---';

        return `
            <div class="painel-setor">
                <h2>${categoria.toUpperCase()}</h2>
                <div class="senha-atual">${senhaChamada}</div>
                <button onclick="chamarProximaSenha('${categoria}')">Chamar Próxima</button>
                <h4>Próximas:</h4>
                <ul>
                    ${fila.slice(0, 5).map(s => `<li>${s}</li>`).join('')}
                </ul>
                <button onclick="resetarSistema()" style="background-color: red; color: white; margin-top: 10px;">
                    Resetar
                </button>
            </div>
        `;
    }).join('');
}

// ====== LocalStorage ======

function salvarEstadoLocal() {
    localStorage.setItem('contadorSenhas', JSON.stringify(contadorSenhas));
    localStorage.setItem('filasPorSegmento', JSON.stringify(filasPorSegmento));
    const hoje = new Date().toISOString().split('T')[0];
    localStorage.setItem('dataUltimaExecucao', hoje);
}

function carregarEstadoLocal() {
    const hoje = new Date().toISOString().split('T')[0];
    const ultimaData = localStorage.getItem('dataUltimaExecucao');

    if (ultimaData !== hoje) {
        localStorage.removeItem('contadorSenhas');
        localStorage.removeItem('filasPorSegmento');
        ['financeiro', 'secretaria', 'filantropia'].forEach(c => {
            localStorage.removeItem(`senhaChamadaAtual_${c}`);
        });
        localStorage.setItem('dataUltimaExecucao', hoje);
        return;
    }

    const contador = localStorage.getItem('contadorSenhas');
    const filas = localStorage.getItem('filasPorSegmento');

    if (contador) contadorSenhas = JSON.parse(contador);
    if (filas) filasPorSegmento = JSON.parse(filas);
}

// ====== Reset Manual ======

function resetarSistema() {
    if (confirm('Tem certeza que deseja resetar tudo?')) {
        contadorSenhas = {
            financeiro: { normal: 0, preferencial: 0 },
            secretaria: { normal: 0, preferencial: 0 },
            filantropia: { normal: 0, preferencial: 0 }
        };
        filasPorSegmento = {
            financeiro: [],
            secretaria: [],
            filantropia: []
        };
        localStorage.clear();
        atualizarInterface();
        alert('Sistema resetado.');
    }
}

// ====== Sincronização entre abas ======

window.addEventListener('storage', function (event) {
    if (
        ['contadorSenhas', 'filasPorSegmento',
         'senhaChamadaAtual_financeiro',
         'senhaChamadaAtual_secretaria',
         'senhaChamadaAtual_filantropia'].includes(event.key)
    ) {
        carregarEstadoLocal();
        atualizarInterface();
    }
});

// ====== Inicialização ======

document.addEventListener('DOMContentLoaded', () => {
    carregarEstadoLocal();
    atualizarInterface();
});
