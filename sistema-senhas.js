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
 * Adiciona uma senha à fila de atendimento
 * @param {string} senha - Senha a ser adicionada
 * @param {boolean} preferencial - Indica se é preferencial
 */
function adicionarAFila(senha, preferencial) {
    if (preferencial) {
        // Senhas preferenciais vão para o início da fila
        filaSenhas.unshift(senha);
    } else {
        // Senhas normais vão para o final
        filaSenhas.push(senha);
    }
    
    atualizarInterface();
}

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