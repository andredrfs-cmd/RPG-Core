# RPG-Core

Protótipo de um RPG 2D multiplayer para navegador, com Node.js, WebSocket e HTML5 Canvas. O servidor é autoritativo: o cliente envia intenções de movimento e recebe o estado válido do mundo.

## Estado atual

- múltiplos jogadores simultâneos;
- nomes validados no servidor, sem banco de dados;
- viewport quadrado de 20x20 células renderizadas em 32x32 pixels (640x640);
- célula lógica configurada em 16 unidades, separada do tamanho visual;
- câmera seguindo o jogador local;
- células registradas: grama, água, mar profundo, pedra e debug;
- grama caminhável e borda de água bloqueada;
- servidor autoritativo para movimento e colisão;
- cliente dividido em rede, input, câmera, mundo, renderização e interface lateral;
- execução local e no GitHub Codespaces.

## Configuração visual e lógica

```text
logicalCellSize: 16       # unidade lógica futura do mundo
renderedTileSize: 32      # tamanho visual de uma célula no Canvas
viewport: 20x20           # 640x640 pixels
```

A configuração está em `server/config/gameConfig.js` e é enviada junto com o estado inicial do mundo. O cliente usa o valor recebido para renderização.

## Executar localmente

Você precisa ter o [Node.js](https://nodejs.org/) instalado.

```bash
cd server
npm install
npm start
```

Depois abra `http://localhost:8080`. Informe um nome e abra o endereço em duas abas para testar o multiplayer.

## Roadmap

- [ ] formalização de coordenadas world/layer/region/chunk/cell;
- [ ] geração procedural e chunks;
- [ ] inventário e interface funcional;
- [ ] interpolação de movimento;
- [ ] sprites e animações;
- [ ] controles touch;
- [ ] mobs e NPCs;
- [ ] testes automatizados;
- [ ] sistema de mods/datapacks.
