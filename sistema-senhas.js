// ============== MODELO DE DADOS ==============
let contadorSenhas = {
    financeiro: { normal: 0, preferencial: 0 },
    secretaria: { normal: 0, preferencial: 0 },
    filantropia: { normal: 0, preferencial: 0 }
};

let filaSenhas = [];

const painelEmissao = document.querySelector('.painel-emissao');
const painelAtendimento = document.querySelector('.painel-atendimento');
const painelSenha = document.querySelector('.painel-senha');

// ============== FUNÇÕES PRINCIPAIS ==============

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

function encontrarIndiceUltimaPreferencial() {
    return filaSenhas.findLastIndex(s => s.startsWith('P'));
}

function adicionarAFila(senha, preferencial) {
    if (preferencial) {
        const indice = encontrarIndiceUltimaPreferencial() + 1;
        filaSenhas.splice(indice, 0, senha);
    } else {
        filaSenhas.push(senha);
    }
    atualizarInterface();
}

// ✅ REMOVE da fila e salva imediatamente o novo estado
function chamarProximaSenha() {
    if (filaSenhas.length === 0) {
        alert('Não há senhas na fila!');
        return;
    }

    const senhaAtual = filaSenhas.shift();
    exibirSenhaAtual(senhaAtual);

    salvarEstadoLocal(); // <<< Aqui é o que garante que a fila atual seja salva
    atualizarInterface();
}


// ============== INTERFACE ==============

function atualizarInterface() {
    renderizarBotoesEmissao();
    renderizarPainelAtendimento();
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

function renderizarPainelAtendimento() {
    if (!painelAtendimento) return;
    painelAtendimento.innerHTML = `
        <h2>Painel de Atendimento</h2>
        <div class="senha-atual">${filaSenhas[0] || '---'}</div>
        <button onclick="chamarProximaSenha()">Chamar Próxima</button>
        <h3>Próximas senhas:</h3>
        <ul>
            ${filaSenhas.slice(1, 6).map(s => `<li>${s}</li>`).join('')}
        </ul>
        <button onclick="resetarSistema()" style="background-color: red; color: white; margin-top: 20px;">
            🔁 Resetar Sistema
        </button>
    `;
}

function exibirSenhaAtual(senha) {
    console.log(`Senha atual: ${senha}`);
}

function emitirSenha(categoria, preferencial) {
    const senha = gerarSenha(categoria, preferencial);
    adicionarAFila(senha, preferencial);
    alert(`Senha emitida: ${senha}`);

    if (painelSenha) {
        painelSenha.innerHTML = `
            <h2>Senha Emitida</h2>
            <div class="senha">${senha}</div>
        `;
    }

    salvarEstadoLocal(); // <<< Aqui também!
}


// ============== LOCAL STORAGE ==============

function salvarEstadoLocal() {
    localStorage.setItem('contadorSenhas', JSON.stringify(contadorSenhas));
    localStorage.setItem('filaSenhas', JSON.stringify(filaSenhas));
    const hoje = new Date().toISOString().split('T')[0];
    localStorage.setItem('dataUltimaExecucao', hoje);
}

function carregarEstadoLocal() {
    const hoje = new Date().toISOString().split('T')[0];
    const ultimaData = localStorage.getItem('dataUltimaExecucao');

    if (ultimaData !== hoje) {
        localStorage.removeItem('filaSenhas');
        localStorage.removeItem('contadorSenhas');
        localStorage.setItem('dataUltimaExecucao', hoje);
        return;
    }

    const contador = localStorage.getItem('contadorSenhas');
    const fila = localStorage.getItem('filaSenhas');

    if (contador) {
        const dados = JSON.parse(contador);
        for (const categoria in dados) {
            if (contadorSenhas[categoria]) {
                contadorSenhas[categoria] = dados[categoria];
            }
        }
    }

    if (fila) {
        filaSenhas = JSON.parse(fila);
    }
}

// ============== RESET MANUAL ==============

function resetarSistema() {
    if (confirm('Tem certeza que deseja resetar a fila e os contadores?')) {
        filaSenhas = [];
        contadorSenhas = {
            financeiro: { normal: 0, preferencial: 0 },
            secretaria: { normal: 0, preferencial: 0 },
            filantropia: { normal: 0, preferencial: 0 }
        };
        localStorage.clear();
        atualizarInterface();
        alert('Sistema resetado com sucesso!');
    }
}

// ============== INICIALIZAÇÃO ==============

document.addEventListener('DOMContentLoaded', () => {
    carregarEstadoLocal();
    atualizarInterface();
});

// ============== SINCRONIZAÇÃO ENTRE ABAS ==============

window.addEventListener('storage', function (event) {
    if (['filaSenhas', 'contadorSenhas'].includes(event.key)) {
        console.log(`[Sync] Atualização recebida de outra aba: ${event.key}`);
        carregarEstadoLocal();
        atualizarInterface();
    }
});
