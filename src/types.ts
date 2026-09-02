export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

export type Language = 'TH' | 'EN';

export type ShipType = 
  | 'VIPER' 
  | 'PHANTOM' 
  | 'TITAN' 
  | 'AURORA' 
  | 'VALKYRIE' 
  | 'APEX' 
  | 'CHRONOS' 
  | 'NEBULA' 
  | 'DREADNOUGHT' 
  | 'SOLARIS' 
  | 'VOID_RAIDER';

export type WeaponType = 'BLASTER' | 'SPREAD' | 'LASER' | 'MISSILE';

export type PowerupType = 'WEAPON_UPGRADE' | 'SPREAD' | 'LASER' | 'MISSILE' | 'SHIELD' | 'BOMB' | 'REPAIR' | 'OVERDRIVE' | 'COIN';

export type EnemyType = 'SCOUT' | 'ASSAULT' | 'STRIKER' | 'MINE' | 'KAMIKAZE' | 'SNIPER' | 'ASTEROID' | 'BOSS';

export interface ShipConfig {
  id: ShipType;
  name: string;
  subtitle: string;
  subtitleTh: string;
  color: string;
  accentColor: string;
  speed: number;
  maxHealth: number;
  maxShield: number;
  specialAbility: string;
  specialAbilityTh: string;
  desc: string;
  descTh: string;
  isUnlockable?: boolean;
  unlockCostCoins?: number;
  unlockScoreRequired?: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  speed: number;
  shipType: ShipType;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  shieldRechargeTimer: number;
  lives: number;
  bombs: number;
  maxBombs: number;
  score: number;
  highScore: number;
  coins: number;
  weaponType: WeaponType;
  weaponLevel: number;
  lastShotTime: number;
  fireRate: number;
  isInvulnerable: boolean;
  invulnerableTimer: number;
  overdrive: number; // 0 to 100
  isOverdriveActive: boolean;
  overdriveTimer: number;
  color: string;
  accentColor: string;
  rotation: number;
  trail: { x: number; y: number; alpha: number; size: number }[];
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isPlayer: boolean;
  color: string;
  glowColor: string;
  type: WeaponType | 'ENEMY_NORMAL' | 'ENEMY_HEAVY' | 'ENEMY_LASER' | 'ENEMY_HOMING' | 'BOSS_ORB';
  angle?: number;
  target?: Enemy | null;
  pierce?: number;
  lifeTime?: number;
  maxLifeTime?: number;
}

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  scoreValue: number;
  color: string;
  accentColor: string;
  shootCooldown: number;
  lastShot: number;
  behaviorTimer: number;
  state: number;
  radius: number;
  angle: number;
  rotationSpeed: number;
  subEnemies?: Enemy[];
  isBoss?: boolean;
  isSubBoss?: boolean;
  isGiantBoss?: boolean;
  bossPhase?: number;
  maxBossPhases?: number;
  bossName?: string;
  bossSubtitle?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape: 'circle' | 'spark' | 'ring' | 'line' | 'star';
  rotation?: number;
  rotationSpeed?: number;
}

export interface Powerup {
  id: number;
  type: PowerupType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  iconText: string;
  duration?: number;
  pulseTimer: number;
  value?: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  layer: number;
  twinkleSpeed: number;
  brightness: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
}

export interface Shockwave {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  color: string;
  alpha: number;
  width: number;
}

export interface HighScoreEntry {
  name: string;
  score: number;
  wave: number;
  ship: ShipType;
  date: string;
  coins?: number;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  crtScanlines: boolean;
  bloomGlow: boolean;
  particlesDensity: 'low' | 'medium' | 'high';
  graphicsQuality: 'low' | 'medium' | 'high';
  performanceMode: boolean;
  touchControls: boolean;
}
