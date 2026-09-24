# RPG-Core

Protótipo de um RPG 2D multiplayer para navegador. O projeto usa Node.js, WebSocket e HTML5 Canvas, com o servidor responsável por calcular as posições dos jogadores.

## Estado atual

A primeira versão já possui:

- servidor Node.js com WebSocket;
- múltiplos jogadores simultâneos;
- servidor autoritativo para movimento;
- loop de jogo a 20 ticks por segundo;
- movimento com WASD e setas;
- movimento diagonal normalizado;
- limite do mundo de 800x600;
- identificação visual do jogador local;
- cliente servido pelo próprio servidor Node.js;
- configuração adequada para execução local e no GitHub Codespaces.

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

Abra o endereço em duas abas para testar dois jogadores. O diretório `node_modules/` é criado pelo `npm install` e não deve ser enviado ao GitHub.

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

## Variáveis e portas

A porta padrão é `8080`, mas pode ser substituída pelo ambiente:

```bash
PORT=3000 npm start
```

O servidor escuta em `0.0.0.0`, necessário para encaminhamento de portas em ambientes remotos.

## Roadmap

- [ ] interpolação de movimento no cliente;
- [ ] sprites e animações por direção;
- [ ] nomes personalizados;
- [ ] câmera dinâmica;
- [ ] mapas maiores;
- [ ] salas e mapas separados;
- [ ] testes automatizados.

## Aviso

Este é um ambiente de protótipo. O estado dos jogadores fica apenas na memória e é perdido quando o servidor é reiniciado. Ainda não há autenticação, banco de dados ou proteção contra clientes maliciosos.
