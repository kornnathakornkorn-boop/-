import { 
  Bullet, Enemy, EnemyType, FloatingText, Particle, 
  Player, Powerup, PowerupType, ShipType, Shockwave, Star, WeaponType 
} from '../types';
import { SHIPS } from './constants';
import { sound } from '../audio/soundEngine';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number, combo: number, multiplier: number, coins: number) => void;
  onPlayerStatsUpdate: (
    health: number, 
    maxHealth: number, 
    shield: number, 
    maxShield: number, 
    lives: number, 
    bombs: number, 
    overdrive: number, 
    isOverdrive: boolean,
    coins: number,
    weaponLevel: number,
    weaponType: WeaponType
  ) => void;
  onWaveUpdate: (wave: number, waveTitle: string) => void;
  onBossStatus: (active: boolean, name?: string, health?: number, maxHealth?: number, phase?: number) => void;
  onGameOver: (finalScore: number, wave: number, coins: number) => void;
  onAchievementUnlock: (id: string) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  // Viewport
  public width: number = 800;
  public height: number = 600;
  private dpr: number = 1;

  // Game Loop
  private animationId: number | null = null;
  private lastTime: number = 0;
  public isRunning: boolean = false;
  public isPaused: boolean = false;

  // Game States
  public wave: number = 1;
  public waveTimer: number = 0;
  public waveEnemiesToSpawn: { type: EnemyType; delay: number; xPercent: number }[] = [];
  public isWaveInProgress: boolean = false;
  public waveBannerTimer: number = 0;
  public waveBannerText: string = '';

  // Combo System
  public comboCount: number = 0;
  public comboTimer: number = 0;
  public maxComboTimer: number = 3.5; // seconds
  public multiplier: number = 1;

  // Screen FX
  public screenShake: number = 0;
  public flashColor: string | null = null;
  public flashAlpha: number = 0;
  public hyperspaceSpeed: number = 1;

  // Settings & FX Performance Controls
  public crtEnabled: boolean = false;
  public bloomEnabled: boolean = false;
  public graphicsQuality: 'low' | 'medium' | 'high' = 'low';
  public performanceMode: boolean = true;
  public maxParticles: number = 40;

  // Entities
  public player: Player;
  public bullets: Bullet[] = [];
  public enemies: Enemy[] = [];
  public particles: Particle[] = [];
  public powerups: Powerup[] = [];
  public shockwaves: Shockwave[] = [];
  public floatingTexts: FloatingText[] = [];
  public stars: Star[] = [];

  // Input states
  public keys: Record<string, boolean> = {};
  public mousePos: { x: number; y: number } = { x: 400, y: 300 };
  public isMouseDown: boolean = false;
  public virtualJoystick: { active: boolean; dx: number; dy: number } = { active: false, dx: 0, dy: 0 };
  public autoFire: boolean = true;

  private bulletIdCounter: number = 0;
  private enemyIdCounter: number = 0;
  private powerupIdCounter: number = 0;
  private textIdCounter: number = 0;
  private shockwaveIdCounter: number = 0;

  // Boss tracking
  public currentBoss: Enemy | null = null;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks, initialShip: ShipType = 'VIPER') {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.callbacks = callbacks;

    this.player = this.createPlayer(initialShip);
    this.handleResize();
    this.initStarfield();
    this.bindInputs();
  }

  public setShip(shipType: ShipType) {
    this.player = this.createPlayer(shipType);
  }

  private createPlayer(shipType: ShipType): Player {
    const config = SHIPS[shipType];
    const initialHighScore = parseInt(localStorage.getItem('neon_high_score') || '0', 10);

    const initialBombs = 
      shipType === 'DREADNOUGHT' ? 6 :
      shipType === 'APEX' || shipType === 'VOID_RAIDER' ? 5 :
      shipType === 'TITAN' || shipType === 'SOLARIS' || shipType === 'CHRONOS' ? 4 : 3;

    const fireRate = 
      shipType === 'VOID_RAIDER' ? 0.07 :
      shipType === 'CHRONOS' ? 0.075 :
      shipType === 'APEX' ? 0.08 :
      shipType === 'NEBULA' ? 0.09 :
      shipType === 'PHANTOM' || shipType === 'SOLARIS' ? 0.10 :
      shipType === 'VALKYRIE' ? 0.11 :
      shipType === 'VIPER' ? 0.12 :
      shipType === 'AURORA' ? 0.13 :
      shipType === 'DREADNOUGHT' ? 0.14 : 0.15;

    const shipWidth = 
      shipType === 'DREADNOUGHT' ? 52 :
      shipType === 'VOID_RAIDER' || shipType === 'APEX' || shipType === 'TITAN' ? 48 :
      shipType === 'SOLARIS' ? 46 :
      shipType === 'CHRONOS' ? 42 : 44;

    return {
      x: this.width / 2,
      y: this.height - 100,
      vx: 0,
      vy: 0,
      width: shipWidth,
      height: 48,
      speed: config.speed,
      shipType: shipType,
      health: config.maxHealth,
      maxHealth: config.maxHealth,
      shield: config.maxShield,
      maxShield: config.maxShield,
      shieldRechargeTimer: 0,
      lives: 3,
      bombs: initialBombs,
      maxBombs: shipType === 'DREADNOUGHT' ? 8 : 6,
      score: 0,
      highScore: initialHighScore,
      coins: 0,
      weaponType: 'BLASTER',
      weaponLevel: shipType === 'APEX' || shipType === 'VOID_RAIDER' ? 2 : 1,
      lastShotTime: 0,
      fireRate: fireRate,
      isInvulnerable: true,
      invulnerableTimer: 2.5,
      overdrive: 0,
      isOverdriveActive: false,
      overdriveTimer: 0,
      color: config.color,
      accentColor: config.accentColor,
      rotation: 0,
      trail: []
    };
  }

  public handleResize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = parent.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);

    // Keep player in bounds on resize
    if (this.player) {
      this.player.x = Math.max(30, Math.min(this.width - 30, this.player.x));
      this.player.y = Math.max(30, Math.min(this.height - 30, this.player.y));
    }
  }

  public applySettings(settings: {
    crtScanlines?: boolean;
    bloomGlow?: boolean;
    particlesDensity?: 'low' | 'medium' | 'high';
    graphicsQuality?: 'low' | 'medium' | 'high';
    performanceMode?: boolean;
  }) {
    if (settings.crtScanlines !== undefined) this.crtEnabled = settings.crtScanlines;
    if (settings.bloomGlow !== undefined) this.bloomEnabled = settings.bloomGlow;
    if (settings.graphicsQuality !== undefined) {
      this.graphicsQuality = settings.graphicsQuality;
      this.performanceMode = settings.graphicsQuality === 'low';
    } else if (settings.performanceMode !== undefined) {
      this.performanceMode = settings.performanceMode;
      this.graphicsQuality = settings.performanceMode ? 'low' : 'medium';
    }
    
    // Scale particle and star budget
    if (this.graphicsQuality === 'low') {
      this.maxParticles = 35;
      this.bloomEnabled = false;
    } else if (this.graphicsQuality === 'medium') {
      this.maxParticles = 65;
    } else {
      this.maxParticles = 110;
    }

    this.initStarfield();
  }

  private initStarfield() {
    this.stars = [];
    const count = this.graphicsQuality === 'low' ? 35 : this.graphicsQuality === 'medium' ? 65 : 95;
    for (let i = 0; i < count; i++) {
      const layer = Math.floor(Math.random() * 3) + 1; // 1, 2, 3
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: layer === 3 ? 2.2 : layer === 2 ? 1.5 : 0.9,
        speed: layer === 3 ? 3.0 : layer === 2 ? 1.6 : 0.8,
        color: layer === 3 ? '#00f3ff' : layer === 2 ? '#a855f7' : '#ffffff',
        layer,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        brightness: 0.3 + Math.random() * 0.7
      });
    }
  }

  private bindInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      this.keys[e.key.toLowerCase()] = true;

      // Space / B / X for bomb
      if ((e.code === 'KeyX' || e.code === 'KeyB' || e.code === 'ShiftLeft') && this.isRunning && !this.isPaused) {
        this.triggerBomb();
      }

      // 'F' or 'C' for Overdrive
      if ((e.code === 'KeyC' || e.code === 'KeyF') && this.isRunning && !this.isPaused) {
        this.triggerOverdrive();
      }

      // 'Q' or 'E' or '1' / '2' to switch weapon (Single / Spread Shot)
      if ((e.code === 'KeyQ' || e.code === 'KeyE' || e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Tab') && this.isRunning && !this.isPaused) {
        e.preventDefault();
        this.toggleWeaponType();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      this.keys[e.key.toLowerCase()] = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos.x = e.clientX - rect.left;
      this.mousePos.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      sound.unlockAudio();
      if (e.button === 0) {
        this.isMouseDown = true;
      } else if (e.button === 2) {
        e.preventDefault();
        this.triggerBomb();
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.isMouseDown = false;
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Direct Touch & Drag support: ใช้นิ้วลากยานไปมาบน Canvas ได้โดยตรง
    this.canvas.addEventListener('touchstart', (e) => {
      sound.unlockAudio();
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        this.mousePos.x = touchX;
        this.mousePos.y = touchY;
        this.isMouseDown = true;

        if (this.player && this.isRunning && !this.isPaused) {
          // Direct drag placement with comfortable finger offset
          this.player.x = Math.max(this.player.width / 2, Math.min(this.width - this.player.width / 2, touchX));
          this.player.y = Math.max(this.player.height / 2 + 20, Math.min(this.height - this.player.height / 2 - 10, touchY - 35));
        }
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        this.mousePos.x = touchX;
        this.mousePos.y = touchY;

        if (this.player && this.isRunning && !this.isPaused) {
          // Direct 1:1 finger tracking
          this.player.x = Math.max(this.player.width / 2, Math.min(this.width - this.player.width / 2, touchX));
          this.player.y = Math.max(this.player.height / 2 + 20, Math.min(this.height - this.player.height / 2 - 10, touchY - 35));
        }
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      this.isMouseDown = false;
    }, { passive: true });

    this.canvas.addEventListener('touchcancel', () => {
      this.isMouseDown = false;
    }, { passive: true });
  }

  public toggleWeaponType() {
    if (!this.player) return;
    sound.unlockAudio();
    // Toggle between Single / Plasma Blaster and Spread Cannon (or cycle)
    if (this.player.weaponType === 'BLASTER') {
      this.player.weaponType = 'SPREAD';
      this.addFloatingText(this.player.x, this.player.y - 30, '3-WAY SPREAD SHOT', '#39ff14', 1.5);
    } else if (this.player.weaponType === 'SPREAD') {
      this.player.weaponType = 'BLASTER';
      this.addFloatingText(this.player.x, this.player.y - 30, 'SINGLE PLASMA BLASTER', '#00f3ff', 1.5);
    } else {
      this.player.weaponType = 'SPREAD';
      this.addFloatingText(this.player.x, this.player.y - 30, '3-WAY SPREAD SHOT', '#39ff14', 1.5);
    }
    sound.playPowerup();
    this.updatePlayerStats();
  }

  public setWeaponType(type: WeaponType) {
    if (!this.player) return;
    sound.unlockAudio();
    this.player.weaponType = type;
    this.addFloatingText(this.player.x, this.player.y - 30, `${type} WEAPON EQUIPPED`, '#00f3ff', 1.4);
    sound.playPowerup();
    this.updatePlayerStats();
  }

  public start(startWave: number = 1) {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    sound.startBGM(false);
    this.startWave(startWave);
    this.loop(this.lastTime);
  }

  public pause() {
    this.isPaused = true;
    sound.stopBGM();
  }

  public resume() {
    if (!this.isRunning) return;
    this.isPaused = false;
    this.lastTime = performance.now();
    sound.startBGM(this.currentBoss !== null);
    this.loop(this.lastTime);
  }

  public restart(shipType?: ShipType, startWave: number = 1) {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    const chosenShip = shipType || this.player.shipType;
    this.player = this.createPlayer(chosenShip);
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.powerups = [];
    this.shockwaves = [];
    this.floatingTexts = [];
    this.currentBoss = null;
    this.comboCount = 0;
    this.multiplier = 1;
    this.screenShake = 0;
    this.flashAlpha = 0;
    this.start(startWave);
  }

  // --- WAVE SPAWN SYSTEM ---

  public startWave(waveNumber: number) {
    // If waveNumber <= 5 is passed as sector selection, calculate actual wave offset
    let actualWave = waveNumber;
    if (waveNumber >= 1 && waveNumber <= 5 && !this.isWaveInProgress && this.wave === 1) {
      actualWave = (waveNumber - 1) * 10 + 1;
    }

    this.wave = actualWave;
    this.waveTimer = 0;
    this.isWaveInProgress = true;
    this.waveEnemiesToSpawn = [];

    const sector = Math.min(5, Math.floor((this.wave - 1) / 10) + 1);
    const subWave = ((this.wave - 1) % 10) + 1; // 1 to 10

    const isMiniBossWave = subWave === 5;
    const isGiantBossWave = subWave === 10;

    if (isGiantBossWave) {
      this.waveBannerText = `☠️ SECTOR ${sector} • WAVE 10/10: COLOSSAL DREADNOUGHT BOSS APPROACHING!`;
      this.waveBannerTimer = 4.0;
      sound.playWarningSiren();
      sound.setBossMusic(true);

      // Spawn Giant Boss after 4.0 seconds
      setTimeout(() => {
        if (!this.isRunning) return;
        this.spawnGiantBoss(sector);
      }, 4000);
    } else if (isMiniBossWave) {
      this.waveBannerText = `⚠️ SECTOR ${sector} • WAVE 5/10: SUB-BOSS INCOMING!`;
      this.waveBannerTimer = 3.2;
      sound.playWarningSiren();
      sound.setBossMusic(true);

      // Spawn Mini Boss after 3.2 seconds
      setTimeout(() => {
        if (!this.isRunning) return;
        this.spawnMiniBoss(sector);
      }, 3200);
    } else {
      this.waveBannerText = `SECTOR ${sector} • WAVE ${subWave}/10: ENGAGE HOSTILES`;
      this.waveBannerTimer = 2.5;
      sound.setBossMusic(false);

      // Generate procedural formations based on sector & subwave
      const totalEnemies = 10 + sector * 3 + subWave * 2;
      let timeOffset = 0.8;

      for (let i = 0; i < totalEnemies; i++) {
        let type: EnemyType = 'SCOUT';
        const rand = Math.random();

        if (sector >= 2 && rand > 0.60) type = 'ASSAULT';
        if ((sector >= 2 || subWave >= 3) && rand > 0.75) type = 'STRIKER';
        if (sector >= 2 && rand < 0.22) type = 'ASTEROID';
        if ((sector >= 3 || subWave >= 4) && rand > 0.82) type = 'SNIPER';
        if ((sector >= 3 || subWave >= 6) && rand > 0.45 && rand < 0.65) type = 'KAMIKAZE';
        if ((sector >= 4 || subWave >= 7) && rand < 0.15) type = 'MINE';

        this.waveEnemiesToSpawn.push({
          type,
          delay: timeOffset,
          xPercent: 0.1 + Math.random() * 0.8
        });

        timeOffset += Math.max(0.35, 1.6 - (sector * 0.12 + subWave * 0.08)) + (Math.random() * 0.4);
      }
    }

    this.callbacks.onWaveUpdate(this.wave, this.waveBannerText);
    if (this.wave >= 3) {
      this.callbacks.onAchievementUnlock('wave_3');
    }
  }

  private spawnMiniBoss(sector: number) {
    const bossNames = [
      'CYBER SCOUT DREAD-MINI',
      'PLASMA CRACKER MK-II',
      'VOID CORVETTE PHANTOM',
      'SOLAR STRIKER TITAN-V',
      'ABYSSAL GUARDIAN X'
    ];
    const bossColors = ['#00f3ff', '#39ff14', '#a855f7', '#f59e0b', '#ec4899'];
    const accentColors = ['#38bdf8', '#fbbf24', '#ec4899', '#ef4444', '#00f3ff'];
    
    const bossName = bossNames[sector - 1] || 'ELITE HYBRID CRUSHER';
    const baseHealth = 2000 + sector * 900;

    const boss: Enemy = {
      id: ++this.enemyIdCounter,
      type: 'BOSS',
      x: this.width / 2,
      y: -80,
      vx: 0,
      vy: 1.8,
      width: 120 + sector * 6,
      height: 90 + sector * 5,
      health: baseHealth,
      maxHealth: baseHealth,
      scoreValue: 8000 * sector,
      color: bossColors[sector - 1] || '#ff0055',
      accentColor: accentColors[sector - 1] || '#00f3ff',
      shootCooldown: 0.75,
      lastShot: 0,
      behaviorTimer: 0,
      state: 0,
      radius: 55 + sector * 4,
      angle: 0,
      rotationSpeed: 0.01,
      isBoss: true,
      isSubBoss: true,
      isGiantBoss: false,
      bossPhase: 1,
      maxBossPhases: 2,
      bossName,
      bossSubtitle: `SECTOR ${sector} SUB-BOSS`
    };

    this.enemies.push(boss);
    this.currentBoss = boss;
    this.callbacks.onBossStatus(true, bossName, boss.health, boss.maxHealth, 1);
  }

  private spawnGiantBoss(sector: number) {
    const bossNames = [
      '★ GIGANTIC DREADNOUGHT OMEGA',
      '★ COLOSSAL PLASMA GOLIATH',
      '★ TITANIC VOID LEVIATHAN',
      '★ CYBERNETIC SOLAR JUGGERNAUT',
      '★ ULTIMATE APEX DOOMSDAY FLAGSHIP'
    ];
    const bossColors = ['#00f3ff', '#39ff14', '#a855f7', '#f59e0b', '#ff0055'];
    const accentColors = ['#ff0055', '#38bdf8', '#00f3ff', '#fde047', '#00f3ff'];
    
    const bossName = bossNames[sector - 1] || 'COLOSSAL NEON OVERLORD';
    const baseHealth = 4800 + sector * 2500;

    const boss: Enemy = {
      id: ++this.enemyIdCounter,
      type: 'BOSS',
      x: this.width / 2,
      y: -140, // Enters slowly from top
      vx: 0,
      vy: 1.2,
      width: 190 + sector * 12,
      height: 130 + sector * 9,
      health: baseHealth,
      maxHealth: baseHealth,
      scoreValue: 25000 * sector,
      color: bossColors[sector - 1] || '#ff0055',
      accentColor: accentColors[sector - 1] || '#00f3ff',
      shootCooldown: 0.6,
      lastShot: 0,
      behaviorTimer: 0,
      state: 0,
      radius: 90 + sector * 8,
      angle: 0,
      rotationSpeed: 0.005,
      isBoss: true,
      isSubBoss: false,
      isGiantBoss: true,
      bossPhase: 1,
      maxBossPhases: 3,
      bossName,
      bossSubtitle: `SECTOR ${sector} COLOSSAL BOSS`
    };

    this.enemies.push(boss);
    this.currentBoss = boss;
    this.callbacks.onBossStatus(true, bossName, boss.health, boss.maxHealth, 1);
  }

  private spawnEnemy(type: EnemyType, xPercent: number) {
    const x = Math.max(40, Math.min(this.width - 40, this.width * xPercent));
    let enemy: Enemy;

    switch (type) {
      case 'SCOUT':
        enemy = {
          id: ++this.enemyIdCounter,
          type: 'SCOUT',
          x,
          y: -30,
          vx: (Math.random() - 0.5) * 3,
          vy: 2.2 + Math.random() * 1.5 + (this.wave * 0.1),
          width: 32,
          height: 32,
          radius: 16,
          health: 30 + this.wave * 8,
          maxHealth: 30 + this.wave * 8,
          scoreValue: 150,
          color: '#00f3ff',
          accentColor: '#38bdf8',
          shootCooldown: 2.0 - Math.min(1.0, this.wave * 0.08),
          lastShot: 0,
          behaviorTimer: 0,
          state: 0,
          angle: 0,
          rotationSpeed: 0
        };
        break;

      case 'ASSAULT':
        enemy = {
          id: ++this.enemyIdCounter,
          type: 'ASSAULT',
          x,
          y: -40,
          vx: Math.sin(this.enemyIdCounter) * 1.8,
          vy: 1.2 + (this.wave * 0.08),
          width: 44,
          height: 44,
          radius: 22,
          health: 90 + this.wave * 20,
          maxHealth: 90 + this.wave * 20,
          scoreValue: 350,
          color: '#a855f7',
          accentColor: '#c084fc',
          shootCooldown: 1.6,
          lastShot: 0,
          behaviorTimer: 0,
          state: 0,
          angle: 0,
          rotationSpeed: 0
        };
        break;

      case 'STRIKER':
        enemy = {
          id: ++this.enemyIdCounter,
          type: 'STRIKER',
          x,
          y: -35,
          vx: (Math.random() - 0.5) * 4,
          vy: 2.5,
          width: 36,
          height: 36,
          radius: 18,
          health: 60 + this.wave * 12,
          maxHealth: 60 + this.wave * 12,
          scoreValue: 400,
          color: '#f59e0b',
          accentColor: '#fbbf24',
          shootCooldown: 1.4,
          lastShot: 0,
          behaviorTimer: 0,
          state: 0,
          angle: 0,
          rotationSpeed: 0.05
        };
        break;

      case 'KAMIKAZE':
        enemy = {
          id: ++this.enemyIdCounter,
          type: 'KAMIKAZE',
          x,
          y: -30,
          vx: 0,
          vy: 3.8 + (this.wave * 0.15),
          width: 28,
          height: 28,
          radius: 14,
          health: 25 + this.wave * 6,
          maxHealth: 25 + this.wave * 6,
          scoreValue: 200,
          color: '#ef4444',
          accentColor: '#f87171',
          shootCooldown: 999,
          lastShot: 0,
          behaviorTimer: 0,
          state: 0,
          angle: 0,
          rotationSpeed: 0
        };
        break;

      case 'SNIPER':
        enemy = {
          id: ++this.enemyIdCounter,
          type: 'SNIPER',
          x,
          y: -40,
          vx: (Math.random() - 0.5) * 2,
          vy: 0.8,
          width: 40,
          height: 48,
          radius: 20,
          health: 120 + this.wave * 25,
          maxHealth: 120 + this.wave * 25,
          scoreValue: 500,
          color: '#ec4899',
          accentColor: '#f472b6',
          shootCooldown: 2.8,
          lastShot: 0,
          behaviorTimer: 0,
          state: 0,
          angle: 0,
          rotationSpeed: 0
        };
        break;

      case 'MINE':
        enemy = {
          id: ++this.enemyIdCounter,
          type: 'MINE',
          x,
          y: -30,
          vx: (Math.random() - 0.5) * 1.2,
          vy: 1.0,
          width: 32,
          height: 32,
          radius: 16,
          health: 45 + this.wave * 10,
          maxHealth: 45 + this.wave * 10,
          scoreValue: 250,
          color: '#e11d48',
          accentColor: '#f43f5e',
          shootCooldown: 999,
          lastShot: 0,
          behaviorTimer: 0,
          state: 0,
          angle: 0,
          rotationSpeed: 0.04
        };
        break;

      case 'ASTEROID':
      default:
        enemy = {
          id: ++this.enemyIdCounter,
          type: 'ASTEROID',
          x,
          y: -45,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 1.4 + Math.random() * 0.8,
          width: 50,
          height: 50,
          radius: 25,
          health: 140 + this.wave * 20,
          maxHealth: 140 + this.wave * 20,
          scoreValue: 300,
          color: '#06b6d4',
          accentColor: '#22d3ee',
          shootCooldown: 999,
          lastShot: 0,
          behaviorTimer: 0,
          state: 0,
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.03
        };
        break;
    }

    this.enemies.push(enemy);
  }

  // --- ACTIONS ---

  public triggerBomb() {
    if (this.player.bombs <= 0 || !this.isRunning || this.isPaused) return;

    this.player.bombs--;
    sound.playBomb();
    this.screenShake = 22;
    this.flashColor = '#00f3ff';
    this.flashAlpha = 0.6;

    // Create massive expanding shockwave
    this.shockwaves.push({
      id: ++this.shockwaveIdCounter,
      x: this.player.x,
      y: this.player.y,
      radius: 20,
      maxRadius: Math.max(this.width, this.height) * 1.2,
      speed: 28,
      color: '#00f3ff',
      alpha: 1.0,
      width: 14
    });

    // Wipe all enemy bullets
    const bulletsWiped = this.bullets.filter(b => !b.isPlayer).length;
    this.bullets = this.bullets.filter(b => b.isPlayer);
    if (bulletsWiped >= 10) {
      this.callbacks.onAchievementUnlock('bomb_master');
    }

    // Heavy damage to all enemies on screen
    for (const enemy of this.enemies) {
      this.damageEnemy(enemy, 850);
      this.createExplosion(enemy.x, enemy.y, enemy.color, 15);
    }

    this.addFloatingText(this.player.x, this.player.y - 40, 'EMP SHOCKWAVE!', '#00f3ff', 1.4);
    this.updatePlayerStats();
  }

  public triggerOverdrive() {
    if (this.player.overdrive < 100 || this.player.isOverdriveActive || !this.isRunning || this.isPaused) return;

    this.player.isOverdriveActive = true;
    this.player.overdriveTimer = 8.0; // 8 seconds frenzy
    this.player.overdrive = 0;
    this.hyperspaceSpeed = 3.5;
    this.screenShake = 10;
    sound.playOverdrive();

    this.addFloatingText(this.player.x, this.player.y - 50, 'HYPER OVERDRIVE ACTIVE!', '#ff0055', 1.6);
    this.callbacks.onAchievementUnlock('overdrive_rush');
    this.updatePlayerStats();
  }

  private addScore(points: number) {
    const totalAdded = points * this.multiplier;
    this.player.score += totalAdded;

    // High score check
    if (this.player.score > this.player.highScore) {
      this.player.highScore = this.player.score;
      localStorage.setItem('neon_high_score', this.player.highScore.toString());
    }

    if (this.player.score >= 50000) {
      this.callbacks.onAchievementUnlock('score_50k');
    }

    // Extra life every 75,000 points
    if (Math.floor(this.player.score / 75000) > Math.floor((this.player.score - totalAdded) / 75000)) {
      this.player.lives++;
      sound.playPowerup();
      this.addFloatingText(this.player.x, this.player.y - 60, '1-UP EXTRA LIFE!', '#39ff14', 1.5);
    }

    // Build combo
    this.comboCount++;
    this.comboTimer = this.maxComboTimer;
    this.multiplier = Math.min(8, 1 + Math.floor(this.comboCount / 5));

    if (this.multiplier >= 5) {
      this.callbacks.onAchievementUnlock('combo_5');
    }

    // Build overdrive charge
    if (!this.player.isOverdriveActive) {
      this.player.overdrive = Math.min(100, this.player.overdrive + (points > 1000 ? 15 : 2.5));
    }

    this.callbacks.onScoreUpdate(this.player.score, this.comboCount, this.multiplier, this.player.coins);
    this.updatePlayerStats();
  }

  private updatePlayerStats() {
    this.callbacks.onPlayerStatsUpdate(
      this.player.health,
      this.player.maxHealth,
      this.player.shield,
      this.player.maxShield,
      this.player.lives,
      this.player.bombs,
      this.player.overdrive,
      this.player.isOverdriveActive,
      this.player.coins,
      this.player.weaponLevel,
      this.player.weaponType
    );
  }

  // --- GAME LOOP & UPDATES ---

  private loop = (currentTime: number) => {
    if (!this.isRunning || this.isPaused) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    this.animationId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.updatePlayer(dt);
    this.updateStarfield(dt);
    this.updateWaves(dt);
    this.updateEnemies(dt);
    this.updateBullets(dt);
    this.updateCollisions();
    this.updateParticles(dt);
    this.updatePowerups(dt);
    this.updateShockwaves(dt);
    this.updateFloatingTexts(dt);
    this.updateScreenFX(dt);
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    // Movement calculation
    let moveX = 0;
    let moveY = 0;

    if (this.keys['KeyA'] || this.keys['ArrowLeft'] || this.keys['a']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight'] || this.keys['d']) moveX += 1;
    if (this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['w']) moveY -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown'] || this.keys['s']) moveY += 1;

    // Virtual Joystick support
    if (this.virtualJoystick.active) {
      moveX += this.virtualJoystick.dx;
      moveY += this.virtualJoystick.dy;
    }

    // Direct mouse/touch tracking if mouse down or auto-targeting
    if (this.isMouseDown) {
      const dx = this.mousePos.x - p.x;
      const dy = this.mousePos.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 5) {
        moveX += (dx / dist) * Math.min(1, dist / 20);
        moveY += (dy / dist) * Math.min(1, dist / 20);
      }
    }

    // Normalize diagonal speed
    const moveMag = Math.hypot(moveX, moveY);
    if (moveMag > 1) {
      moveX /= moveMag;
      moveY /= moveMag;
    }

    const currentSpeed = p.isOverdriveActive ? p.speed * 1.35 : p.speed;
    p.vx = moveX * currentSpeed;
    p.vy = moveY * currentSpeed;

    p.x += p.vx;
    p.y += p.vy;

    // Bounds clamping
    p.x = Math.max(p.width / 2, Math.min(this.width - p.width / 2, p.x));
    p.y = Math.max(p.height / 2 + 20, Math.min(this.height - p.height / 2 - 10, p.y));

    // Smooth banking rotation based on vx
    p.rotation = p.vx * 0.04;

    // Invulnerability timer
    if (p.isInvulnerable) {
      p.invulnerableTimer -= dt;
      if (p.invulnerableTimer <= 0) {
        p.isInvulnerable = false;
      }
    }

    // Shield recharge
    p.shieldRechargeTimer += dt;
    if (p.shieldRechargeTimer > 4.0 && p.shield < p.maxShield) {
      p.shield = Math.min(p.maxShield, p.shield + 20 * dt);
      this.updatePlayerStats();
    }

    // Overdrive timer
    if (p.isOverdriveActive) {
      p.overdriveTimer -= dt;
      if (p.overdriveTimer <= 0) {
        p.isOverdriveActive = false;
        this.hyperspaceSpeed = 1;
      }
      this.updatePlayerStats();
    }

    // Thruster flame particles
    if (Math.random() < 0.8) {
      this.particles.push({
        x: p.x + (Math.random() - 0.5) * 12,
        y: p.y + p.height / 2 - 4,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 3 + Math.random() * 4,
        size: 3 + Math.random() * 3,
        color: p.isOverdriveActive ? '#ff0055' : p.color,
        alpha: 0.9,
        decay: 0.06,
        shape: 'spark'
      });
    }

    // Weapon shooting
    p.lastShotTime += dt;
    const effectiveFireRate = p.isOverdriveActive ? p.fireRate * 0.45 : p.fireRate;

    const wantsToShoot = this.autoFire || this.isMouseDown || this.keys['Space'] || this.keys['KeyZ'];
    if (wantsToShoot && p.lastShotTime >= effectiveFireRate) {
      this.firePlayerWeapons();
      p.lastShotTime = 0;
    }
  }

  private firePlayerWeapons() {
    const p = this.player;
    const lvl = p.weaponLevel;
    const isOver = p.isOverdriveActive;

    sound.playLaser(p.weaponType.toLowerCase() as 'blaster' | 'spread' | 'laser' | 'missile');

    switch (p.weaponType) {
      case 'BLASTER':
        if (lvl === 1) {
          this.createPlayerBullet(p.x, p.y - 20, 0, -14, 18, 'BLASTER', p.color);
        } else if (lvl === 2) {
          this.createPlayerBullet(p.x - 12, p.y - 15, 0, -14, 18, 'BLASTER', p.color);
          this.createPlayerBullet(p.x + 12, p.y - 15, 0, -14, 18, 'BLASTER', p.color);
        } else if (lvl === 3) {
          this.createPlayerBullet(p.x, p.y - 20, 0, -15, 20, 'BLASTER', p.color);
          this.createPlayerBullet(p.x - 14, p.y - 12, -1.5, -14, 16, 'BLASTER', p.color);
          this.createPlayerBullet(p.x + 14, p.y - 12, 1.5, -14, 16, 'BLASTER', p.color);
        } else {
          // Quad / Hyper
          this.createPlayerBullet(p.x - 8, p.y - 20, 0, -15, 22, 'BLASTER', p.color);
          this.createPlayerBullet(p.x + 8, p.y - 20, 0, -15, 22, 'BLASTER', p.color);
          this.createPlayerBullet(p.x - 20, p.y - 10, -2.5, -14, 18, 'BLASTER', p.accentColor);
          this.createPlayerBullet(p.x + 20, p.y - 10, 2.5, -14, 18, 'BLASTER', p.accentColor);
        }
        break;

      case 'SPREAD':
        const count = 3 + lvl * 2;
        const spreadAngle = 0.5 + lvl * 0.15;
        for (let i = 0; i < count; i++) {
          const angle = -Math.PI / 2 + (i / (count - 1) - 0.5) * spreadAngle;
          const speed = 13 + Math.random() * 2;
          this.createPlayerBullet(p.x, p.y - 15, Math.cos(angle) * speed, Math.sin(angle) * speed, 14 + lvl * 2, 'SPREAD', '#39ff14');
        }
        break;

      case 'LASER':
        // High-velocity piercing beam
        this.createPlayerBullet(p.x, p.y - 25, 0, -20, 35 + lvl * 12, 'LASER', '#ff0055', { pierce: 3 + lvl });
        if (lvl >= 3) {
          this.createPlayerBullet(p.x - 14, p.y - 15, -0.5, -19, 20, 'LASER', '#fb7185', { pierce: 2 });
          this.createPlayerBullet(p.x + 14, p.y - 15, 0.5, -19, 20, 'LASER', '#fb7185', { pierce: 2 });
        }
        break;

      case 'MISSILE':
        this.createPlayerBullet(p.x - 16, p.y - 10, -4, -6, 40 + lvl * 15, 'MISSILE', '#ffaa00');
        this.createPlayerBullet(p.x + 16, p.y - 10, 4, -6, 40 + lvl * 15, 'MISSILE', '#ffaa00');
        if (lvl >= 3) {
          this.createPlayerBullet(p.x, p.y - 20, 0, -10, 40 + lvl * 15, 'MISSILE', '#ffaa00');
        }
        break;
    }

    // Overdrive extra micro missiles
    if (isOver) {
      this.createPlayerBullet(p.x - 25, p.y, -3, -12, 18, 'BLASTER', '#ff0055');
      this.createPlayerBullet(p.x + 25, p.y, 3, -12, 18, 'BLASTER', '#ff0055');
    }
  }

  private createPlayerBullet(
    x: number, y: number, vx: number, vy: number, damage: number, 
    type: WeaponType, color: string, extra?: { pierce?: number }
  ) {
    this.bullets.push({
      id: ++this.bulletIdCounter,
      x,
      y,
      vx,
      vy,
      radius: type === 'LASER' ? 5 : type === 'SPREAD' ? 4 : type === 'MISSILE' ? 6 : 4.5,
      damage: this.player.isOverdriveActive ? damage * 1.5 : damage,
      isPlayer: true,
      color,
      glowColor: color,
      type,
      pierce: extra?.pierce || 1,
      lifeTime: 0,
      maxLifeTime: 3.0
    });
  }

  private updateBullets(dt: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];

      // Homing missile behavior
      if (b.type === 'MISSILE' && b.isPlayer) {
        if (!b.target || b.target.health <= 0) {
          // Find closest enemy
          let closest: Enemy | null = null;
          let minDist = 800;
          for (const e of this.enemies) {
            const dist = Math.hypot(e.x - b.x, e.y - b.y);
            if (dist < minDist) {
              minDist = dist;
              closest = e;
            }
          }
          b.target = closest;
        }

        if (b.target) {
          const angle = Math.atan2(b.target.y - b.y, b.target.x - b.x);
          b.vx += Math.cos(angle) * 0.8;
          b.vy += Math.sin(angle) * 0.8;
          const spd = Math.hypot(b.vx, b.vy);
          if (spd > 15) {
            b.vx = (b.vx / spd) * 15;
            b.vy = (b.vy / spd) * 15;
          }
        }

        // Missile smoke trail
        if (Math.random() < 0.6) {
          this.particles.push({
            x: b.x,
            y: b.y,
            vx: (Math.random() - 0.5) * 1,
            vy: 1 + Math.random() * 2,
            size: 2.5,
            color: '#ffaa00',
            alpha: 0.8,
            decay: 0.08,
            shape: 'circle'
          });
        }
      }

      b.x += b.vx;
      b.y += b.vy;

      if (b.lifeTime !== undefined) {
        b.lifeTime += dt;
        if (b.maxLifeTime && b.lifeTime > b.maxLifeTime) {
          this.bullets.splice(i, 1);
          continue;
        }
      }

      // Out of bounds cleanup
      if (b.x < -40 || b.x > this.width + 40 || b.y < -50 || b.y > this.height + 50) {
        this.bullets.splice(i, 1);
      }
    }
  }

  private updateWaves(dt: number) {
    if (!this.isWaveInProgress) return;

    this.waveTimer += dt;

    if (this.waveBannerTimer > 0) {
      this.waveBannerTimer -= dt;
    }

    // Spawn queued enemies
    for (let i = this.waveEnemiesToSpawn.length - 1; i >= 0; i--) {
      const item = this.waveEnemiesToSpawn[i];
      if (this.waveTimer >= item.delay) {
        this.spawnEnemy(item.type, item.xPercent);
        this.waveEnemiesToSpawn.splice(i, 1);
      }
    }

    // Check if wave is cleared
    if (this.waveEnemiesToSpawn.length === 0 && this.enemies.length === 0 && !this.currentBoss) {
      this.isWaveInProgress = false;
      this.addScore(1000 * this.wave);
      this.addFloatingText(this.width / 2, this.height / 2 - 30, `SECTOR ${this.wave} CLEARED!`, '#39ff14', 1.8);
      sound.playPowerup();

      // Start next wave after short delay
      setTimeout(() => {
        if (this.isRunning && !this.isPaused) {
          this.startWave(this.wave + 1);
        }
      }, 2000);
    }
  }

  private updateEnemies(dt: number) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.behaviorTimer += dt;
      e.angle += e.rotationSpeed;

      // Enemy specific movement patterns
      switch (e.type) {
        case 'SCOUT':
          e.x += Math.sin(e.behaviorTimer * 4) * 3 + e.vx;
          e.y += e.vy;
          break;

        case 'ASSAULT':
          e.x += Math.sin(e.behaviorTimer * 2) * 2;
          e.y += e.vy;
          break;

        case 'STRIKER':
          e.x += e.vx;
          e.y += e.vy;
          if (e.behaviorTimer % 2.5 > 2.0) {
            // Rapid strafe dash
            e.vx = Math.sin(e.behaviorTimer * 8) * 6;
          }
          break;

        case 'KAMIKAZE':
          // Tracks player x
          const dxToPlayer = this.player.x - e.x;
          e.vx = Math.sign(dxToPlayer) * Math.min(Math.abs(dxToPlayer) * 0.05, 4.0);
          e.x += e.vx;
          e.y += e.vy;
          break;

        case 'SNIPER':
          if (e.y < 80) {
            e.y += e.vy;
          } else {
            e.x += Math.sin(e.behaviorTimer * 1.5) * 2;
          }
          break;

        case 'MINE':
        case 'ASTEROID':
          e.x += e.vx;
          e.y += e.vy;
          break;

        case 'BOSS':
          this.updateBoss(e, dt);
          break;
      }

      // Enemy shooting behavior
      e.lastShot += dt;
      if (e.lastShot >= e.shootCooldown && e.y > 0 && e.y < this.height - 100) {
        this.enemyShoot(e);
        e.lastShot = 0;
      }

      // Out of bounds despawn (except bosses)
      if (!e.isBoss && (e.y > this.height + 60 || e.x < -80 || e.x > this.width + 80)) {
        this.enemies.splice(i, 1);
      }
    }
  }

  private updateBoss(boss: Enemy, dt: number) {
    // Enter into screen
    const targetY = boss.isGiantBoss ? 130 : 110;
    if (boss.y < targetY) {
      boss.y += boss.vy;
    } else {
      // Hover and oscillate
      const oscillationSpeed = boss.isGiantBoss ? 0.8 : 1.4;
      const oscillationRange = boss.isGiantBoss ? 0.28 : 0.38;
      boss.x = this.width / 2 + Math.sin(boss.behaviorTimer * oscillationSpeed) * (this.width * oscillationRange);
      boss.y = targetY + Math.sin(boss.behaviorTimer * (boss.isGiantBoss ? 1.5 : 2.2)) * (boss.isGiantBoss ? 20 : 30);
    }

    // Boss Phase transitions
    const hpRatio = boss.health / boss.maxHealth;
    if (boss.isGiantBoss) {
      if (hpRatio < 0.30 && boss.bossPhase === 2) {
        boss.bossPhase = 3;
        boss.shootCooldown = 0.40;
        sound.playWarningSiren();
        this.addFloatingText(boss.x, boss.y + 70, 'PHASE 3: HYPER-DOOMSDAY ARRAYS ACTIVE!', '#ff0055', 2.0);
        this.screenShake = 15;
      } else if (hpRatio < 0.65 && boss.bossPhase === 1) {
        boss.bossPhase = 2;
        boss.shootCooldown = 0.52;
        this.addFloatingText(boss.x, boss.y + 70, 'PHASE 2: QUAD TURRETS ONLINE!', '#f59e0b', 1.8);
        this.screenShake = 10;
      }
    } else {
      // Sub-Boss 2-Phase
      if (hpRatio < 0.50 && boss.bossPhase === 1) {
        boss.bossPhase = 2;
        boss.shootCooldown = 0.55;
        this.addFloatingText(boss.x, boss.y + 50, 'PHASE 2: RAPID BARRAGE!', '#ec4899', 1.6);
        this.screenShake = 7;
      }
    }

    this.callbacks.onBossStatus(true, boss.bossName, boss.health, boss.maxHealth, boss.bossPhase);
  }

  private enemyShoot(e: Enemy) {
    if (e.type === 'MINE' || e.type === 'ASTEROID') return;

    sound.playEnemyShot();

    if (e.type === 'SCOUT') {
      this.createEnemyBullet(e.x, e.y + 15, 0, 5.5, 12, '#00f3ff');
    } else if (e.type === 'ASSAULT') {
      this.createEnemyBullet(e.x - 14, e.y + 15, -1, 5, 15, '#a855f7');
      this.createEnemyBullet(e.x + 14, e.y + 15, 1, 5, 15, '#a855f7');
    } else if (e.type === 'STRIKER') {
      const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
      this.createEnemyBullet(e.x, e.y + 10, Math.cos(angle) * 6, Math.sin(angle) * 6, 18, '#f59e0b');
    } else if (e.type === 'SNIPER') {
      // High-speed precision sniper bolt aimed directly at player
      const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
      this.createEnemyBullet(e.x, e.y + 20, Math.cos(angle) * 11, Math.sin(angle) * 11, 28, '#ec4899', 'ENEMY_LASER');
    } else if (e.isBoss) {
      this.bossAttackPattern(e);
    }
  }

  private bossAttackPattern(boss: Enemy) {
    const phase = boss.bossPhase || 1;

    if (boss.isGiantBoss) {
      // --- COLOSSAL DREADNOUGHT ATTACK PATTERNS ---
      // Pattern 1: 4-Quad Heavy Turret volleys
      const angleToPlayer = Math.atan2(this.player.y - boss.y, this.player.x - boss.x);
      const turretOffsets = [-boss.width * 0.35, -boss.width * 0.15, boss.width * 0.15, boss.width * 0.35];
      
      turretOffsets.forEach((tx) => {
        this.createEnemyBullet(
          boss.x + tx, 
          boss.y + boss.height * 0.25, 
          Math.cos(angleToPlayer) * 5.5, 
          Math.sin(angleToPlayer) * 5.5, 
          18 + phase * 3, 
          boss.accentColor, 
          'ENEMY_HEAVY'
        );
      });

      // Pattern 2: Massive 12 to 18-way Radial Spiral
      const bulletsCount = 10 + phase * 4;
      const baseAngle = boss.behaviorTimer * 3.5;
      for (let i = 0; i < bulletsCount; i++) {
        const angle = baseAngle + (i * Math.PI * 2) / bulletsCount;
        const speed = 3.2 + phase * 0.7;
        this.createEnemyBullet(
          boss.x + Math.cos(angle) * 50,
          boss.y + Math.sin(angle) * 50,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          15 + phase * 3,
          phase === 3 ? '#ff0055' : '#00f3ff',
          'BOSS_ORB'
        );
      }

      // Pattern 3: Sweeping Mega Laser in Phase 2 & 3
      if (phase >= 2 && Math.random() < 0.5) {
        const sweepAngle = Math.sin(boss.behaviorTimer * 4.5) * 0.5;
        this.createEnemyBullet(boss.x, boss.y + boss.height * 0.4, Math.sin(sweepAngle) * 8, 8.5, 28, '#ff0055', 'ENEMY_LASER');
      }

    } else {
      // --- SUB-BOSS ATTACK PATTERNS ---
      // Pattern 1: Rapid Dual Plasma Cannons
      this.createEnemyBullet(boss.x - 30, boss.y + 20, 0, 6.5, 14, boss.color, 'ENEMY_HEAVY');
      this.createEnemyBullet(boss.x + 30, boss.y + 20, 0, 6.5, 14, boss.color, 'ENEMY_HEAVY');

      // Pattern 2: 8-way burst
      const bulletsCount = 6 + phase * 2;
      const baseAngle = boss.behaviorTimer * 2.5;
      for (let i = 0; i < bulletsCount; i++) {
        const angle = baseAngle + (i * Math.PI * 2) / bulletsCount;
        this.createEnemyBullet(
          boss.x,
          boss.y + 20,
          Math.cos(angle) * 4.2,
          Math.sin(angle) * 4.2,
          12,
          boss.accentColor,
          'BOSS_ORB'
        );
      }

      // Phase 2 Aimed salvo
      if (phase === 2) {
        const angleToPlayer = Math.atan2(this.player.y - boss.y, this.player.x - boss.x);
        this.createEnemyBullet(boss.x, boss.y + 25, Math.cos(angleToPlayer) * 7.5, Math.sin(angleToPlayer) * 7.5, 20, '#ec4899', 'ENEMY_LASER');
      }
    }
  }

  private createEnemyBullet(
    x: number, y: number, vx: number, vy: number, damage: number, 
    color: string, type: Bullet['type'] = 'ENEMY_NORMAL'
  ) {
    this.bullets.push({
      id: ++this.bulletIdCounter,
      x,
      y,
      vx,
      vy,
      radius: type === 'BOSS_ORB' ? 7 : type === 'ENEMY_HEAVY' ? 6 : 4,
      damage,
      isPlayer: false,
      color,
      glowColor: color,
      type
    });
  }

  // --- COLLISION SYSTEM ---

  private updateCollisions() {
    // 1. Player Bullets vs Enemies
    for (let bIndex = this.bullets.length - 1; bIndex >= 0; bIndex--) {
      const b = this.bullets[bIndex];
      if (!b.isPlayer) continue;

      for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
        const e = this.enemies[eIndex];
        const dist = Math.hypot(b.x - e.x, b.y - e.y);

        if (dist < b.radius + e.radius) {
          // Hit detected!
          this.damageEnemy(e, b.damage);
          this.createHitSparks(b.x, b.y, b.color);

          if (b.pierce && b.pierce > 1) {
            b.pierce--;
          } else {
            this.bullets.splice(bIndex, 1);
            break;
          }
        }
      }
    }

    // 2. Enemy Bullets vs Player
    if (!this.player.isInvulnerable) {
      for (let bIndex = this.bullets.length - 1; bIndex >= 0; bIndex--) {
        const b = this.bullets[bIndex];
        if (b.isPlayer) continue;

        const dist = Math.hypot(b.x - this.player.x, b.y - this.player.y);
        if (dist < b.radius + this.player.width * 0.35) {
          this.damagePlayer(b.damage);
          this.createHitSparks(b.x, b.y, b.color);
          this.bullets.splice(bIndex, 1);
          break;
        }
      }
    }

    // 3. Enemy Ship & Asteroids vs Player Ship (Ramming / Collision Impact)
    if (!this.player.isInvulnerable) {
      for (const e of this.enemies) {
        const dist = Math.hypot(e.x - this.player.x, e.y - this.player.y);
        if (dist < e.radius + this.player.width * 0.4) {
          // When colliding with asteroid or enemy ship, hull health / shield decreases!
          const collisionDamage = e.type === 'ASTEROID' ? 45 : e.isBoss ? 60 : 35;
          this.damagePlayer(collisionDamage);
          this.damageEnemy(e, 85);
          this.screenShake = 16;
          this.addFloatingText(
            this.player.x, 
            this.player.y - 35, 
            e.type === 'ASTEROID' ? 'ASTEROID COLLISION!' : 'SHIP RAM IMPACT!', 
            '#ff0055', 
            1.3
          );
          sound.playShieldHit();
          break;
        }
      }
    }

    // 4. Player vs Powerups & Coins (Magnetism & Collection)
    for (let pIndex = this.powerups.length - 1; pIndex >= 0; pIndex--) {
      const p = this.powerups[pIndex];
      const dist = Math.hypot(p.x - this.player.x, p.y - this.player.y);

      // Magnet pull when close
      if (dist < 180) {
        const angle = Math.atan2(this.player.y - p.y, this.player.x - p.x);
        p.vx += Math.cos(angle) * 0.9;
        p.vy += Math.sin(angle) * 0.9;
      }

      if (dist < p.radius + this.player.width * 0.5) {
        this.collectPowerup(p);
        this.powerups.splice(pIndex, 1);
      }
    }
  }

  private damageEnemy(e: Enemy, damage: number) {
    e.health -= damage;

    if (e.health <= 0) {
      this.destroyEnemy(e);
    }
  }

  private destroyEnemy(e: Enemy) {
    const idx = this.enemies.indexOf(e);
    if (idx !== -1) {
      this.enemies.splice(idx, 1);
    }

    // Sound & Explosion
    sound.playExplosion(e.isBoss ? 'boss' : e.type === 'ASSAULT' || e.type === 'SNIPER' ? 'large' : 'medium');
    this.createExplosion(e.x, e.y, e.color, e.isBoss ? 50 : 20);
    this.screenShake = e.isBoss ? 25 : e.radius * 0.4;

    this.addScore(e.scoreValue);
    this.addFloatingText(e.x, e.y, `+${e.scoreValue * this.multiplier}`, e.color, 1.2);
    this.callbacks.onAchievementUnlock('first_kill');

    // Mine explosion bullets
    if (e.type === 'MINE') {
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        this.createEnemyBullet(e.x, e.y, Math.cos(angle) * 4.5, Math.sin(angle) * 4.5, 12, '#e11d48');
      }
    }

    // Asteroid splits into smaller debris and drops coins
    if (e.type === 'ASTEROID') {
      if (e.radius > 18) {
        for (let i = 0; i < 2; i++) {
          this.enemies.push({
            id: ++this.enemyIdCounter,
            type: 'ASTEROID',
            x: e.x + (i === 0 ? -15 : 15),
            y: e.y,
            vx: (i === 0 ? -1.8 : 1.8) + (Math.random() - 0.5),
            vy: 2.0 + Math.random(),
            width: 26,
            height: 26,
            radius: 13,
            health: 40,
            maxHealth: 40,
            scoreValue: 120,
            color: e.color,
            accentColor: e.accentColor,
            shootCooldown: 999,
            lastShot: 0,
            behaviorTimer: 0,
            state: 0,
            angle: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.06
          });
        }
      }
      // Asteroids have a 40% chance to drop coins when destroyed!
      if (Math.random() < 0.4) {
        this.spawnCoin(e.x, e.y, 1);
      }
    }

    // Boss Defeated
    if (e.isBoss) {
      this.currentBoss = null;
      this.callbacks.onBossStatus(false);
      this.callbacks.onAchievementUnlock('boss_1');
      sound.setBossMusic(false);

      if (e.isGiantBoss) {
        // Colossal Dreadnought Defeat: 3-Ring Mega Explosion + 15 coins + 5 powerups!
        for (let ring = 0; ring < 3; ring++) {
          setTimeout(() => {
            this.shockwaves.push({
              id: ++this.shockwaveIdCounter,
              x: e.x + (Math.random() - 0.5) * 40,
              y: e.y + (Math.random() - 0.5) * 30,
              radius: 40,
              maxRadius: Math.max(this.width, this.height) * 1.2,
              speed: 22 + ring * 4,
              color: ring === 0 ? '#ff0055' : ring === 1 ? '#00f3ff' : '#ffd700',
              alpha: 1.0,
              width: 20
            });
            this.screenShake = 18;
          }, ring * 250);
        }

        this.spawnPowerup(e.x - 60, e.y - 20, 'WEAPON_UPGRADE');
        this.spawnPowerup(e.x - 20, e.y, 'OVERDRIVE');
        this.spawnPowerup(e.x + 20, e.y, 'BOMB');
        this.spawnPowerup(e.x + 60, e.y - 20, 'REPAIR');
        this.spawnPowerup(e.x, e.y + 30, 'SHIELD');

        this.spawnCoin(e.x - 60, e.y + 10, 5);
        this.spawnCoin(e.x - 20, e.y + 20, 5);
        this.spawnCoin(e.x + 20, e.y + 20, 5);
        this.spawnCoin(e.x + 60, e.y + 10, 5);

        this.addFloatingText(this.width / 2, this.height / 2 - 20, '☠️ COLOSSAL DREADNOUGHT DESTROYED! ★', '#ffd700', 2.5);
      } else {
        // Sub-Boss Defeat: Shockwave + 6 coins + 3 powerups
        this.shockwaves.push({
          id: ++this.shockwaveIdCounter,
          x: e.x,
          y: e.y,
          radius: 30,
          maxRadius: Math.max(this.width, this.height),
          speed: 18,
          color: '#ec4899',
          alpha: 1.0,
          width: 14
        });
        this.screenShake = 10;

        this.spawnPowerup(e.x - 30, e.y, 'WEAPON_UPGRADE');
        this.spawnPowerup(e.x + 30, e.y, 'REPAIR');
        this.spawnPowerup(e.x, e.y + 20, 'SHIELD');

        this.spawnCoin(e.x - 30, e.y + 10, 3);
        this.spawnCoin(e.x + 30, e.y + 10, 3);

        this.addFloatingText(this.width / 2, this.height / 2 - 20, '⚠️ SUB-BOSS CRUSHED! ADVANCING...', '#39ff14', 2.2);
      }
    } else {
      // 35% chance to drop a collectible Coin from enemy
      if (Math.random() < 0.35) {
        this.spawnCoin(e.x, e.y, e.type === 'ASSAULT' || e.type === 'SNIPER' ? 2 : 1);
      }

      // 18% chance to drop a Power-up item
      if (Math.random() < 0.18) {
        this.spawnRandomPowerup(e.x, e.y);
      }
    }
  }

  public spawnCoin(x: number, y: number, value: number = 1) {
    this.powerups.push({
      id: ++this.powerupIdCounter,
      type: 'COIN',
      x,
      y,
      vx: (Math.random() - 0.5) * 2.5,
      vy: 1.2 + Math.random() * 0.8,
      radius: value > 1 ? 16 : 13,
      color: '#fbbf24',
      iconText: value > 1 ? `+${value}` : '🪙',
      pulseTimer: Math.random() * Math.PI,
      value
    });
  }

  private spawnRandomPowerup(x: number, y: number) {
    // Weighted random drop: Health repair (เพิ่มเลือด), 3-Way spread shot (กระสุน 3 ทาง), Weapon upgrade (เพิ่มระดับปืน), etc.
    const types: PowerupType[] = ['REPAIR', 'SPREAD', 'WEAPON_UPGRADE', 'SHIELD', 'LASER', 'MISSILE', 'BOMB', 'OVERDRIVE', 'COIN'];
    const weights = [20, 18, 18, 14, 10, 8, 6, 3, 3]; // percentage distribution

    let total = 0;
    const r = Math.random() * 100;
    let selected: PowerupType = 'WEAPON_UPGRADE';

    for (let i = 0; i < types.length; i++) {
      total += weights[i];
      if (r <= total) {
        selected = types[i];
        break;
      }
    }

    this.spawnPowerup(x, y, selected);
  }

  private spawnPowerup(x: number, y: number, type: PowerupType) {
    let iconText = 'UP';
    let color = '#00f3ff';

    switch (type) {
      case 'WEAPON_UPGRADE': iconText = 'LV+'; color = '#00f3ff'; break;
      case 'SPREAD': iconText = '3-WAY'; color = '#39ff14'; break;
      case 'LASER': iconText = 'LSR'; color = '#ff0055'; break;
      case 'MISSILE': iconText = 'MSL'; color = '#ffaa00'; break;
      case 'SHIELD': iconText = 'SHD'; color = '#a855f7'; break;
      case 'BOMB': iconText = 'BOMB'; color = '#06b6d4'; break;
      case 'REPAIR': iconText = 'HP+'; color = '#10b981'; break;
      case 'OVERDRIVE': iconText = 'OVD'; color = '#f43f5e'; break;
      case 'COIN': iconText = '🪙'; color = '#fbbf24'; break;
    }

    this.powerups.push({
      id: ++this.powerupIdCounter,
      type,
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 1.2,
      radius: 16,
      color,
      iconText,
      pulseTimer: 0,
      value: type === 'COIN' ? 3 : 1
    });
  }

  private collectPowerup(p: Powerup) {
    const pl = this.player;

    if (p.type === 'COIN') {
      sound.playCoin();
      const count = p.value || 1;
      pl.coins += count;
      this.addScore(150 * count);
      this.createExplosion(p.x, p.y, '#fbbf24', 10);
      this.addFloatingText(p.x, p.y - 20, `+${count} COIN${count > 1 ? 'S' : ''}!`, '#fbbf24', 1.4);
      this.callbacks.onScoreUpdate(pl.score, this.comboCount, this.multiplier, pl.coins);
      this.updatePlayerStats();
      return;
    }

    if (p.type === 'REPAIR') {
      sound.playHealthPickup();
      this.createExplosion(p.x, p.y, '#10b981', 14);
      this.addScore(400);
      pl.health = Math.min(pl.maxHealth, pl.health + 40);
      this.addFloatingText(p.x, p.y - 20, '+40 HP REPAIR!', '#10b981', 1.5);
      this.updatePlayerStats();
      return;
    }

    sound.playPowerup();
    this.createExplosion(p.x, p.y, p.color, 12);
    this.addScore(500);

    switch (p.type) {
      case 'WEAPON_UPGRADE':
        pl.weaponLevel = Math.min(5, pl.weaponLevel + 1);
        this.addFloatingText(p.x, p.y - 20, `WEAPON POWER LV.${pl.weaponLevel}!`, p.color, 1.5);
        break;

      case 'SPREAD':
        pl.weaponType = 'SPREAD';
        pl.weaponLevel = Math.max(2, pl.weaponLevel);
        this.addFloatingText(p.x, p.y - 20, '3-WAY SPREAD CANNON!', '#39ff14', 1.5);
        break;

      case 'LASER':
        pl.weaponType = 'LASER';
        this.addFloatingText(p.x, p.y - 20, 'PULSE LASER EQUIPPED!', p.color, 1.4);
        break;

      case 'MISSILE':
        pl.weaponType = 'MISSILE';
        this.addFloatingText(p.x, p.y - 20, 'SEEKER MISSILES EQUIPPED!', p.color, 1.4);
        break;

      case 'SHIELD':
        pl.shield = pl.maxShield;
        pl.isInvulnerable = true;
        pl.invulnerableTimer = 2.0;
        this.addFloatingText(p.x, p.y - 20, 'PLASMA SHIELD CHARGED!', p.color, 1.4);
        break;

      case 'BOMB':
        pl.bombs = Math.min(pl.maxBombs, pl.bombs + 1);
        this.addFloatingText(p.x, p.y - 20, '+1 EMP BOMB!', p.color, 1.4);
        break;

      case 'OVERDRIVE':
        pl.overdrive = 100;
        this.triggerOverdrive();
        break;
    }

    this.updatePlayerStats();
  }

  private damagePlayer(damage: number) {
    const pl = this.player;
    pl.shieldRechargeTimer = 0; // Reset shield regen delay

    // Absorb with shield first
    if (pl.shield > 0) {
      sound.playShieldHit();
      if (pl.shield >= damage) {
        pl.shield -= damage;
        this.addFloatingText(pl.x, pl.y - 30, `SHIELD -${Math.round(damage)}`, '#00f3ff', 1.1);
      } else {
        const remaining = damage - pl.shield;
        pl.shield = 0;
        pl.health -= remaining;
        this.addFloatingText(pl.x, pl.y - 30, `HULL -${Math.round(remaining)}`, '#ff0055', 1.2);
      }
    } else {
      sound.playExplosion('small');
      pl.health -= damage;
      this.addFloatingText(pl.x, pl.y - 30, `-${Math.round(damage)}`, '#ff0055', 1.2);
    }

    this.screenShake = 12;
    this.flashColor = '#ff0055';
    this.flashAlpha = 0.35;

    if (pl.health <= 0) {
      this.killPlayer();
    } else {
      pl.isInvulnerable = true;
      pl.invulnerableTimer = 1.5;
    }

    this.updatePlayerStats();
  }

  private killPlayer() {
    const pl = this.player;
    pl.lives--;
    sound.playExplosion('large');
    this.createExplosion(pl.x, pl.y, pl.color, 40);
    this.screenShake = 22;

    if (pl.lives > 0) {
      // Respawn with invulnerability
      pl.health = pl.maxHealth;
      pl.shield = pl.maxShield;
      pl.x = this.width / 2;
      pl.y = this.height - 100;
      pl.isInvulnerable = true;
      pl.invulnerableTimer = 3.5;
      pl.weaponLevel = Math.max(1, pl.weaponLevel - 1);
      this.addFloatingText(this.width / 2, this.height / 2, `SHIP DESTROYED - ${pl.lives} LIVES REMAINING`, '#ff0055', 1.6);
      this.updatePlayerStats();
    } else {
      // Game Over
      this.isRunning = false;
      sound.stopBGM();
      this.callbacks.onGameOver(pl.score, this.wave, pl.coins);
    }
  }

  // --- FX & PARTICLES ---

  private createHitSparks(x: number, y: number, color: string) {
    const sparkCount = this.graphicsQuality === 'low' ? 3 : this.graphicsQuality === 'medium' ? 5 : 8;
    
    // Prune particles if over budget
    if (this.particles.length > this.maxParticles) {
      this.particles.splice(0, this.particles.length - this.maxParticles + sparkCount);
    }

    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.8 + Math.random() * 1.5,
        color,
        alpha: 1.0,
        decay: this.graphicsQuality === 'low' ? 0.12 : 0.08,
        shape: 'spark'
      });
    }
  }

  private createExplosion(x: number, y: number, color: string, count?: number) {
    const defaultCount = this.graphicsQuality === 'low' ? 6 : this.graphicsQuality === 'medium' ? 10 : 18;
    const actualCount = count !== undefined 
      ? (this.graphicsQuality === 'low' ? Math.min(8, Math.round(count * 0.4)) : this.graphicsQuality === 'medium' ? Math.min(14, Math.round(count * 0.7)) : count)
      : defaultCount;

    // Prune particles if over budget
    if (this.particles.length + actualCount > this.maxParticles) {
      this.particles.splice(0, (this.particles.length + actualCount) - this.maxParticles);
    }

    for (let i = 0; i < actualCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.0 + Math.random() * 3.0,
        color,
        alpha: 1.0,
        decay: this.graphicsQuality === 'low' ? 0.06 : 0.04,
        shape: this.graphicsQuality !== 'low' && Math.random() < 0.25 ? 'ring' : 'spark'
      });
    }
  }

  private addFloatingText(x: number, y: number, text: string, color: string, scale: number = 1.0) {
    this.floatingTexts.push({
      id: ++this.textIdCounter,
      x,
      y,
      vy: -1.2,
      text,
      color,
      alpha: 1.0,
      scale
    });
  }

  private updateStarfield(dt: number) {
    for (const star of this.stars) {
      star.y += star.speed * this.hyperspaceSpeed * (dt * 60);
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
      star.brightness += (Math.random() - 0.5) * star.twinkleSpeed;
      star.brightness = Math.max(0.2, Math.min(1.0, star.brightness));
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96; // drag
      p.vy *= 0.96;
      p.alpha -= p.decay * (dt * 60);

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updatePowerups(dt: number) {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.pulseTimer += dt * 4;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;

      // Bounce off walls
      if (p.x < p.radius || p.x > this.width - p.radius) {
        p.vx *= -1;
      }

      if (p.y > this.height + 40) {
        this.powerups.splice(i, 1);
      }
    }
  }

  private updateShockwaves(dt: number) {
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.radius += s.speed * (dt * 60);
      s.alpha = 1.0 - (s.radius / s.maxRadius);

      if (s.radius >= s.maxRadius || s.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy;
      t.alpha -= 0.015 * (dt * 60);

      if (t.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private updateScreenFX(dt: number) {
    if (this.screenShake > 0) {
      this.screenShake *= 0.9;
      if (this.screenShake < 0.1) this.screenShake = 0;
    }

    if (this.flashAlpha > 0) {
      this.flashAlpha -= 0.05 * (dt * 60);
      if (this.flashAlpha < 0) this.flashAlpha = 0;
    }

    // Combo timer decay
    if (this.comboCount > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
        this.multiplier = 1;
        this.callbacks.onScoreUpdate(this.player.score, 0, 1, this.player.coins);
      }
    }
  }

  // --- RENDER PASS ---

  private render() {
    const ctx = this.ctx;

    // Reset & apply screen shake
    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Deep Space Void Background
    ctx.fillStyle = '#05050c';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Starfield & Nebula Glow
    this.renderStarfield(ctx);

    // Additive blending for neon glowing lasers & FX
    ctx.globalCompositeOperation = 'lighter';

    // 3. Shockwaves
    this.renderShockwaves(ctx);

    // 4. Powerups
    this.renderPowerups(ctx);

    // 5. Bullets
    this.renderBullets(ctx);

    // 6. Particles
    this.renderParticles(ctx);

    // 7. Normal Composite for Ships and Solids
    ctx.globalCompositeOperation = 'source-over';

    // Enemies
    this.renderEnemies(ctx);

    // Player Ship
    this.renderPlayer(ctx);

    // Additive pass for HUD popups & floating texts
    ctx.globalCompositeOperation = 'lighter';
    this.renderFloatingTexts(ctx);
    this.renderWaveBanner(ctx);

    // Screen Flash Overlay
    if (this.flashAlpha > 0 && this.flashColor) {
      ctx.fillStyle = this.flashColor;
      ctx.globalAlpha = this.flashAlpha;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }

  private renderStarfield(ctx: CanvasRenderingContext2D) {
    for (const star of this.stars) {
      ctx.fillStyle = star.color;
      ctx.globalAlpha = star.brightness;

      if (this.hyperspaceSpeed > 1.5) {
        // Hyperspace streak lines
        ctx.lineWidth = star.size;
        ctx.strokeStyle = star.color;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x, star.y + star.speed * this.hyperspaceSpeed * 4);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1.0;
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;

    // Flickering when invulnerable
    if (p.isInvulnerable && Math.floor(Date.now() / 80) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    const mainColor = p.isOverdriveActive ? '#ff0055' : p.color;
    const accent = p.accentColor;

    // Glowing Ship Chassis
    const useBloom = this.bloomEnabled && this.graphicsQuality === 'high';
    ctx.shadowBlur = useBloom ? 8 : 0;
    ctx.shadowColor = mainColor;
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 2.4;
    ctx.fillStyle = '#0a0d18';

    switch (p.shipType) {
      case 'PHANTOM':
        // Sleek Arrowhead Interceptor
        ctx.beginPath();
        ctx.moveTo(0, -p.height / 2); // Sharp nose
        ctx.lineTo(p.width / 2, p.height / 2); // Right wingtip
        ctx.lineTo(p.width / 3, p.height / 4);
        ctx.lineTo(p.width / 5, p.height / 2 - 2); // Right tail fin
        ctx.lineTo(0, p.height / 3); // Center engine notch
        ctx.lineTo(-p.width / 5, p.height / 2 - 2); // Left tail fin
        ctx.lineTo(-p.width / 3, p.height / 4);
        ctx.lineTo(-p.width / 2, p.height / 2); // Left wingtip
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner Cockpit Core
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, -p.height / 3);
        ctx.lineTo(4, 2);
        ctx.lineTo(-4, 2);
        ctx.closePath();
        ctx.stroke();
        break;

      case 'TITAN':
        // Heavy Wide Dreadnought
        ctx.beginPath();
        ctx.moveTo(-6, -p.height / 2 + 4);
        ctx.lineTo(6, -p.height / 2 + 4); // Wide blunt nose
        ctx.lineTo(p.width / 2, -p.height / 6); // Front armor shoulder
        ctx.lineTo(p.width / 2, p.height / 2); // Heavy right wing
        ctx.lineTo(p.width / 4, p.height / 3);
        ctx.lineTo(0, p.height / 2); // Triple engine bay
        ctx.lineTo(-p.width / 4, p.height / 3);
        ctx.lineTo(-p.width / 2, p.height / 2); // Heavy left wing
        ctx.lineTo(-p.width / 2, -p.height / 6); // Front armor shoulder
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Frontal Armor Plates & Core
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(-10, -p.height / 4);
        ctx.lineTo(10, -p.height / 4);
        ctx.lineTo(12, 10);
        ctx.lineTo(-12, 10);
        ctx.closePath();
        ctx.stroke();
        break;

      case 'AURORA':
        // Plasma Solar Crescent Cruiser
        ctx.beginPath();
        ctx.moveTo(0, -p.height / 2);
        ctx.quadraticCurveTo(p.width / 2 + 4, 0, p.width / 2 - 2, p.height / 2);
        ctx.lineTo(p.width / 4, p.height / 4);
        ctx.lineTo(0, p.height / 2 - 6);
        ctx.lineTo(-p.width / 4, p.height / 4);
        ctx.quadraticCurveTo(-p.width / 2 - 4, 0, -p.width / 2 + 2, p.height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Central Energy Core with Rotating Arc
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'VALKYRIE':
        // Swept Triple-Wing Striker
        ctx.beginPath();
        ctx.moveTo(0, -p.height / 2);
        ctx.lineTo(10, -p.height / 4);
        ctx.lineTo(p.width / 2, p.height / 4); // Outward missile hardpoint
        ctx.lineTo(p.width / 3, p.height / 2);
        ctx.lineTo(8, p.height / 3);
        ctx.lineTo(0, p.height / 2 - 4);
        ctx.lineTo(-8, p.height / 3);
        ctx.lineTo(-p.width / 3, p.height / 2);
        ctx.lineTo(-p.width / 2, p.height / 4);
        ctx.lineTo(-10, -p.height / 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Valkyrie Wing V-Lines
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-12, 2);
        ctx.lineTo(0, -12);
        ctx.lineTo(12, 2);
        ctx.stroke();
        break;

      case 'APEX':
        // Legendary Prismatic Flagship (Double Crystal Prow & Quad Nacelles)
        ctx.beginPath();
        ctx.moveTo(0, -p.height / 2 - 4); // Central lance
        ctx.lineTo(10, -p.height / 3);
        ctx.lineTo(p.width / 2 + 2, -p.height / 8); // Upper starboard wing
        ctx.lineTo(p.width / 2, p.height / 2); // Lower heavy nacelle
        ctx.lineTo(p.width / 4, p.height / 3);
        ctx.lineTo(0, p.height / 2 - 2); // Engine exhaust
        ctx.lineTo(-p.width / 4, p.height / 3);
        ctx.lineTo(-p.width / 2, p.height / 2); // Lower port nacelle
        ctx.lineTo(-p.width / 2 - 2, -p.height / 8); // Upper port wing
        ctx.lineTo(-10, -p.height / 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Prismatic Rainbow Crystal Core
        const apexPulse = Math.sin(Date.now() * 0.005);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(8, 0);
        ctx.lineTo(0, 14);
        ctx.lineTo(-8, 0);
        ctx.closePath();
        ctx.stroke();

        // Pulsing Energy Diamond
        ctx.fillStyle = `rgba(236, 72, 153, ${0.4 + apexPulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'CHRONOS':
        // Tachyon Interceptor with Dual Forward Prow Nacelles and Chrono Core
        ctx.beginPath();
        ctx.moveTo(0, -p.height / 2 + 6);
        ctx.lineTo(8, -p.height / 2 - 2); // Starboard needle
        ctx.lineTo(12, -p.height / 6);
        ctx.lineTo(p.width / 2, p.height / 4);
        ctx.lineTo(p.width / 3, p.height / 2);
        ctx.lineTo(6, p.height / 3);
        ctx.lineTo(0, p.height / 2 - 4);
        ctx.lineTo(-6, p.height / 3);
        ctx.lineTo(-p.width / 3, p.height / 2);
        ctx.lineTo(-p.width / 2, p.height / 4);
        ctx.lineTo(-12, -p.height / 6);
        ctx.lineTo(-8, -p.height / 2 - 2); // Port needle
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Chrono Gyro Ring
        const chronosRot = Date.now() * 0.006;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, 9, chronosRot, chronosRot + Math.PI * 1.5);
        ctx.stroke();
        break;

      case 'NEBULA':
        // Void Ghost Stealth Delta Striker
        ctx.beginPath();
        ctx.moveTo(0, -p.height / 2 - 2);
        ctx.lineTo(6, -p.height / 4);
        ctx.lineTo(p.width / 2 + 2, p.height / 3);
        ctx.lineTo(p.width / 4, p.height / 2);
        ctx.lineTo(4, p.height / 4);
        ctx.lineTo(0, p.height / 2 - 6);
        ctx.lineTo(-4, p.height / 4);
        ctx.lineTo(-p.width / 4, p.height / 2);
        ctx.lineTo(-p.width / 2 - 2, p.height / 3);
        ctx.lineTo(-6, -p.height / 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Phase Crystalline Singularity
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(6, 4);
        ctx.lineTo(-6, 4);
        ctx.closePath();
        ctx.stroke();
        break;

      case 'DREADNOUGHT':
        // Armored Citadel Super-Fortress
        ctx.beginPath();
        ctx.moveTo(-10, -p.height / 2 + 2);
        ctx.lineTo(10, -p.height / 2 + 2); // Triple battering prow
        ctx.lineTo(p.width / 2 + 4, -p.height / 8);
        ctx.lineTo(p.width / 2 + 2, p.height / 2);
        ctx.lineTo(p.width / 3, p.height / 2 + 2);
        ctx.lineTo(p.width / 6, p.height / 3);
        ctx.lineTo(0, p.height / 2);
        ctx.lineTo(-p.width / 6, p.height / 3);
        ctx.lineTo(-p.width / 3, p.height / 2 + 2);
        ctx.lineTo(-p.width / 2 - 2, p.height / 2);
        ctx.lineTo(-p.width / 2 - 4, -p.height / 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Heavy Armor Plating Lines
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-16, -4);
        ctx.lineTo(16, -4);
        ctx.moveTo(-12, 10);
        ctx.lineTo(12, 10);
        ctx.stroke();
        break;

      case 'SOLARIS':
        // Solar Flare Hyperion Cruiser
        ctx.beginPath();
        ctx.moveTo(0, -p.height / 2 - 4);
        ctx.lineTo(12, -p.height / 4);
        ctx.quadraticCurveTo(p.width / 2 + 6, 0, p.width / 2, p.height / 2);
        ctx.lineTo(p.width / 4, p.height / 3);
        ctx.lineTo(0, p.height / 2 - 4);
        ctx.lineTo(-p.width / 4, p.height / 3);
        ctx.quadraticCurveTo(-p.width / 2 - 6, 0, -p.width / 2, p.height / 2);
        ctx.lineTo(-12, -p.height / 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Solar Coronal Torus
        const solarGlow = Math.sin(Date.now() * 0.008);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(0, -2, 8 + solarGlow * 2, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'VOID_RAIDER':
        // Cosmic Annihilator Omega Flagship
        ctx.beginPath();
        ctx.moveTo(0, -p.height / 2 - 6); // Apex lance
        ctx.lineTo(10, -p.height / 3);
        ctx.lineTo(p.width / 2 + 4, -p.height / 6); // Forward blade
        ctx.lineTo(p.width / 2, p.height / 2);
        ctx.lineTo(p.width / 4, p.height / 3);
        ctx.lineTo(0, p.height / 2 - 2);
        ctx.lineTo(-p.width / 4, p.height / 3);
        ctx.lineTo(-p.width / 2, p.height / 2);
        ctx.lineTo(-p.width / 2 - 4, -p.height / 6); // Port blade
        ctx.lineTo(-10, -p.height / 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 5-Spike Antimatter Core Grid
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(10, 2);
        ctx.lineTo(0, 16);
        ctx.lineTo(-10, 2);
        ctx.closePath();
        ctx.stroke();
        break;

      case 'VIPER':
      default:
        // Classic Viper Striker
        ctx.beginPath();
        ctx.moveTo(0, -p.height / 2); // Nose
        ctx.lineTo(p.width / 2, p.height / 2); // Right wing
        ctx.lineTo(p.width / 4, p.height / 3); // Wing notch
        ctx.lineTo(0, p.height / 2 - 4); // Rear engine
        ctx.lineTo(-p.width / 4, p.height / 3); // Left wing notch
        ctx.lineTo(-p.width / 2, p.height / 2); // Left wing
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner Cockpit Core
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -p.height / 4);
        ctx.lineTo(6, 4);
        ctx.lineTo(0, 10);
        ctx.lineTo(-6, 4);
        ctx.closePath();
        ctx.stroke();
        break;
    }

    // Shield Bubble if shield active
    if (p.shield > 0) {
      const shieldRatio = p.shield / p.maxShield;
      ctx.strokeStyle = `rgba(0, 243, 255, ${0.4 + shieldRatio * 0.4})`;
      ctx.lineWidth = 2.0;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, p.width * 0.75, 0, Math.PI * 2);
      ctx.stroke();

      // Shield electric arc segments
      ctx.beginPath();
      const angleOffset = Date.now() * 0.003;
      ctx.arc(0, 0, p.width * 0.75, angleOffset, angleOffset + Math.PI * 0.6);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderEnemies(ctx: CanvasRenderingContext2D) {
    for (const e of this.enemies) {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle);

      ctx.shadowBlur = this.bloomEnabled ? 14 : 0;
      ctx.shadowColor = e.color;
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 2.2;
      ctx.fillStyle = '#0f0c1b';

      if (e.isBoss) {
        this.renderBossGraphic(ctx, e);
      } else {
        switch (e.type) {
          case 'SCOUT':
            // Sleek Downward Triangle
            ctx.beginPath();
            ctx.moveTo(0, e.height / 2);
            ctx.lineTo(e.width / 2, -e.height / 2);
            ctx.lineTo(0, -e.height / 4);
            ctx.lineTo(-e.width / 2, -e.height / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

          case 'ASSAULT':
            // Heavy Diamond Cruiser
            ctx.beginPath();
            ctx.moveTo(0, e.height / 2 + 4);
            ctx.lineTo(e.width / 2, 0);
            ctx.lineTo(e.width / 3, -e.height / 2);
            ctx.lineTo(-e.width / 3, -e.height / 2);
            ctx.lineTo(-e.width / 2, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Twin cannons
            ctx.strokeStyle = e.accentColor;
            ctx.beginPath();
            ctx.moveTo(-14, 0);
            ctx.lineTo(-14, e.height / 2);
            ctx.moveTo(14, 0);
            ctx.lineTo(14, e.height / 2);
            ctx.stroke();
            break;

          case 'STRIKER':
            // Angled Swept Stealth Wing
            ctx.beginPath();
            ctx.moveTo(0, e.height / 2);
            ctx.lineTo(e.width / 2, -e.height / 2);
            ctx.lineTo(0, 0);
            ctx.lineTo(-e.width / 2, -e.height / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

          case 'KAMIKAZE':
            // Dart arrowhead
            ctx.beginPath();
            ctx.moveTo(0, e.height / 2 + 6);
            ctx.lineTo(e.width / 2, -e.height / 2);
            ctx.lineTo(-e.width / 2, -e.height / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

          case 'SNIPER':
            // Long Barrel Needle
            ctx.beginPath();
            ctx.moveTo(0, e.height / 2 + 10);
            ctx.lineTo(6, 0);
            ctx.lineTo(e.width / 2, -e.height / 2);
            ctx.lineTo(-e.width / 2, -e.height / 2);
            ctx.lineTo(-6, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

          case 'MINE':
            // Spiked Pulsing Orb
            ctx.beginPath();
            ctx.arc(0, 0, e.radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            for (let s = 0; s < 6; s++) {
              const spAngle = (s * Math.PI * 2) / 6;
              ctx.beginPath();
              ctx.moveTo(Math.cos(spAngle) * e.radius * 0.7, Math.sin(spAngle) * e.radius * 0.7);
              ctx.lineTo(Math.cos(spAngle) * e.radius * 1.3, Math.sin(spAngle) * e.radius * 1.3);
              ctx.stroke();
            }
            break;

          case 'ASTEROID':
            // Jagged Polygon Rock
            ctx.beginPath();
            const verts = 7;
            for (let v = 0; v < verts; v++) {
              const vAngle = (v * Math.PI * 2) / verts;
              const r = e.radius * (0.8 + ((v % 2 === 0) ? 0.25 : -0.15));
              const px = Math.cos(vAngle) * r;
              const py = Math.sin(vAngle) * r;
              if (v === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        }
      }

      // Small Health Bar for Elite enemies (health > 80)
      if (!e.isBoss && e.maxHealth > 80 && e.health < e.maxHealth) {
        ctx.fillStyle = '#374151';
        ctx.fillRect(-20, -e.height / 2 - 10, 40, 4);
        ctx.fillStyle = e.color;
        ctx.fillRect(-20, -e.height / 2 - 10, 40 * (e.health / e.maxHealth), 4);
      }

      ctx.restore();
    }
  }

  private renderBossGraphic(ctx: CanvasRenderingContext2D, boss: Enemy) {
    const w = boss.width;
    const h = boss.height;
    const phase = boss.bossPhase || 1;
    const corePulse = Math.sin(boss.behaviorTimer * 6) * 4;

    if (boss.isGiantBoss) {
      // --- COLOSSAL GIANT DREADNOUGHT GRAPHIC ---
      // Heavy Outer Wings & Armor Pods
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, h / 2 + 20); // Central heavy prow
      ctx.lineTo(w * 0.25, h * 0.35);
      ctx.lineTo(w * 0.48, h * 0.2); // Outer starboard wingtip
      ctx.lineTo(w * 0.45, -h * 0.35); // Upper starboard stabilizer
      ctx.lineTo(w * 0.2, -h * 0.48); // Starboard thruster bay
      ctx.lineTo(-w * 0.2, -h * 0.48); // Port thruster bay
      ctx.lineTo(-w * 0.45, -h * 0.35); // Upper port stabilizer
      ctx.lineTo(-w * 0.48, h * 0.2); // Outer port wingtip
      ctx.lineTo(-w * 0.25, h * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4 Heavy Railgun Turrets on Starboard and Port
      ctx.fillStyle = boss.accentColor;
      [-w * 0.35, -w * 0.15, w * 0.15, w * 0.35].forEach((tx) => {
        ctx.fillRect(tx - 4, h * 0.15, 8, 18);
      });

      // Internal Fortress Armor Grooves
      ctx.strokeStyle = boss.accentColor;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-w * 0.3, -h * 0.1);
      ctx.lineTo(w * 0.3, -h * 0.1);
      ctx.moveTo(-w * 0.2, h * 0.1);
      ctx.lineTo(w * 0.2, h * 0.1);
      ctx.stroke();

      // Giant Pulsing Singularity Core
      const coreColor = phase === 3 ? '#ff0055' : phase === 2 ? '#f59e0b' : boss.color;
      ctx.fillStyle = coreColor;
      ctx.beginPath();
      ctx.arc(0, 0, 24 + corePulse * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Rotating Outer Doom Energy Conduit Rings
      ctx.strokeStyle = coreColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.38, boss.behaviorTimer * 1.8, boss.behaviorTimer * 1.8 + Math.PI * 1.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.42, -boss.behaviorTimer * 1.4, -boss.behaviorTimer * 1.4 + Math.PI * 1.1);
      ctx.stroke();

    } else {
      // --- SUB-BOSS (ELITE CORVETTE) GRAPHIC ---
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, h / 2 + 10);
      ctx.lineTo(w / 3, h / 4);
      ctx.lineTo(w / 2, -h / 4);
      ctx.lineTo(w / 4, -h / 2);
      ctx.lineTo(-w / 4, -h / 2);
      ctx.lineTo(-w / 2, -h / 4);
      ctx.lineTo(-w / 3, h / 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Twin Heavy Wing Pods
      ctx.fillStyle = boss.accentColor;
      ctx.fillRect(-w * 0.3 - 3, 0, 6, 14);
      ctx.fillRect(w * 0.3 - 3, 0, 6, 14);

      // Glowing Energy Core
      ctx.fillStyle = phase === 2 ? '#ff0055' : boss.color;
      ctx.beginPath();
      ctx.arc(0, 0, 14 + corePulse, 0, Math.PI * 2);
      ctx.fill();

      // Rotating Scanner Ring
      ctx.strokeStyle = boss.accentColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.38, boss.behaviorTimer * 2.5, boss.behaviorTimer * 2.5 + Math.PI);
      ctx.stroke();
    }
  }

  private renderBullets(ctx: CanvasRenderingContext2D) {
    // Under 'lighter' composite mode, paths glow naturally without CPU shadowBlur
    for (const b of this.bullets) {
      ctx.fillStyle = b.color;
      ctx.strokeStyle = b.color;

      if (b.type === 'LASER') {
        // High intensity beam rod
        ctx.lineWidth = b.radius * 1.8;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y + 12);
        ctx.lineTo(b.x, b.y - 12);
        ctx.stroke();
      } else if (b.type === 'MISSILE') {
        // Angled Missile body
        const angle = Math.atan2(b.vy, b.vx);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(angle);
        ctx.fillRect(-7, -2.5, 14, 5);
        ctx.restore();
      } else {
        // Glowing Orb / Pellet
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderPowerups(ctx: CanvasRenderingContext2D) {
    for (const p of this.powerups) {
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.type === 'COIN') {
        // Shimmering 3D Spinning Gold Coin
        const spinScale = Math.cos(p.pulseTimer * 3.5);
        ctx.scale(spinScale, 1.0);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.8;
        ctx.fillStyle = '#b45309';

        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner golden rim
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        // Central Coin Sign
        if (Math.abs(spinScale) > 0.3) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `900 ${p.value && p.value > 1 ? 10 : 12}px Orbitron, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.value && p.value > 1 ? `+${p.value}` : '★', 0, 1);
        }
      } else {
        const pulse = 1.0 + Math.sin(p.pulseTimer) * 0.12;
        ctx.scale(pulse, pulse);

        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.0;
        ctx.fillStyle = '#050a14';

        // Neon Cube Frame
        ctx.strokeRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
        ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);

        // Icon Text Label
        ctx.fillStyle = p.color;
        ctx.font = 'bold 10px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.iconText, 0, 0);
      }

      ctx.restore();
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      if (p.shape === 'ring') {
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1.0;
  }

  private renderShockwaves(ctx: CanvasRenderingContext2D) {
    for (const s of this.shockwaves) {
      ctx.globalAlpha = s.alpha;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    for (const t of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.color;
      ctx.font = `bold ${Math.round(15 * t.scale)}px Orbitron, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }

  private renderWaveBanner(ctx: CanvasRenderingContext2D) {
    if (this.waveBannerTimer <= 0) return;

    ctx.save();
    const alpha = Math.min(1.0, this.waveBannerTimer);
    ctx.globalAlpha = alpha;

    ctx.fillStyle = this.wave % 3 === 0 ? '#ff0055' : '#00f3ff';
    ctx.font = '900 28px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.waveBannerText, this.width / 2, this.height * 0.38);

    ctx.restore();
  }

  public cleanup() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    sound.stopBGM();
  }
}
