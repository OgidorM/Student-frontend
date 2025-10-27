import { useState, useEffect, useRef, useCallback } from 'react';
import './Games.css';

// ==================== CLASSES DO JOGO ====================

// Gerador de Mapas Procedurais usando Autômato Celular com Verificação de Conectividade
class MapGenerator {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  generate() {
    let map;
    let attempts = 0;
    const maxAttempts = 50;

    // Tentar gerar mapa conectado
    do {
      // Inicializar mapa com ruído aleatório
      map = Array(this.height).fill(0).map(() =>
        Array(this.width).fill(0).map(() => Math.random() > 0.45 ? 1 : 0)
      );

      // Aplicar autômato celular para suavizar
      for (let i = 0; i < 4; i++) {
        map = this.smoothMap(map);
      }

      // Garantir bordas
      for (let y = 0; y < this.height; y++) {
        map[y][0] = 1;
        map[y][this.width - 1] = 1;
      }
      for (let x = 0; x < this.width; x++) {
        map[0][x] = 1;
        map[this.height - 1][x] = 1;
      }

      attempts++;
    } while (!this.isMapConnected(map) && attempts < maxAttempts);

    // Se falhou, criar mapa simples conectado
    if (!this.isMapConnected(map)) {
      map = this.createSimpleConnectedMap();
    }

    return map;
  }

  smoothMap(map) {
    const newMap = map.map(row => [...row]);

    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        const wallCount = this.countNeighborWalls(map, x, y);

        if (wallCount > 4) {
          newMap[y][x] = 1;
        } else if (wallCount < 4) {
          newMap[y][x] = 0;
        }
      }
    }

    return newMap;
  }

  countNeighborWalls(map, x, y) {
    let count = 0;
    for (let ny = y - 1; ny <= y + 1; ny++) {
      for (let nx = x - 1; nx <= x + 1; nx++) {
        if (nx === x && ny === y) continue;
        if (map[ny][nx] === 1) count++;
      }
    }
    return count;
  }

  // Verificar se o mapa é totalmente conectado usando Flood Fill (BFS)
  isMapConnected(map) {
    // Encontrar primeiro ponto de chão
    let startX = -1, startY = -1;
    for (let y = 1; y < this.height - 1 && startX === -1; y++) {
      for (let x = 1; x < this.width - 1 && startX === -1; x++) {
        if (map[y][x] === 0) {
          startX = x;
          startY = y;
        }
      }
    }

    if (startX === -1) return false; // Nenhum chão encontrado

    // Flood fill para marcar áreas conectadas
    const visited = Array(this.height).fill(0).map(() => Array(this.width).fill(false));
    const queue = [[startX, startY]];
    visited[startY][startX] = true;
    let floorCount = 0;

    while (queue.length > 0) {
      const [x, y] = queue.shift();
      floorCount++;

      // Verificar vizinhos (4 direções)
      const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height &&
            !visited[ny][nx] && map[ny][nx] === 0) {
          visited[ny][nx] = true;
          queue.push([nx, ny]);
        }
      }
    }

    // Contar total de chão
    let totalFloor = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (map[y][x] === 0) totalFloor++;
      }
    }

    // Verificar se todos os chãos são alcançáveis
    return floorCount >= totalFloor * 0.95; // 95% de conectividade é aceitável
  }

  // Criar mapa simples mas garantidamente conectado
  createSimpleConnectedMap() {
    const map = Array(this.height).fill(0).map(() => Array(this.width).fill(1));

    // Criar corredores conectados
    for (let y = 2; y < this.height - 2; y += 3) {
      for (let x = 2; x < this.width - 2; x++) {
        map[y][x] = 0;
      }
    }

    for (let x = 2; x < this.width - 2; x += 3) {
      for (let y = 2; y < this.height - 2; y++) {
        map[y][x] = 0;
      }
    }

    return map;
  }

  findSpawnPoint(map) {
    // Encontrar posição válida aleatória
    for (let attempts = 0; attempts < 100; attempts++) {
      const x = Math.floor(Math.random() * (this.width - 2)) + 1;
      const y = Math.floor(Math.random() * (this.height - 2)) + 1;

      if (map[y][x] === 0) {
        return { x: x + 0.5, y: y + 0.5 };
      }
    }
    return { x: this.width / 2, y: this.height / 2 };
  }
}

// Classe de Armas com Texturas
class Weapon {
  constructor(name, damage, cooldown, cost, range = 20, texture = '🔫') {
    this.name = name;
    this.damage = damage;
    this.cooldown = cooldown;
    this.cost = cost;
    this.range = range;
    this.lastShot = 0;
    this.texture = texture; // Emoji ou caminho para imagem
  }

  canShoot(currentTime) {
    return currentTime - this.lastShot >= this.cooldown;
  }

  shoot(currentTime) {
    this.lastShot = currentTime;
  }
}

// Classe do Jogador
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.speed = 0.08;
    this.rotSpeed = 0.06;
    this.maxHp = 100;
    this.hp = 100;
    this.coins = 0;
    this.weapons = [
      new Weapon('Pistola', 25, 500, 0, 15, '🔫'),
    ];
    this.currentWeaponIndex = 0;
  }

  get weapon() {
    return this.weapons[this.currentWeaponIndex];
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }

  addCoins(amount) {
    this.coins += amount;
  }

  buyWeapon(weapon) {
    if (this.coins >= weapon.cost && !this.weapons.some(w => w.name === weapon.name)) {
      this.coins -= weapon.cost;
      this.weapons.push(weapon);
      this.currentWeaponIndex = this.weapons.length - 1;
      return true;
    }
    return false;
  }
}

// Classe de Inimigo com Sprites
class Enemy {
  constructor(x, y, type = 'basic') {
    this.x = x;
    this.y = y;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = type === 'fast' ? 0.03 : 0.02;
    this.maxHp = type === 'tank' ? 75 : type === 'basic' ? 50 : 30;
    this.hp = this.maxHp;
    this.damage = type === 'tank' ? 15 : 10;
    this.detectionRadius = 8;
    this.attackRadius = 1.5;
    this.attackCooldown = 1000;
    this.lastAttack = 0;
    this.type = type;
    this.coinDrop = type === 'tank' ? [15, 25] : type === 'fast' ? [5, 10] : [8, 15];
    this.color = type === 'tank' ? '#8b0000' : type === 'fast' ? '#ff6b6b' : '#e53e3e';
    this.sprite = type === 'tank' ? '🦾' : type === 'fast' ? '⚡' : '👾'; // Sprites/emojis
  }

  isDead() {
    return this.hp <= 0;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }

  distanceToPlayer(player) {
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  update(player, map, currentTime) {
    const distance = this.distanceToPlayer(player);

    // Detectar jogador
    if (distance < this.detectionRadius) {
      // Calcular ângulo para o jogador
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      this.angle = Math.atan2(dy, dx);

      // Mover em direção ao jogador
      if (distance > this.attackRadius) {
        const newX = this.x + Math.cos(this.angle) * this.speed;
        const newY = this.y + Math.sin(this.angle) * this.speed;

        // Verificar colisão com paredes
        if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
          this.x = newX;
          this.y = newY;
        }
      }

      // Atacar jogador se próximo
      if (distance < this.attackRadius && currentTime - this.lastAttack >= this.attackCooldown) {
        player.takeDamage(this.damage);
        this.lastAttack = currentTime;
      }
    }
  }

  dropCoins() {
    const [min, max] = this.coinDrop;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// Classe de Item (Moeda)
class CoinDrop {
  constructor(x, y, amount) {
    this.x = x;
    this.y = y;
    this.amount = amount;
    this.collected = false;
  }
}

// Classe de Loja
class Shop {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 2;
    this.inventory = [
      new Weapon('Shotgun', 50, 800, 50, 10, '🔨'),
      new Weapon('Rifle', 35, 300, 100, 20, '🎯'),
      new Weapon('Sniper', 100, 1500, 200, 25, '🎖️'),
    ];
  }

  isPlayerNearby(player) {
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius;
  }
}

// Portal de Saída (ativado após vitória)
class ExitPortal {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 1.5;
    this.active = false;
  }

  activate() {
    this.active = true;
  }

  isPlayerNearby(player) {
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius;
  }
}

// ==================== COMPONENTE PRINCIPAL ====================

const Games = () => {
  const canvasRef = useRef(null);
  const [selectedGame, setSelectedGame] = useState('doom');
  const [gameStarted, setGameStarted] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);

  // Refs do jogo
  const worldMapRef = useRef(null);
  const playerRef = useRef(null);
  const enemiesRef = useRef([]);
  const coinsRef = useRef([]);
  const shopRef = useRef(null);
  const exitPortalRef = useRef(null);
  const keysRef = useRef({
    w: false,
    s: false,
    a: false,
    d: false,
    ArrowLeft: false,
    ArrowRight: false,
    e: false,
    ' ': false,
  });

  // Inicializar jogo com dificuldade escalável
  const initGame = useCallback((level = 1, keepPlayerStats = false) => {
    // Gerar mapa (aumenta com o nível)
    const mapSize = Math.min(25 + (level - 1) * 3, 40);
    const generator = new MapGenerator(mapSize, mapSize);
    const map = generator.generate();
    worldMapRef.current = map;

    // Spawn do jogador
    const playerSpawn = generator.findSpawnPoint(map);

    if (keepPlayerStats && playerRef.current) {
      // Manter stats mas mudar posição
      playerRef.current.x = playerSpawn.x;
      playerRef.current.y = playerSpawn.y;
      playerRef.current.angle = 0;
    } else {
      playerRef.current = new Player(playerSpawn.x, playerSpawn.y);
    }

    // Spawn de inimigos (aumenta com o nível)
    enemiesRef.current = [];
    const enemyTypes = ['basic', 'basic', 'fast', 'tank'];
    const enemyCount = Math.min(8 + (level - 1) * 2, 20);

    for (let i = 0; i < enemyCount; i++) {
      const spawn = generator.findSpawnPoint(map);
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      const enemy = new Enemy(spawn.x, spawn.y, type);

      // Aumentar HP dos inimigos com o nível
      enemy.maxHp = Math.floor(enemy.maxHp * (1 + (level - 1) * 0.2));
      enemy.hp = enemy.maxHp;

      enemiesRef.current.push(enemy);
    }

    // Spawn de loja
    const shopSpawn = generator.findSpawnPoint(map);
    shopRef.current = new Shop(shopSpawn.x, shopSpawn.y);

    // Spawn do portal de saída
    const exitSpawn = generator.findSpawnPoint(map);
    exitPortalRef.current = new ExitPortal(exitSpawn.x, exitSpawn.y);

    // Reset de moedas
    coinsRef.current = [];
    setGameOver(false);
    setVictory(false);
    setShowShop(false);
    setCurrentLevel(level);
  }, []);

  // Raycasting Engine
  const castRay = useCallback((rayAngle, map, player) => {
    const rayDirX = Math.cos(rayAngle);
    const rayDirY = Math.sin(rayAngle);

    let mapX = Math.floor(player.x);
    let mapY = Math.floor(player.y);

    const deltaDistX = Math.abs(1 / rayDirX);
    const deltaDistY = Math.abs(1 / rayDirY);

    let stepX = rayDirX < 0 ? -1 : 1;
    let stepY = rayDirY < 0 ? -1 : 1;

    let sideDistX = rayDirX < 0
      ? (player.x - mapX) * deltaDistX
      : (mapX + 1.0 - player.x) * deltaDistX;
    let sideDistY = rayDirY < 0
      ? (player.y - mapY) * deltaDistY
      : (mapY + 1.0 - player.y) * deltaDistY;

    let hit = 0;
    let side = 0;

    while (hit === 0) {
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }

      if (mapX < 0 || mapX >= map[0].length || mapY < 0 || mapY >= map.length) {
        hit = 1;
      } else if (map[mapY][mapX] > 0) {
        hit = 1;
      }
    }

    let perpWallDist;
    if (side === 0) {
      perpWallDist = (mapX - player.x + (1 - stepX) / 2) / rayDirX;
    } else {
      perpWallDist = (mapY - player.y + (1 - stepY) / 2) / rayDirY;
    }

    return { perpWallDist, side };
  }, []);

  // Renderizar sprites com Billboard (sempre virados para o jogador)
  const renderSprites = useCallback((ctx, width, height, player) => {
    const sprites = [];

    // Adicionar inimigos
    enemiesRef.current.forEach(enemy => {
      if (!enemy.isDead()) {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) - player.angle;

        sprites.push({ distance, angle, type: 'enemy', entity: enemy });
      }
    });

    // Adicionar moedas
    coinsRef.current.forEach(coin => {
      if (!coin.collected) {
        const dx = coin.x - player.x;
        const dy = coin.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) - player.angle;

        sprites.push({ distance, angle, type: 'coin', entity: coin });
      }
    });

    // Adicionar loja
    if (shopRef.current) {
      const dx = shopRef.current.x - player.x;
      const dy = shopRef.current.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) - player.angle;

      sprites.push({ distance, angle, type: 'shop', entity: shopRef.current });
    }

    // Adicionar portal de saída (se ativo)
    if (exitPortalRef.current && exitPortalRef.current.active) {
      const dx = exitPortalRef.current.x - player.x;
      const dy = exitPortalRef.current.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) - player.angle;

      sprites.push({ distance, angle, type: 'exit', entity: exitPortalRef.current });
    }

    // Ordenar por distância (mais longe primeiro)
    sprites.sort((a, b) => b.distance - a.distance);

    // Renderizar sprites com Billboard
    sprites.forEach(sprite => {
      // Normalizar ângulo
      let spriteAngle = sprite.angle;
      while (spriteAngle < -Math.PI) spriteAngle += 2 * Math.PI;
      while (spriteAngle > Math.PI) spriteAngle -= 2 * Math.PI;

      // Verificar se está no FOV
      const fov = Math.PI / 3;
      if (Math.abs(spriteAngle) > fov / 2 + 0.5) return;

      // Calcular posição na tela
      const spriteScreenX = (spriteAngle / (fov / 2)) * (width / 2) + width / 2;
      const spriteHeight = sprite.distance > 0 ? height / sprite.distance : height;
      const spriteWidth = spriteHeight;

      if (sprite.type === 'enemy') {
        const enemy = sprite.entity;

        // Renderizar sprite do inimigo (billboard - sempre virado para jogador)
        ctx.fillStyle = enemy.color;
        ctx.fillRect(
          spriteScreenX - spriteWidth / 2,
          height / 2 - spriteHeight / 2,
          spriteWidth,
          spriteHeight
        );

        // Renderizar emoji/sprite do inimigo
        ctx.font = `${spriteHeight * 0.7}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(enemy.sprite, spriteScreenX, height / 2);

        // Barra de HP
        const hpBarWidth = spriteWidth;
        const hpBarHeight = 5;
        const hpPercent = enemy.hp / enemy.maxHp;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(
          spriteScreenX - hpBarWidth / 2,
          height / 2 - spriteHeight / 2 - 10,
          hpBarWidth,
          hpBarHeight
        );

        ctx.fillStyle = hpPercent > 0.5 ? '#48bb78' : hpPercent > 0.25 ? '#ecc94b' : '#f56565';
        ctx.fillRect(
          spriteScreenX - hpBarWidth / 2,
          height / 2 - spriteHeight / 2 - 10,
          hpBarWidth * hpPercent,
          hpBarHeight
        );
      } else if (sprite.type === 'coin') {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(
          spriteScreenX,
          height / 2,
          spriteWidth / 3,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Emoji da moeda
        ctx.font = `${spriteHeight * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💰', spriteScreenX, height / 2);
      } else if (sprite.type === 'shop') {
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(
          spriteScreenX - spriteWidth / 2,
          height / 2 - spriteHeight / 2,
          spriteWidth,
          spriteHeight
        );

        // Ícone de loja
        ctx.font = `${spriteHeight * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏪', spriteScreenX, height / 2);
      } else if (sprite.type === 'exit') {
        // Portal de saída animado
        const time = Date.now() / 200;
        const pulse = Math.sin(time) * 0.2 + 1;

        ctx.fillStyle = `rgba(72, 187, 120, ${0.3 + Math.sin(time) * 0.2})`;
        ctx.fillRect(
          spriteScreenX - spriteWidth / 2,
          height / 2 - spriteHeight / 2,
          spriteWidth,
          spriteHeight
        );

        // Ícone do portal
        ctx.font = `${spriteHeight * 0.7 * pulse}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚪', spriteScreenX, height / 2);
      }
    });
  }, []);

  // Renderizar o jogo
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !worldMapRef.current || !playerRef.current) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const map = worldMapRef.current;
    const player = playerRef.current;

    // Limpar canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Desenhar céu e chão
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, width, height / 2);
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, height / 2, width, height / 2);

    const fov = Math.PI / 3;
    const numRays = Math.min(width, 800);

    // Renderizar paredes
    for (let x = 0; x < numRays; x++) {
      const cameraX = 2 * x / numRays - 1;
      const rayAngle = player.angle + Math.atan(cameraX * Math.tan(fov / 2));

      const { perpWallDist, side } = castRay(rayAngle, map, player);

      const lineHeight = perpWallDist > 0 ? height / perpWallDist : height;
      const drawStart = Math.max(0, -lineHeight / 2 + height / 2);
      const drawEnd = Math.min(height, lineHeight / 2 + height / 2);

      let color;
      if (side === 0) {
        color = perpWallDist < 3 ? '#4a5568' :
                perpWallDist < 6 ? '#374151' :
                perpWallDist < 10 ? '#1f2937' : '#111827';
      } else {
        color = perpWallDist < 3 ? '#374151' :
                perpWallDist < 6 ? '#1f2937' :
                perpWallDist < 10 ? '#111827' : '#0f172a';
      }

      const rayWidth = width / numRays;
      ctx.fillStyle = color;
      ctx.fillRect(x * rayWidth, drawStart, Math.ceil(rayWidth), drawEnd - drawStart);
    }

    // Renderizar sprites
    renderSprites(ctx, width, height, player);

    // HUD Principal
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 280, 130);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`🎮 DOOM ROGUELIKE - Nível ${currentLevel}`, 20, 30);

    // HP Bar
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(20, 45, 260, 20);
    const hpPercent = player.hp / player.maxHp;
    ctx.fillStyle = hpPercent > 0.5 ? '#48bb78' : hpPercent > 0.25 ? '#ecc94b' : '#f56565';
    ctx.fillRect(20, 45, 260 * hpPercent, 20);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`HP: ${player.hp}/${player.maxHp}`, 150, 58);

    // Moedas e Arma
    ctx.textAlign = 'left';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`💰 Moedas: ${player.coins}`, 20, 85);
    ctx.fillStyle = '#fff';
    ctx.fillText(`🔫 ${player.weapon.name}`, 20, 105);

    // Inimigos restantes
    const aliveEnemies = enemiesRef.current.filter(e => !e.isDead()).length;
    ctx.fillStyle = aliveEnemies > 0 ? '#f56565' : '#48bb78';
    ctx.fillText(`👾 Inimigos: ${aliveEnemies}`, 160, 85);

    // Renderizar textura da arma equipada (HUD da arma)
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(player.weapon.texture, width / 2, height - 20);

    // Indicador de loja
    if (shopRef.current && shopRef.current.isPlayerNearby(player)) {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
      ctx.fillRect(width / 2 - 150, height - 150, 300, 60);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏪 LOJA PRÓXIMA', width / 2, height - 130);
      ctx.font = '14px Arial';
      ctx.fillText('Pressione E para abrir', width / 2, height - 110);
    }

    // Indicador de portal de saída
    if (exitPortalRef.current && exitPortalRef.current.active && exitPortalRef.current.isPlayerNearby(player)) {
      const time = Date.now() / 300;
      const pulse = Math.sin(time) * 20;

      ctx.fillStyle = 'rgba(72, 187, 120, 0.9)';
      ctx.fillRect(width / 2 - 150, height - 150, 300, 60);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚪 PORTAL ATIVO', width / 2, height - 130);
      ctx.font = '14px Arial';
      ctx.fillText('Pressione E para próximo nível', width / 2, height - 110);
    }

    // Crosshair
    ctx.strokeStyle = '#f56565';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 10, height / 2);
    ctx.lineTo(width / 2 + 10, height / 2);
    ctx.moveTo(width / 2, height / 2 - 10);
    ctx.lineTo(width / 2, height / 2 + 10);
    ctx.stroke();

    // Minimapa
    drawMinimap(ctx, width);
  }, [castRay, renderSprites, currentLevel]);

  // Desenhar minimapa
  const drawMinimap = (ctx, canvasWidth) => {
    if (!worldMapRef.current || !playerRef.current) return;

    const map = worldMapRef.current;
    const player = playerRef.current;
    const miniMapSize = 150;
    const cellSize = miniMapSize / map.length;
    const offsetX = canvasWidth - miniMapSize - 10;
    const offsetY = 10;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(offsetX - 5, offsetY - 5, miniMapSize + 10, miniMapSize + 10);

    // Desenhar mapa
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        ctx.fillStyle = map[y][x] === 1 ? '#4a5568' : '#1a1a1a';
        ctx.fillRect(
          offsetX + x * cellSize,
          offsetY + y * cellSize,
          cellSize - 0.5,
          cellSize - 0.5
        );
      }
    }

    // Desenhar loja
    if (shopRef.current) {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(
        offsetX + shopRef.current.x * cellSize - 2,
        offsetY + shopRef.current.y * cellSize - 2,
        4,
        4
      );
    }

    // Desenhar inimigos
    enemiesRef.current.forEach(enemy => {
      if (!enemy.isDead()) {
        ctx.fillStyle = '#e53e3e';
        ctx.fillRect(
          offsetX + enemy.x * cellSize - 1.5,
          offsetY + enemy.y * cellSize - 1.5,
          3,
          3
        );
      }
    });

    // Desenhar jogador
    const playerMapX = offsetX + player.x * cellSize;
    const playerMapY = offsetY + player.y * cellSize;

    ctx.fillStyle = '#48bb78';
    ctx.beginPath();
    ctx.arc(playerMapX, playerMapY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Direção do jogador
    ctx.strokeStyle = '#48bb78';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playerMapX, playerMapY);
    ctx.lineTo(
      playerMapX + Math.cos(player.angle) * 8,
      playerMapY + Math.sin(player.angle) * 8
    );
    ctx.stroke();
  };

  // Atirar
  const shoot = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    const currentTime = Date.now();
    if (!player.weapon.canShoot(currentTime)) return;

    player.weapon.shoot(currentTime);

    // Raycasting para detectar hit
    const rayAngle = player.angle;
    const rayDirX = Math.cos(rayAngle);
    const rayDirY = Math.sin(rayAngle);

    // Verificar inimigos no cone de tiro
    let closestEnemy = null;
    let closestDist = player.weapon.range;

    enemiesRef.current.forEach(enemy => {
      if (enemy.isDead()) return;

      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > player.weapon.range) return;

      // Verificar se está na direção do tiro (cone de ±15 graus)
      const angleToEnemy = Math.atan2(dy, dx);
      let angleDiff = angleToEnemy - rayAngle;
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      if (Math.abs(angleDiff) < 0.3 && distance < closestDist) {
        closestEnemy = enemy;
        closestDist = distance;
      }
    });

    // Aplicar dano
    if (closestEnemy) {
      closestEnemy.takeDamage(player.weapon.damage);

      if (closestEnemy.isDead()) {
        // Dropar moedas
        const coinAmount = closestEnemy.dropCoins();
        coinsRef.current.push(new CoinDrop(closestEnemy.x, closestEnemy.y, coinAmount));
      }
    }
  }, []);

  // Loop do jogo
  const gameLoop = useCallback(() => {
    const player = playerRef.current;
    const keys = keysRef.current;
    const map = worldMapRef.current;

    if (!player || !map || gameOver) return;

    const currentTime = Date.now();

    // Movimento do jogador
    if (keys.w) {
      const newX = player.x + Math.cos(player.angle) * player.speed;
      const newY = player.y + Math.sin(player.angle) * player.speed;
      if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
        player.x = newX;
        player.y = newY;
      }
    }
    if (keys.s) {
      const newX = player.x - Math.cos(player.angle) * player.speed;
      const newY = player.y - Math.sin(player.angle) * player.speed;
      if (map[Math.floor(newY)][Math.floor(newX)] === 0) {
        player.x = newX;
        player.y = newY;
      }
    }

    // Rotação
    if (keys.a || keys.ArrowLeft) {
      player.angle -= player.rotSpeed;
    }
    if (keys.d || keys.ArrowRight) {
      player.angle += player.rotSpeed;
    }

    // Atualizar inimigos
    enemiesRef.current.forEach(enemy => {
      if (!enemy.isDead()) {
        enemy.update(player, map, currentTime);
      }
    });

    // Coletar moedas
    coinsRef.current.forEach(coin => {
      if (!coin.collected) {
        const dx = coin.x - player.x;
        const dy = coin.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.5) {
          player.addCoins(coin.amount);
          coin.collected = true;
        }
      }
    });

    // Verificar condições de vitória/derrota
    if (player.hp <= 0) {
      setGameOver(true);
    }

    // Ativar portal quando todos inimigos morrem
    const aliveEnemies = enemiesRef.current.filter(e => !e.isDead()).length;
    if (aliveEnemies === 0 && exitPortalRef.current && !exitPortalRef.current.active) {
      exitPortalRef.current.activate();
    }

    render();
  }, [gameOver, render]);

  // Event Listeners
  useEffect(() => {
    if (!gameStarted || selectedGame !== 'doom') return;

    const handleKeyDown = (e) => {
      if (e.key in keysRef.current) {
        e.preventDefault();
        keysRef.current[e.key] = true;

        // Atirar
        if (e.key === ' ') {
          shoot();
        }

        // Abrir loja
        if (e.key === 'e' && shopRef.current && shopRef.current.isPlayerNearby(playerRef.current)) {
          setShowShop(true);
        }

        // Próximo nível (portal)
        if (e.key === 'e' && exitPortalRef.current && exitPortalRef.current.active &&
            exitPortalRef.current.isPlayerNearby(playerRef.current)) {
          // Transição para próximo nível
          const nextLevel = currentLevel + 1;
          initGame(nextLevel, true); // Mantém stats do jogador
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key in keysRef.current) {
        e.preventDefault();
        keysRef.current[e.key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, selectedGame, shoot, currentLevel, initGame]);

  // Game Loop
  useEffect(() => {
    if (!gameStarted || selectedGame !== 'doom') return;

    const interval = setInterval(gameLoop, 1000 / 60);

    return () => clearInterval(interval);
  }, [gameStarted, selectedGame, gameLoop]);

  // Redimensionar canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (gameStarted) render();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [gameStarted, render]);

  const startGame = (game) => {
    setSelectedGame(game);
    setGameStarted(true);
    initGame(1, false);
  };

  const exitGame = () => {
    setGameStarted(false);
    setShowShop(false);
    setGameOver(false);
    setVictory(false);
    setCurrentLevel(1);
  };

  const buyWeapon = (weapon) => {
    if (playerRef.current && playerRef.current.buyWeapon(weapon)) {
      render();
    }
  };

  const closeShop = () => {
    setShowShop(false);
  };

  const restartGame = () => {
    initGame(1, false);
    setGameOver(false);
    setVictory(false);
  };

  if (gameStarted) {
    return (
      <div className="game-fullscreen">
        <canvas ref={canvasRef} className="game-canvas-3d" />

        <button className="exit-game-btn" onClick={exitGame}>
          ✕ Sair do Jogo
        </button>

        {/* Loja UI */}
        {showShop && shopRef.current && playerRef.current && (
          <div className="shop-overlay">
            <div className="shop-container">
              <h2>🏪 Loja de Armas</h2>
              <div className="shop-balance">💰 Suas Moedas: {playerRef.current.coins}</div>

              <div className="shop-items">
                {shopRef.current.inventory.map((weapon, idx) => {
                  const owned = playerRef.current.weapons.some(w => w.name === weapon.name);
                  const canAfford = playerRef.current.coins >= weapon.cost;

                  return (
                    <div key={idx} className={`shop-item ${owned ? 'owned' : ''}`}>
                      <div className="shop-item-header">
                        <h3>{weapon.name}</h3>
                        {owned && <span className="owned-badge">POSSUI</span>}
                      </div>
                      <div className="shop-item-stats">
                        <div>💥 Dano: {weapon.damage}</div>
                        <div>⏱️ Cooldown: {weapon.cooldown}ms</div>
                        <div>🎯 Alcance: {weapon.range}m</div>
                      </div>
                      <div className="shop-item-footer">
                        <div className="shop-item-price">💰 {weapon.cost}</div>
                        <button
                          className="shop-buy-btn"
                          onClick={() => buyWeapon(weapon)}
                          disabled={owned || !canAfford}
                        >
                          {owned ? 'Comprado' : canAfford ? 'Comprar' : 'Sem Moedas'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="shop-close-btn" onClick={closeShop}>
                Fechar Loja
              </button>
            </div>
          </div>
        )}

        {/* Game Over */}
        {gameOver && (
          <div className="game-over-overlay">
            <div className="game-over-container">
              <h1>💀 GAME OVER</h1>
              <p>Você foi derrotado!</p>
              <div className="game-over-stats">
                <div>Moedas Coletadas: {playerRef.current.coins}</div>
                <div>Inimigos Mortos: {enemiesRef.current.filter(e => e.isDead()).length}</div>
              </div>
              <div className="game-over-buttons">
                <button onClick={restartGame}>🔄 Jogar Novamente</button>
                <button onClick={exitGame}>🚪 Sair</button>
              </div>
            </div>
          </div>
        )}

        {/* Vitória */}
        {victory && (
          <div className="victory-overlay">
            <div className="victory-container">
              <h1>🎉 VITÓRIA!</h1>
              <p>Você eliminou todos os inimigos!</p>
              <div className="victory-stats">
                <div>💰 Moedas: {playerRef.current.coins}</div>
                <div>❤️ HP Restante: {playerRef.current.hp}/{playerRef.current.maxHp}</div>
              </div>
              <div className="victory-buttons">
                <button onClick={restartGame}>🔄 Novo Nível</button>
                <button onClick={exitGame}>🚪 Sair</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="games-page">
      <div className="games-container">
        <header className="games-header">
          <h1>🎮 Jogos de Aprendizagem</h1>
          <p>Divirta-se enquanto aprende! Escolha um dos nossos jogos educativos.</p>
        </header>

        <div className="games-grid">
          <div className="game-card">
            <div className="game-card-icon">🎯</div>
            <h3>Doom Roguelike</h3>
            <p>Um shooter roguelike com geração procedural de níveis, combate tático, economia de moedas e progressão de armas. Elimine todos os inimigos para vencer!</p>
            <div className="game-card-tags">
              <span className="tag">3D</span>
              <span className="tag">Roguelike</span>
              <span className="tag">Raycasting</span>
              <span className="tag">Procedural</span>
            </div>
            <div className="game-controls-info">
              <strong>Controles:</strong>
              <div>W/S - Mover | A/D ou ←→ - Rodar</div>
              <div>Espaço - Atirar | E - Loja</div>
            </div>
            <button className="game-start-btn" onClick={() => startGame('doom')}>
              Jogar Agora
            </button>
          </div>

          <div className="game-card game-card-disabled">
            <div className="game-card-icon">🧩</div>
            <h3>Puzzle de Algoritmos</h3>
            <p>Resolva desafios de lógica e algoritmos. Em breve!</p>
            <div className="game-card-tags">
              <span className="tag">Lógica</span>
              <span className="tag">Em Breve</span>
            </div>
            <button className="game-start-btn" disabled>
              Em Desenvolvimento
            </button>
          </div>

          <div className="game-card game-card-disabled">
            <div className="game-card-icon">🚀</div>
            <h3>Code Runner</h3>
            <p>Corrida de programação em tempo real. Em breve!</p>
            <div className="game-card-tags">
              <span className="tag">Velocidade</span>
              <span className="tag">Em Breve</span>
            </div>
            <button className="game-start-btn" disabled>
              Em Desenvolvimento
            </button>
          </div>
        </div>

        <div className="games-footer">
          <a href="/dashboard" className="back-link">← Voltar ao Dashboard</a>
        </div>
      </div>
    </div>
  );
};

export default Games;
