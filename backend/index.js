const express = require('express');
const cors = require('cors');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

app.use(cors());

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

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.emit('estadoInicial', { contadorSenhas, filasPorSegmento });

  socket.on('emitirSenha', ({ categoria, preferencial }) => {
    const tipo = preferencial ? 'preferencial' : 'normal';
    contadorSenhas[categoria][tipo]++;
    const numero = contadorSenhas[categoria][tipo];
    const prefixo = preferencial ? 'P' : '';
    let senha = '';

    switch (categoria) {
      case 'financeiro': senha = `${prefixo}FIN${numero.toString().padStart(3, '0')}`; break;
      case 'secretaria': senha = `${prefixo}S${numero.toString().padStart(3, '0')}`; break;
      case 'filantropia': senha = `${prefixo}F${numero.toString().padStart(3, '0')}`; break;
    }

    if (preferencial) {
      const idx = filasPorSegmento[categoria].findLastIndex(s => s.startsWith('P')) + 1;
      filasPorSegmento[categoria].splice(idx, 0, senha);
    } else {
      filasPorSegmento[categoria].push(senha);
    }

    io.emit('senhaEmitida', senha);
    io.emit('atualizarFilas', { filasPorSegmento });
  });

  socket.on('chamarProximaSenha', ({ categoria }) => {
    const senhaAtual = filasPorSegmento[categoria].shift() || null;
    if (senhaAtual) {
      io.emit('senhaChamada', { categoria, senhaAtual });
      io.emit('atualizarFilas', { filasPorSegmento });
    }
  });

  socket.on('resetarSistema', () => {
    contadorSenhas = { financeiro: { normal: 0, preferencial: 0 }, secretaria: { normal: 0, preferencial: 0 }, filantropia: { normal: 0, preferencial: 0 } };
    filasPorSegmento = { financeiro: [], secretaria: [], filantropia: [] };
    io.emit('reset');
    io.emit('atualizarFilas', { filasPorSegmento });
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
