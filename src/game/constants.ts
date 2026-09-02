import { ShipConfig, ShipType } from '../types';

export const SHIPS: Record<ShipType, ShipConfig> = {
  VIPER: {
    id: 'VIPER',
    name: 'VIPER-X',
    subtitle: 'Balanced Striker',
    subtitleTh: 'ยานจู่โจมสมดุล',
    color: '#00f3ff', // Cyan
    accentColor: '#3b82f6',
    speed: 6.5,
    maxHealth: 100,
    maxShield: 100,
    specialAbility: 'Rapid Fire & Balanced Agility',
    specialAbilityTh: 'ปืนคู่ยิงเร็ว • ความคล่องตัวสูงรอบด้าน',
    desc: 'The standard interstellar combat fighter. High maneuverability and fast weapon reload rates.',
    descTh: 'ยานรบมาตรฐานแห่งสหพันธ์อวกาศ คล่องตัวสูง อัตราการยิงเสถียร เหมาะสำหรับทุกสมรภูมิ'
  },
  PHANTOM: {
    id: 'PHANTOM',
    name: 'PHANTOM-9',
    subtitle: 'High-Speed Interceptor',
    subtitleTh: 'ยานสกัดกั้นความเร็วสูง',
    color: '#ff0055', // Hot Pink / Crimson
    accentColor: '#fb7185',
    speed: 8.2,
    maxHealth: 75,
    maxShield: 75,
    specialAbility: 'Overdrive Boost & Critical Lasers',
    specialAbilityTh: 'ความเร็วสูงสุด • ลำแสงเลเซอร์ติดคริติคอล',
    desc: 'Lightweight hyper-stealth interceptor. Blazing speed with devastating critical laser strikes.',
    descTh: 'ยานสกัดกั้นน้ำหนักเบา โดดเด่นด้วยความเร็วการเคลื่อนที่ทะลุพิกัด และเลเซอร์เจาะเกราะทรงพลัง'
  },
  TITAN: {
    id: 'TITAN',
    name: 'TITAN-MAX',
    subtitle: 'Heavy Dreadnought',
    subtitleTh: 'ยานเกราะประจัญบานหนัก',
    color: '#39ff14', // Neon Green / Gold
    accentColor: '#eab308',
    speed: 5.0,
    maxHealth: 150,
    maxShield: 150,
    specialAbility: 'Fortified Armor & Extra Bomb Volley',
    specialAbilityTh: 'เกราะหนาพิเศษ • ระเบิด EMP เริ่มต้น 4 ลูก',
    desc: 'Armored fortress built to withstand intense barrage. Starts with extra shielding and heavier artillery.',
    descTh: 'ป้อมปราการหุ้มเกราะหนาแน่น ทนทานต่อการชนและห่ากระสุน พร้อมระเบิดล้างจอจำนวนมาก'
  },
  AURORA: {
    id: 'AURORA',
    name: 'AURORA-SOLAR',
    subtitle: 'Plasma Energy Cruiser',
    subtitleTh: 'ยานลาดตระเวนพลังงานพลาสมา',
    color: '#c084fc', // Neon Violet / Purple
    accentColor: '#e879f9',
    speed: 6.2,
    maxHealth: 90,
    maxShield: 130,
    specialAbility: 'Rapid Shield Recharge & Energy Wave',
    specialAbilityTh: 'ฟื้นฟูเกราะไว x2 • คลื่นพลังงานพลาสมา',
    desc: 'Energy-focused cruiser equipped with solar converters that rapidly regenerate plasma shields.',
    descTh: 'ยานรบพลังงานโซลาร์ ติดตั้งระบบรีชาร์จเกราะป้องกันเร็วขึ้น 2 เท่า เมื่อไม่โดนโจมตี'
  },
  VALKYRIE: {
    id: 'VALKYRIE',
    name: 'VALKYRIE-WING',
    subtitle: 'Multi-Spread Striker',
    subtitleTh: 'ยานรบปืนกระจายรอบทิศ',
    color: '#f59e0b', // Solar Amber / Gold
    accentColor: '#f97316',
    speed: 7.0,
    maxHealth: 95,
    maxShield: 85,
    specialAbility: 'Enhanced 3-Way Spread & Fast Overdrive',
    specialAbilityTh: 'ปืนกระจาย 3 ทิศกว้างพิเศษ • สะสม Overdrive เร็วขึ้น',
    desc: 'Advanced swept-wing fighter designed for crowd control with wider spread shot angles and faster overdrive charge.',
    descTh: 'ยานปีกสยายรุ่นพิเศษ ปืนกระจายกว้างกวาดฝูงศัตรูได้ดีเยี่ยม และสะสมเกจคลั่ง Overdrive เร็วขึ้น'
  },
  APEX: {
    id: 'APEX',
    name: '★ APEX-OBLIVION',
    subtitle: 'Legendary Super Flagship',
    subtitleTh: 'สุดยอดยานรบระดับตำนาน (ปลดล็อคด้วยแต้ม)',
    color: '#ec4899', // Prismatic Neon Fuchsia / Gold
    accentColor: '#00f3ff',
    speed: 7.6,
    maxHealth: 140,
    maxShield: 140,
    specialAbility: 'Quad Antimatter Cannons & 5 EMP Bombs',
    specialAbilityTh: 'ปืนใหญ่ปฏิสสาร 4 ลำกล้อง • ระเบิด EMP เริ่มต้น 5 ลูก',
    desc: 'Ancient alien experimental super-vessel. Massive firepower, hyper-durability, and devastation array.',
    descTh: 'ยานรบระดับตำนานขั้นสูงสุด สร้างจากเทคโนโลยีเอเลี่ยนโบราณ พลังทำลายล้างสูงสุดและทนทานเป็นเลิศ',
    isUnlockable: true,
    unlockCostCoins: 80,
    unlockScoreRequired: 20000
  },
  CHRONOS: {
    id: 'CHRONOS',
    name: '★ CHRONOS-TEMPEST',
    subtitle: 'Quantum Tachyon Interceptor',
    subtitleTh: 'ยานควอนตัมกาลเวลา (ปลดล็อคด้วยแต้ม)',
    color: '#06b6d4', // Cyan / Teal
    accentColor: '#10b981', // Emerald
    speed: 8.8,
    maxHealth: 110,
    maxShield: 110,
    specialAbility: 'Tachyon Homing Pulse & Micro Time-Warp',
    specialAbilityTh: 'กระสุนแทคยอนติดตามเป้า • อัตรายิงความเร็วแสง',
    desc: 'Equipped with a quantum tachyon drive that warps spacetime, unleashing hyper-speed homing energy bolts.',
    descTh: 'ติดตั้งเครื่องยนต์ควอนตัมแทคยอนบิดเบือนมิติ ยิงกระสุนพลังงานติดตามศัตรูอัตโนมัติด้วยความเร็วเหนือแสง',
    isUnlockable: true,
    unlockCostCoins: 100,
    unlockScoreRequired: 25000
  },
  NEBULA: {
    id: 'NEBULA',
    name: '★ NEBULA-GHOST',
    subtitle: 'Void Phase Infiltrator',
    subtitleTh: 'ยานเงาอวกาศไร้ตัวตน (ปลดล็อคด้วยแต้ม)',
    color: '#8b5cf6', // Electric Violet
    accentColor: '#38bdf8', // Sky Blue
    speed: 7.8,
    maxHealth: 105,
    maxShield: 125,
    specialAbility: 'Phase Shift Reflex & Piercing Void Beams',
    specialAbilityTh: 'เลเซอร์เจาะทะลุเกราะ • อัตราหลบหลีกฉุกเฉิน',
    desc: 'Experimental stealth craft capable of phasing through enemy fire while slicing hulls with singularity lasers.',
    descTh: 'ยานล่องหนเทคโนโลยีซิงกูลาริตี้ ลำแสงเลเซอร์เจาะทะลุศัตรูทุกแถว พร้อมระบบหลบหลีกความเสียหายฉุกเฉิน',
    isUnlockable: true,
    unlockCostCoins: 130,
    unlockScoreRequired: 32000
  },
  DREADNOUGHT: {
    id: 'DREADNOUGHT',
    name: '★ ECLIPSE-FORTRESS',
    subtitle: 'Colossal Citadel Dreadnought',
    subtitleTh: 'ยานป้อมปราการสุริยคราส (ปลดล็อคด้วยแต้ม)',
    color: '#ef4444', // Heavy Crimson
    accentColor: '#fbbf24', // Amber Gold
    speed: 5.2,
    maxHealth: 180,
    maxShield: 180,
    specialAbility: 'Heavy Armor Citadel & 6 EMP Megaton Bombs',
    specialAbilityTh: 'เกราะเหล็กกล้า 180 HP • ระเบิด EMP เริ่มต้น 6 ลูก',
    desc: 'A colossal mobile fortress. Boasts impenetrable titanium hull plating and a devastating payload of 6 EMP bombs.',
    descTh: 'ป้อมปราการเคลื่อนที่ขนาดยักษ์ เกราะไทเทเนียมหนาสูงสุด 180 HP/SHD พร้อมระเบิด EMP ทำลายล้าง 6 ลูก',
    isUnlockable: true,
    unlockCostCoins: 160,
    unlockScoreRequired: 40000
  },
  SOLARIS: {
    id: 'SOLARIS',
    name: '★ SOLARIS-HYPERION',
    subtitle: 'Solar Flare Super Cruiser',
    subtitleTh: 'ยานสุริยะเพลิงอสูร (ปลดล็อคด้วยแต้ม)',
    color: '#f97316', // Neon Orange
    accentColor: '#fde047', // Solar Yellow
    speed: 7.2,
    maxHealth: 130,
    maxShield: 150,
    specialAbility: 'Solar Plasma Nova & Dual Energy Siphon',
    specialAbilityTh: 'ปืนใหญ่พลาสมาสุริยะ 5 แฉก • ฟื้นฟูเกราะดูดซับพลังงาน',
    desc: 'Harnesses stellar nuclear fusion to unleash continuous waves of superheated solar plasma at hostile armadas.',
    descTh: 'ดึงพลังงานนิวเคลียร์ฟิวชันจากดวงดาว ปลดปล่อยคลื่นพลาสมาสุริยะ 5 แฉกเผาผลาญศัตรูทั้งกองทัพ',
    isUnlockable: true,
    unlockCostCoins: 190,
    unlockScoreRequired: 48000
  },
  VOID_RAIDER: {
    id: 'VOID_RAIDER',
    name: '★ VOID-RAIDER OMEGA',
    subtitle: 'Ultimate Cosmic Annihilator',
    subtitleTh: 'สุดยอดยานพิฆาตมิติกาแล็กซี (ปลดล็อคระดับสูงสุด)',
    color: '#14b8a6', // Teal / Jade
    accentColor: '#f43f5e', // Rose Neon
    speed: 8.5,
    maxHealth: 160,
    maxShield: 160,
    specialAbility: 'Pentastrike Antimatter Barrage & Infinite Energy Surge',
    specialAbilityTh: 'ปืนปฏิสสาร 5 ลำกล้อง • อัตราการยิงสูงสุด x2',
    desc: 'The pinnacle of interstellar supreme combat. Emits pentastrike antimatter volleys and charges Overdrive twice as fast.',
    descTh: 'สุดยอดยานรบไร้พ่ายแห่งจักรวาล ปืนใหญ่ปฏิสสาร 5 ลำกล้อง อัตรายิงเร็วสูงสุด และสะสม Overdrive ไวเป็น 2 เท่า',
    isUnlockable: true,
    unlockCostCoins: 240,
    unlockScoreRequired: 60000
  }
};

export const INITIAL_SETTINGS = {
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.7,
  musicVolume: 0.4,
  crtScanlines: false,
  bloomGlow: false,
  particlesDensity: 'low' as const,
  graphicsQuality: 'low' as const,
  performanceMode: true,
  touchControls: false
};

export const POWERUP_CONFIG = {
  WEAPON_UPGRADE: {
    name: 'WEAPON UP',
    color: '#00f3ff',
    iconText: 'UP',
    desc: 'Upgrades primary cannon power and spread'
  },
  SPREAD: {
    name: 'SPREAD CANNON',
    color: '#39ff14',
    iconText: 'SPD',
    desc: 'Multi-angle neon bullet spray'
  },
  LASER: {
    name: 'PULSE LASER',
    color: '#ff0055',
    iconText: 'LSR',
    desc: 'High-damage piercing beam'
  },
  MISSILE: {
    name: 'SEEKER MISSILES',
    color: '#ffaa00',
    iconText: 'MSL',
    desc: 'Homing missiles targeting nearest threats'
  },
  SHIELD: {
    name: 'PLASMA SHIELD',
    color: '#a855f7',
    iconText: 'SHD',
    desc: 'Full shield recharge + temporary invincibility'
  },
  BOMB: {
    name: 'EMP SUPER BOMB',
    color: '#06b6d4',
    iconText: 'BOMB',
    desc: '+1 EMP shockwave bomb'
  },
  REPAIR: {
    name: 'NANO REPAIR',
    color: '#10b981',
    iconText: 'REP',
    desc: 'Restores 50% Hull Integrity'
  },
  OVERDRIVE: {
    name: 'HYPER OVERDRIVE',
    color: '#f43f5e',
    iconText: 'OVD',
    desc: 'Instant Hyper-Speed bullet storm frenzy!'
  }
};

export const DEFAULT_HIGH_SCORES = [
  { name: 'NEO', score: 85000, wave: 8, ship: 'PHANTOM' as ShipType, date: '2026-08-30' },
  { name: 'ACE', score: 62000, wave: 6, ship: 'VIPER' as ShipType, date: '2026-08-28' },
  { name: 'VAL', score: 48000, wave: 5, ship: 'TITAN' as ShipType, date: '2026-08-25' },
  { name: 'CYB', score: 35000, wave: 4, ship: 'VIPER' as ShipType, date: '2026-08-20' },
  { name: 'REX', score: 21000, wave: 3, ship: 'PHANTOM' as ShipType, date: '2026-08-15' }
];

export const INITIAL_ACHIEVEMENTS = [
  { id: 'first_kill', title: 'First Blood', desc: 'Destroy your first enemy ship', icon: 'Crosshair', unlocked: false },
  { id: 'combo_5', title: 'Arcade Combo x5', desc: 'Reach a 5x score combo multiplier', icon: 'Zap', unlocked: false },
  { id: 'wave_3', title: 'Deep Sector', desc: 'Survive and reach Wave 3', icon: 'Compass', unlocked: false },
  { id: 'boss_1', title: 'Titan Slayer', desc: 'Defeat the Stage 1 Cyber Hydra Boss', icon: 'Skull', unlocked: false },
  { id: 'bomb_master', title: 'Shockwave Master', desc: 'Wipe 10+ bullets simultaneously with an EMP Bomb', icon: 'Radio', unlocked: false },
  { id: 'overdrive_rush', title: 'Hyper Drive', desc: 'Activate Hyper Overdrive Frenzy Mode', icon: 'Flame', unlocked: false },
  { id: 'score_50k', title: 'Ace Pilot', desc: 'Achieve a score of 50,000 points', icon: 'Trophy', unlocked: false }
];
