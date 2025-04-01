// ============== MODELO DE DADOS ==============
// Armazena os contadores de senhas por categoria
const contadorSenhas = {
    financeiro: { normal: 0, preferencial: 0 },
    secretaria: { normal: 0, preferencial: 0 },
    filantropia: { normal: 0, preferencial: 0 }
};

// Array que representa a fila de espera
let filaSenhas = [];

// Elementos da interface
const painelEmissao = document.querySelector('.painel-emissao');
const painelAtendimento = document.querySelector('.painel-atendimento');

// ============== FUNÇÕES PRINCIPAIS ==============

/**
 * Gera uma nova senha com base na categoria e prioridade
 * @param {string} categoria - financeiro/secretaria/filantropia
 * @param {boolean} preferencial - se é preferencial
 * @returns {string} - senha formatada
 */
function gerarSenha(categoria, preferencial = false) {
    // Incrementa o contador apropriado
    const tipo = preferencial ? 'preferencial' : 'normal';
    contadorSenhas[categoria][tipo]++;
    
    const numero = contadorSenhas[categoria][tipo];
    const prefixo = preferencial ? 'P' : '';
    
    // Formata a senha de acordo com a categoria
    switch(categoria) {
        case 'financeiro':
            return `${prefixo}Fin${numero.toString().padStart(3, '0')}`;
        case 'secretaria':
            return `${prefixo}S${numero.toString().padStart(3, '0')}`;
        case 'filantropia':
            return `${prefixo}F${numero.toString().padStart(3, '0')}`;
        default:
            throw new Error('Categoria inválida');
    }
}

/**
 * Adiciona uma senha à fila de atendimento mantendo:
 * - Todas as preferenciais antes das normais
 * - Ordem cronológica entre preferenciais
 * @param {string} senha - Senha a ser adicionada
 * @param {boolean} preferencial - Indica se é preferencial
 */
function adicionarAFila(senha, preferencial) {
    if (preferencial) {
        // Adiciona no final do bloco de preferenciais
        let ultimaPreferencial = filaSenhas.findLastIndex(s => s.startsWith('P'));
        filaSenhas.splice(ultimaPreferencial + 1, 0, senha);
    } else {
        // Senhas normais sempre no final
        filaSenhas.push(senha);
    }
    atualizarInterface();
}
// ============== FUNÇÕES ATUALIZADAS ==============

/**
 * Encontra o índice da última senha preferencial na fila
 * @returns {number} Índice da última preferencial ou -1 se não existir
 */
function encontrarIndiceUltimaPreferencial() {
    for (let i = filaSenhas.length - 1; i >= 0; i--) {
        if (filaSenhas[i].startsWith('P')) {
            return i;
        }
    }
    return -1;
}

/**
 * Versão otimizada da função anterior (para navegadores modernos)
 */
function encontrarIndiceUltimaPreferencial() {
    return filaSenhas.findLastIndex(s => s.startsWith('P'));
}

/**
 * Adiciona uma senha à fila mantendo a ordem correta
 */
function adicionarAFila(senha, preferencial) {
    if (preferencial) {
        const indiceInsercao = encontrarIndiceUltimaPreferencial() + 1;
        filaSenhas.splice(indiceInsercao, 0, senha);
    } else {
        filaSenhas.push(senha);
    }
    atualizarInterface();
}

// ============== EXEMPLO DE USO ==============
// Teste da nova implementação:
filaSenhas = []; // Limpa a fila

adicionarAFila('PF001', true);  // [PF001]
adicionarAFila('S001', false);  // [PF001, S001]
adicionarAFila('PF002', true);  // [PF001, PF002, S001]
adicionarAFila('F001', false);  // [PF001, PF002, S001, F001]
adicionarAFila('PF003', true);  // [PF001, PF002, PF003, S001, F001]

/**
 * Chama a próxima senha da fila
 */
function chamarProximaSenha() {
    if (filaSenhas.length === 0) {
        alert('Não há senhas na fila!');
        return;
    }
    
    const senhaAtual = filaSenhas.shift();
    exibirSenhaAtual(senhaAtual);
    atualizarInterface();
}

// ============== FUNÇÕES DE INTERFACE ==============

/**
 * Atualiza toda a interface do sistema
 */
function atualizarInterface() {
    renderizarBotoesEmissao();
    renderizarPainelAtendimento();
    salvarEstadoLocal(); // Persistência opcional
}

/**
 * Renderiza os botões de emissão de senhas
 */
function renderizarBotoesEmissao() {
    painelEmissao.innerHTML = `
        <h2>Emissão de Senhas</h2>
        <div class="categoria">
            <h3>Financeiro</h3>
            <button onclick="emitirSenha('financeiro', false)">Normal</button>
            <button onclick="emitirSenha('financeiro', true)">Preferencial</button>
        </div>
        <!-- Repetir para outras categorias -->
    `;
}

/**
 * Renderiza o painel de atendimento
 */
function renderizarPainelAtendimento() {
    painelAtendimento.innerHTML = `
        <h2>Painel de Atendimento</h2>
        <div class="senha-atual">${filaSenhas[0] || '---'}</div>
        <button onclick="chamarProximaSenha()">Chamar Próxima</button>
        <h3>Próximas senhas:</h3>
        <ul>
            ${filaSenhas.slice(1, 6).map(senha => `<li>${senha}</li>`).join('')}
        </ul>
    `;
}

// ============== FUNÇÕES AUXILIARES ==============

/**
 * Função para emissão de senha (chamada pelos botões)
 */
function emitirSenha(categoria, preferencial) {
    const senha = gerarSenha(categoria, preferencial);
    adicionarAFila(senha, preferencial);
    alert(`Senha emitida: ${senha}`);
}

/**
 * Persiste o estado no localStorage (opcional)
 */
function salvarEstadoLocal() {
    localStorage.setItem('contadorSenhas', JSON.stringify(contadorSenhas));
    localStorage.setItem('filaSenhas', JSON.stringify(filaSenhas));
}

/**
 * Carrega o estado do localStorage (opcional)
 */
function carregarEstadoLocal() {
    const contador = localStorage.getItem('contadorSenhas');
    const fila = localStorage.getItem('filaSenhas');
    
    if (contador) contadorSenhas = JSON.parse(contador);
    if (fila) filaSenhas = JSON.parse(fila);
}

// Inicializa o sistema
document.addEventListener('DOMContentLoaded', () => {
    carregarEstadoLocal();
    atualizarInterface();
});