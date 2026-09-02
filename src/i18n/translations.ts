import { Language } from '../types';

export interface SectorInfo {
  level: number;
  sectorName: string;
  sectorNameTh: string;
  subtitle: string;
  subtitleTh: string;
  desc: string;
  descTh: string;
  hazard: string;
  hazardTh: string;
  color: string;
  badgeColor: string;
}

export const SECTORS: SectorInfo[] = [
  {
    level: 1,
    sectorName: 'SECTOR 1: ORION NEBULA',
    sectorNameTh: 'เลเวล 1: เนบิวลาโอไรออน (Orion Nebula)',
    subtitle: '10 Stages • Sub-Boss (W5) • Colossal Omega (W10)',
    subtitleTh: '10 ด่าน • บอสรองด่าน 5 • บอสยานยักษ์ด่าน 10',
    desc: '10 Stages. Stage 5 spawns Cyber Scout Dread-Mini; Stage 10 spawns the Gigantic Dreadnought Omega.',
    descTh: '10 ด่าน: ด่านที่ 5 พบบอสรอง Cyber Scout Dread-Mini และด่านที่ 10 พบบอสยานยักษ์ Gigantic Dreadnought Omega',
    hazard: 'W5: Sub-Boss Dread-Mini | W10: ★ Giant Dreadnought Omega',
    hazardTh: 'ด่าน 5: บอสรอง Dread-Mini | ด่าน 10: ★ บอสยักษ์ Dreadnought Omega',
    color: '#00f3ff',
    badgeColor: 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
  },
  {
    level: 2,
    sectorName: 'SECTOR 2: ASTEROID BELT',
    sectorNameTh: 'เลเวล 2: แถบดาวเคราะห์น้อย (Asteroid Belt)',
    subtitle: '10 Stages • Sub-Boss (W5) • Colossal Goliath (W10)',
    subtitleTh: '10 ด่าน • บอสรองด่าน 5 • บอสยานยักษ์ด่าน 10',
    desc: '10 Stages. Dense asteroid swarms. Stage 5: Plasma Cracker Mk-II; Stage 10: Colossal Plasma Goliath.',
    descTh: '10 ด่าน: ฝูงอุกกาบาตหนาแน่น ด่านที่ 5 พบบอสรอง Plasma Cracker Mk-II และด่านที่ 10 พบบอสยักษ์ Colossal Plasma Goliath',
    hazard: 'W5: Sub-Boss Plasma Cracker | W10: ★ Colossal Plasma Goliath',
    hazardTh: 'ด่าน 5: บอสรอง Plasma Cracker | ด่าน 10: ★ บอสยักษ์ Plasma Goliath',
    color: '#39ff14',
    badgeColor: 'border-emerald-500 bg-emerald-950/60 text-emerald-300'
  },
  {
    level: 3,
    sectorName: 'SECTOR 3: DREADNOUGHT DOCK',
    sectorNameTh: 'เลเวล 3: ฐานทัพยานแม่ยักษ์ (Dreadnought Dock)',
    subtitle: '10 Stages • Sub-Boss (W5) • Titanic Leviathan (W10)',
    subtitleTh: '10 ด่าน • บอสรองด่าน 5 • บอสยานยักษ์ด่าน 10',
    desc: '10 Stages. Dark space fortress. Stage 5: Void Phantom; Stage 10: Titanic Void Leviathan.',
    descTh: '10 ด่าน: ป้อมปราการอวกาศลึก ด่านที่ 5 พบบอสรอง Void Phantom และด่านที่ 10 พบบอสยักษ์ Titanic Void Leviathan',
    hazard: 'W5: Sub-Boss Void Phantom | W10: ★ Titanic Void Leviathan',
    hazardTh: 'ด่าน 5: บอสรอง Void Phantom | ด่าน 10: ★ บอสยักษ์ Void Leviathan',
    color: '#a855f7',
    badgeColor: 'border-purple-500 bg-purple-950/60 text-purple-300'
  },
  {
    level: 4,
    sectorName: 'SECTOR 4: PLASMA VOID',
    sectorNameTh: 'เลเวล 4: ห้วงสุญญากาศพลาสมา (Plasma Void)',
    subtitle: '10 Stages • Sub-Boss (W5) • Solar Juggernaut (W10)',
    subtitleTh: '10 ด่าน • บอสรองด่าน 5 • บอสยานยักษ์ด่าน 10',
    desc: '10 Stages. Hyper-velocity plasma storm. Stage 5: Solar Striker Titan-V; Stage 10: Solar Juggernaut.',
    descTh: '10 ด่าน: พายุพลังงานพลาสมา ด่านที่ 5 พบบอสรอง Solar Striker และด่านที่ 10 พบบอสยักษ์ Solar Juggernaut',
    hazard: 'W5: Sub-Boss Solar Striker | W10: ★ Cybernetic Solar Juggernaut',
    hazardTh: 'ด่าน 5: บอสรอง Solar Striker | ด่าน 10: ★ บอสยักษ์ Solar Juggernaut',
    color: '#f59e0b',
    badgeColor: 'border-amber-500 bg-amber-950/60 text-amber-300'
  },
  {
    level: 5,
    sectorName: 'SECTOR 5: COSMIC SINGULARITY',
    sectorNameTh: 'เลเวล 5: จุดดับเอกภพ (Cosmic Singularity)',
    subtitle: '10 Stages • Sub-Boss (W5) • Apex Doomsday Flagship (W10)',
    subtitleTh: '10 ด่าน • บอสรองด่าน 5 • บอสยานยักษ์ด่าน 10',
    desc: '10 Stages. Center of singularity. Stage 5: Abyssal Guardian X; Stage 10: Ultimate Apex Doomsday Flagship.',
    descTh: '10 ด่าน: จุดดับเอกภพ ด่านที่ 5 พบบอสรอง Abyssal Guardian X และด่านที่ 10 พบบอสยักษ์สูงสุด Ultimate Apex Flagship',
    hazard: 'W5: Sub-Boss Abyssal Guardian | W10: ★ Apex Doomsday Flagship',
    hazardTh: 'ด่าน 5: บอสรอง Abyssal Guardian | ด่าน 10: ★ บอสยักษ์ Doomsday Flagship',
    color: '#ff0055',
    badgeColor: 'border-pink-500 bg-pink-950/60 text-pink-300'
  }
];

export const TRANSLATIONS = {
  TH: {
    gameTitle: 'NEON SPACE SHOOTER',
    subtitle: 'ปกป้องกาแล็กซี • พิชิตบอสยานแม่ยักษ์ • ปลดปล่อยโหมดคลั่ง OVERDRIVE',
    retroBadge: 'เกมขับยานยิงอาร์เคดยุค 80s แสงนีออน 60FPS',
    
    // Pilot input step
    pilotStepTitle: 'กรุณากรอกชื่อนักบินสำหรับจัดอันดับ',
    pilotInputPlaceholder: 'ชื่อนักบิน (เช่น ACE, SKY, STAR)',
    pilotInputHint: 'ชื่อนี้จะถูกบันทึกในตารางคะแนนสูงสุด (Leaderboard)',
    btnNextToSector: 'ถัดไป: เลือกเลเวลสมรภูมิ ➔',
    btnNextToShip: 'ถัดไป: เลือกยานรบ (NEXT: CHOOSE SHIP) ➔',
    btnBack: '◀ ย้อนกลับ',
    btnBackToSector: '◀ ย้อนกลับไปเลือกด่าน',

    // Sector step
    selectSectorTitle: 'เลือกเลเวลสมรภูมิ (5 SECTORS)',
    selectSectorSubtitle: 'เลือกด่านที่คุณต้องการเริ่มภารกิจรบอวกาศ',
    levelLabel: 'เลเวล',
    hazardLabel: 'ภัยคุกคาม',
    
    // Ship Select Step 3
    selectShipTitle: 'เลือกยานรบประจำการ (5 ลำฟรี + 6 ลำปลดล็อคด้วยแต้ม)',
    selectShipSubtitle: 'เลื่อนขึ้น-ลงเพื่อดูยานรบทั้งหมด 11 ลำ และเลือกยานที่ต้องการนำไปออกรบ',
    scrollShipHint: '↕ เลื่อนขึ้น-ลงเพื่อดูยานรบทั้งหมด 11 ลำ',
    freeShipBadge: 'ยานฟรี',
    unlockableShipBadge: '🔒 ปลดล็อคด้วยแต้ม',
    unlockedBadge: '✓ ปลดล็อคแล้ว',
    unlockCostNotice: 'ใช้เหรียญทองที่เก็บสะสมเพื่อปลดล็อคยานถาวร',
    unlockShipBtn: '🔓 ปลดล็อคยานรบ',
    unlockSuccess: 'ปลดล็อคยานรบสำเร็จ!',
    coinsBalance: 'เหรียญสะสมของคุณ',
    statSpeed: 'ความเร็ว',
    statHullShield: 'เกราะ & พลังชีวิต',
    statSpecial: 'ความสามารถพิเศษ',
    btnLaunch: '🚀 ปล่อยยานรบ • เริ่มเกม [START BATTLE]',

    // Boss & Wave labels
    subBossLabel: '⚠️ บอสรอง (SUB-BOSS)',
    giantBossLabel: '☠️ บอสหลัก ยานรบยักษ์ (COLOSSAL BOSS)',
    waveStructureHint: '⭐ แต่ละเลเวลมี 10 ด่าน (ด่าน 5: เจอบอสรอง • ด่าน 10: เจอบอสหลักยานลำยักษ์)',

    // Tabs
    tabPlay: 'เลือกด่าน & ยานรบ',
    tabLeaderboard: 'ตารางคะแนนสูงสุด',
    tabAchievements: 'เหรียญเกียรติยศ',
    tabHowToPlay: 'วิธีเล่น & ควบคุม',

    // Quick Top Guide Bar
    quickGuideTitle: '🎮 วิธีควบคุม:',
    quickGuideMove: 'A / D หรือ ลากนิ้วบนจอ (เลี้ยวหลบ)',
    quickGuideFire: 'Spacebar / คลิกเมาส์ (ยิงกระสุน)',
    quickGuideSwitch: 'ปุ่ม Q/E หรือคลิกปุ่ม HUD (สลับปืน)',
    quickGuideBomb: 'X / B (ระเบิด EMP)',
    quickGuideOverdrive: 'C / F (โหมดคลั่ง)',
    quickItemsTitle: '💎 ไอเทม & อาวุธ:',
    quickCoin: '🪙 เหรียญทอง (คะแนนพิเศษ)',
    quickBlaster: '⚡ ปืนยิงตรง (Single Blaster)',
    quickSpread: '🔥 ปืนกระจาย 3 ทิศ (3-Way Spread)',
    quickShield: '🛡️ เกราะกำบัง (Plasma Shield)',
    quickRepair: '❤️ ซ่อมพลังยาน (Repair HP)',
    quickBomb: '💣 ระเบิดล้างจอ (EMP Bomb)',

    // HUD labels
    hudScore: 'คะแนน',
    hudCoins: 'เหรียญ',
    hudHighScore: 'คะแนนสูงสุด',
    hudSector: 'ด่าน / เลเวล',
    hudHull: 'พลังชีวิตยาน (HULL)',
    hudShield: 'เกราะพลาสมา (SHIELD)',
    hudWeaponLv: 'ระดับปืน',
    hudSwitchWeapon: 'สลับประเภทปืน',
    hudRestart: 'เริ่มเกมใหม่',
    hudPause: 'หยุดเกม',
    hudEmp: 'ระเบิด EMP',
    hudOverdrive: 'โหมดคลั่ง',
    hudActive: 'เปิดใช้งานอยู่',
    hudReady: 'พร้อมใช้ [C]',

    // Pause & GameOver
    pauseTitle: 'หยุดเกมชั่วคราว',
    pauseResume: 'เล่นต่อ',
    pauseRestart: 'เริ่มเล่นใหม่',
    pauseHome: 'กลับหน้าแรก',
    gameOverTitle: 'ภารกิจล้มเหลว (GAME OVER)',
    finalScore: 'คะแนนรวม',
    finalSector: 'ไปถึงด่าน',
    finalCoins: 'เหรียญที่เก็บได้',
    saveScoreBtn: 'บันทึกคะแนน',
    savedSuccess: 'บันทึกคะแนนลง Leaderboard เรียบร้อย!',
    btnPlayAgain: 'เล่นใหม่อีกครั้ง',

    // Graphics & Performance settings
    gfxTitle: '⚡ การปรับแต่งกราฟฟิก & ลดอาการกระตุก',
    gfxQuality: 'คุณภาพกราฟฟิก (GRAPHICS FX)',
    gfxLow: '⚡ ต่ำ (ลื่นไหลพิเศษ / ไม่กระตุก)',
    gfxMed: '⚖️ ปานกลาง (สมดุล)',
    gfxHigh: '✨ สูง (เอฟเฟกต์เต็ม)',
    gfxLowHint: 'ปิดแสงเงาหนัก ลดจำนวนดาวและสะเก็ดระเบิดเพื่อความลื่นไหล 60 FPS',
    gfxBloomGlow: 'แสงนีออนสะท้อน (Neon Glow)',
    gfxCrtLines: 'เส้นสแกนตู้เกม (CRT Scanlines)',
    gfxSound: 'เสียงเอฟเฟกต์ (Audio Synth)',
    hudFxToggle: 'กราฟฟิก',

    // Language Toggle
    langSwitch: '🇹🇭 TH | ภาษาไทย',
  },
  EN: {
    gameTitle: 'NEON SPACE SHOOTER',
    subtitle: 'DEFEND THE GALAXY • DEFEAT TITAN BOSSES • MASTER THE OVERDRIVE',
    retroBadge: 'ARCADE VECTOR RETRO SHOOTER 60FPS',
    
    // Pilot input step
    pilotStepTitle: 'ENTER PILOT CALLSIGN FOR LEADERBOARD',
    pilotInputPlaceholder: 'CALLSIGN (E.G. ACE, NOVA, VIPER)',
    pilotInputHint: 'Your name will be etched into the Interstellar Hall of Fame.',
    btnNextToSector: 'NEXT: SELECT COMBAT SECTOR ➔',
    btnNextToShip: 'NEXT: CHOOSE SHIP ➔',
    btnBack: '◀ BACK',
    btnBackToSector: '◀ BACK TO SECTORS',

    // Sector step
    selectSectorTitle: 'SELECT COMBAT SECTOR (5 LEVELS)',
    selectSectorSubtitle: 'Choose your entry point into the battle zone',
    levelLabel: 'LEVEL',
    hazardLabel: 'HAZARDS',
    
    // Ship Select
    selectShipTitle: 'SELECT YOUR COMBAT VESSEL (5 FREE + 6 UNLOCKABLE)',
    selectShipSubtitle: 'Scroll up/down to inspect all 11 combat vessels and choose your flagship',
    scrollShipHint: '↕ Scroll up/down to browse all 11 vessels',
    freeShipBadge: 'FREE SHIP',
    unlockableShipBadge: '🔒 UNLOCKABLE',
    unlockedBadge: '✓ UNLOCKED',
    unlockCostNotice: 'Use collected gold coins to permanently unlock starships',
    unlockShipBtn: '🔓 UNLOCK THIS SHIP',
    unlockSuccess: 'Combat Starship Unlocked!',
    coinsBalance: 'Your Total Coins',
    statSpeed: 'SPEED',
    statHullShield: 'HULL / SHIELD',
    statSpecial: 'SPECIAL ABILITY',
    btnLaunch: '🚀 LAUNCH MISSION [START BATTLE]',

    // Boss & Wave labels
    subBossLabel: '⚠️ SUB-BOSS [MID-SECTOR]',
    giantBossLabel: '☠️ COLOSSAL DREADNOUGHT BOSS',
    waveStructureHint: '⭐ 10 Waves per Sector (Wave 5: Sub-Boss • Wave 10: Colossal Giant Dreadnought)',

    // Tabs
    tabPlay: 'SECTOR & SHIP SELECT',
    tabLeaderboard: 'HIGH SCORES',
    tabAchievements: 'ACHIEVEMENTS',
    tabHowToPlay: 'HOW TO PLAY',

    // Quick Top Guide Bar
    quickGuideTitle: '🎮 CONTROLS:',
    quickGuideMove: 'A / D or Drag Touch (Move Ship)',
    quickGuideFire: 'Spacebar / Left Click (Fire)',
    quickGuideSwitch: 'Q / E or HUD Button (Toggle Weapon)',
    quickGuideBomb: 'X / B (EMP Shockwave)',
    quickGuideOverdrive: 'C / F (Hyper Mode)',
    quickItemsTitle: '💎 ITEMS & WEAPONS:',
    quickCoin: '🪙 Gold Coins (Bonus Score)',
    quickBlaster: '⚡ Single Plasma Blaster',
    quickSpread: '🔥 3-Way Spread Shot',
    quickShield: '🛡️ Plasma Shield',
    quickRepair: '❤️ Repair Nanites',
    quickBomb: '💣 EMP Screen Bomb',

    // HUD labels
    hudScore: 'SCORE',
    hudCoins: 'COINS',
    hudHighScore: 'HIGH SCORE',
    hudSector: 'SECTOR',
    hudHull: 'HULL INTEGRITY',
    hudShield: 'PLASMA SHIELD',
    hudWeaponLv: 'WEAPON LV',
    hudSwitchWeapon: 'TOGGLE WEAPON',
    hudRestart: 'RESTART',
    hudPause: 'PAUSE',
    hudEmp: 'EMP BOMB',
    hudOverdrive: 'OVERDRIVE',
    hudActive: 'ACTIVE',
    hudReady: 'READY [C]',

    // Pause & GameOver
    pauseTitle: 'SYSTEM PAUSED',
    pauseResume: 'RESUME BATTLE',
    pauseRestart: 'RESTART MISSION',
    pauseHome: 'MAIN MENU',
    gameOverTitle: 'MISSION TERMINATED',
    finalScore: 'FINAL SCORE',
    finalSector: 'SECTOR REACHED',
    finalCoins: 'COINS COLLECTED',
    saveScoreBtn: 'SAVE SCORE',
    savedSuccess: 'SCORE SAVED TO LEADERBOARD!',
    btnPlayAgain: 'PLAY AGAIN',

    // Graphics & Performance settings
    gfxTitle: '⚡ GRAPHICS & PERFORMANCE (ANTI-LAG)',
    gfxQuality: 'GRAPHICS QUALITY (FX)',
    gfxLow: '⚡ LOW (Ultra Smooth / Zero Lag)',
    gfxMed: '⚖️ MEDIUM (Balanced)',
    gfxHigh: '✨ HIGH (Full FX)',
    gfxLowHint: 'Disables heavy shadows, reduces star count and explosion debris for locked 60 FPS.',
    gfxBloomGlow: 'Neon Glow (Bloom FX)',
    gfxCrtLines: 'Retro Scanlines (CRT)',
    gfxSound: 'Audio Synthesizer',
    hudFxToggle: 'FX QUALITY',

    // Language Toggle
    langSwitch: '🇬🇧 EN | English',
  }
};
