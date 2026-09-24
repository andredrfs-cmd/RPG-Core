# RPG-Core

Protótipo de um RPG 2D multiplayer para navegador. O projeto usa Node.js, WebSocket e HTML5 Canvas, com o servidor responsável por calcular as posições dos jogadores.

## Estado atual

A primeira versão possui:

- servidor Node.js com WebSocket;
- múltiplos jogadores simultâneos;
- servidor autoritativo para movimento;
- loop de jogo a 20 ticks por segundo;
- movimento com WASD e setas;
- movimento diagonal normalizado;
- mundo inicial de 20x15 blocos, com blocos de 40x40 pixels;
- borda de água e área interna de grama;
- bloco de debug definido para áreas fora do mapa;
- identificação visual do jogador local;
- cliente servido pelo próprio servidor Node.js;
- tela de entrada para escolher o nome do jogador;
- validação de nomes no servidor;
- nomes duplicados bloqueados sem usar banco de dados;
- configuração adequada para execução local e no GitHub Codespaces.

Neste momento, a água é apenas visual. A colisão com a água será implementada na próxima etapa. A movimentação continua limitada ao retângulo do mundo, como antes.

## Estrutura

```text
RPG-Core/
├── client/
│   └── index.html
├── server/
│   ├── .gitignore
│   ├── package.json
│   └── server.js
└── README.md
```

## Executar localmente

Você precisa ter o [Node.js](https://nodejs.org/) instalado.

```bash
cd server
npm install
npm start
```

Depois abra no navegador:

```text
http://localhost:8080
```

Ao conectar, informe um nome. O nome sugerido será o ID gerado pelo servidor, por exemplo `player_1`. Abra o endereço em duas abas para testar dois jogadores.

## Executar no GitHub Codespaces

1. Abra o repositório no GitHub.
2. Selecione **Code → Codespaces → Create codespace on main**.
3. No terminal do Codespace, execute:

```bash
cd server
npm install
npm start
```

4. Abra a aba **Ports**.
5. Localize a porta `8080` e abra o endereço encaminhado.
6. Para testar com outra pessoa, torne a porta pública apenas durante o teste.

O cliente escolhe automaticamente `ws://` localmente e `wss://` quando a página é aberta com HTTPS. O servidor também usa `process.env.PORT`, permitindo que ambientes de hospedagem escolham a porta automaticamente.

## Blocos atuais

| Bloco | Aparência | Regra atual |
|---|---|---|
| Grama | verde | área interna do mapa |
| Água | azul | borda do mapa; ainda sem colisão |
| Debug | magenta | áreas fora do mapa, usadas apenas como fallback visual |

Como o canvas continua exatamente com 800x600 pixels e o mundo possui 20x15 blocos de 40 pixels, toda a tela é preenchida pelo mapa. Por isso, o bloco de debug não deve aparecer normalmente.

## Regras de nome

- entre 3 e 16 caracteres;
- letras, números, espaços, hífen e sublinhado;
- espaços repetidos são normalizados;
- nomes são comparados sem diferenciar maiúsculas de minúsculas;
- dois jogadores não podem usar o mesmo nome simultaneamente.

## Roadmap

- [ ] colisão com água;
- [ ] câmera seguindo o jogador local;
- [ ] mapa maior que a tela;
- [ ] interpolação de movimento no cliente;
- [ ] sprites e animações por direção;
- [ ] controles touch para mobile;
- [ ] nomes persistentes com autenticação ou banco de dados, se necessário;
- [ ] salas e mapas separados;
- [ ] testes automatizados.

## Aviso

Este é um ambiente de protótipo. O estado dos jogadores fica apenas na memória e é perdido quando o servidor é reiniciado. Ainda não há autenticação, banco de dados ou proteção contra clientes maliciosos.
