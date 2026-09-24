# RPG-Core

Protótipo de um RPG 2D multiplayer para navegador, com Node.js, WebSocket e HTML5 Canvas. O servidor é autoritativo: o cliente envia intenções de movimento e recebe o estado válido do mundo.

## Estado atual

- viewport quadrado de 20x20 células renderizadas em 32x32 pixels;
- célula lógica configurada em 16 unidades, separada do tamanho visual;
- modelo inicial de localização com `worldId`, `layerId`, `region`, `chunk` e `position`;
- regiões verticais usam `region.y` para superfície, subsolo ou níveis superiores;
- chunks são horizontais e usam somente `chunk.x` e `chunk.z`;
- `position.y` fica reservado para altura local, voo e empilhamento;
- múltiplos jogadores simultâneos;
- servidor autoritativo para movimento e colisão;
- células registradas: grama, água, mar profundo, pedra e debug.

## Modelo de coordenadas

```javascript
{
  worldId: 'overworld',
  layerId: 'surface',
  region: { x: 0, y: 0, z: 0 },
  chunk: { x: 0, z: 0 },
  position: { x: 12, y: 0, z: 8 }
}
```

Convenções:

- `x` e `z` formam o plano horizontal do mundo;
- `region.y` identifica o nível vertical da região;
- `position.y` identifica a altura local da entidade ou célula;
- `chunk` organiza uma área horizontal e não possui `y`;
- `layerId` representa um espaço próprio, como `surface`, `castelo_1` ou `dungeon_1`.

Configuração atual:

```text
1 chunk       = 16x16 células horizontais
1 região      = 16x16 chunks
1 região      = 256x256 células horizontais
```

As funções de coordenadas estão em `server/coordinates/worldCoordinates.js`. A localização já faz parte do estado do jogador, enquanto a movimentação visual antiga continua temporariamente para permitir uma migração segura.

## Executar localmente

```bash
cd server
npm install
npm start
```

Depois abra `http://localhost:8080`.

## Roadmap

- [ ] migrar movimento para `player.location.position`;
- [ ] gerar e armazenar chunks;
- [ ] consultar células reais na colisão;
- [ ] enviar apenas chunks visíveis;
- [ ] inventário e interface funcional;
- [ ] interiores e transições entre layers;
- [ ] voo, subsolo e regras de altura;
- [ ] persistência e sistema de mods/datapacks.
