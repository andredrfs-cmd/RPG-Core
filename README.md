# RPG-Core

Protótipo de um RPG 2D multiplayer para navegador, com Node.js, WebSocket e HTML5 Canvas. O servidor é autoritativo: o cliente envia intenções de movimento e recebe o estado válido do mundo.

## Estado atual

- múltiplos jogadores simultâneos;
- nomes validados no servidor, sem banco de dados;
- mundo de 30x22 blocos de 40x40 pixels;
- câmera seguindo o jogador local;
- células registradas: grama, água, mar profundo, pedra e debug;
- grama caminhável e borda de água bloqueada;
- mar profundo preparado como célula bloqueada;
- pedra preparada como célula caminhável;
- servidor autoritativo para movimento e colisão;
- regras, sistemas e entidade de jogador separados no servidor;
- cliente dividido em rede, input, câmera, mundo e renderização;
- execução local e no GitHub Codespaces.

## Organização do código

```text
server/
├── server.js                 # ponto de entrada e loop do jogo
├── config/                   # valores padrão do servidor e do mundo
├── cells/                    # definições e registro das células do mundo
├── entities/                 # estado das entidades do jogo
├── rules/                    # regras reutilizáveis por domínio
├── systems/                  # coordenação das regras
├── network/                  # WebSocket e mensagens
└── web/                      # servidor de arquivos do cliente

client/
├── index.html                # estrutura da página
├── styles.css                # aparência da página
└── js/
    ├── main.js               # inicialização e coordenação
    ├── network.js            # conexão WebSocket
    ├── input.js              # teclado e envio de input
    ├── camera.js             # câmera do jogador local
    ├── worldRenderer.js      # desenho dos blocos
    └── renderer.js           # desenho do mundo e entidades
```

## Células atuais

| ID | Nome | Caminhável | Cor |
|---|---|---:|---|
| `grass` | Grama | Sim | Verde |
| `water` | Água | Não | Azul |
| `deep_water` | Mar profundo | Não | Azul escuro |
| `stone` | Pedra | Sim | Cinza |
| `debug` | Debug | Não | Magenta |

As células de mar profundo e pedra já estão registradas para a próxima etapa de geração do mundo. Por enquanto, o gerador visual ainda usa grama no interior e água na borda.

## Executar localmente

Você precisa ter o [Node.js](https://nodejs.org/) instalado.

```bash
cd server
npm install
npm start
```

Depois abra `http://localhost:8080`. Informe um nome e abra o endereço em duas abas para testar o multiplayer.

## Roadmap

- [ ] geração do mundo usando o registro de células;
- [ ] interpolação de movimento;
- [ ] sprites e animações;
- [ ] controles touch;
- [ ] itens e inventário;
- [ ] mobs e NPCs;
- [ ] geração procedural e chunks;
- [ ] organização da configuração compartilhada;
- [ ] testes automatizados;
- [ ] sistema de mods/datapacks.

## Aviso

O estado dos jogadores fica apenas na memória e é perdido quando o servidor reinicia. Ainda não há autenticação, banco de dados ou sistema de mods.
