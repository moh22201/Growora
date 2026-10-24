import Phaser from 'phaser';
import { FarmAudio, normalizeAudioSettings } from './audio.js';
import {
  activateAnimal as activateAnimalState,
  beginFishingAttempt,
  canUseEquippedRod,
  consumeRodUse,
  equipRod as equipRodState,
  isAnimalProducing,
  purchaseAnimal,
  purchaseRod,
  restoreEquippedRod,
  restoreRodOwnership,
  sellInventoryProduct,
  startAnimalCycle as startAnimalCycleState,
  unlockLand,
} from './progression.js';
import './style.css';

const crops = [
  { name: 'Wheat', nameFr: 'Blé', icon: '🌾', seed: 1, hours: 1, harvest: 100.4167, unit: 0.01, color: 0xe9c451 },
  { name: 'Carrot', nameFr: 'Carotte', icon: '🥕', seed: 2, hours: 2, harvest: 100.8333, unit: 0.02, color: 0xf28b45 },
  { name: 'Potato', nameFr: 'Pomme de terre', icon: '🥔', seed: 4, hours: 4, harvest: 101.6667, unit: 0.04, color: 0xd3a861 },
  { name: 'Corn', nameFr: 'Maïs', icon: '🌽', seed: 7, hours: 6, harvest: 102.5, unit: 0.07, color: 0xf0c943 },
  { name: 'Sunflower', nameFr: 'Tournesol', icon: '🌻', seed: 12, hours: 9, harvest: 103.75, unit: 0.12, color: 0xf5c04d },
  { name: 'Pumpkin', nameFr: 'Citrouille', icon: '🎃', seed: 20, hours: 12, harvest: 105, unit: 0.2, color: 0xee8343 },
  { name: 'Strawberry', nameFr: 'Fraise', icon: '🍓', seed: 35, hours: 18, harvest: 107.5, unit: 0.35, color: 0xe76872 },
  { name: 'Watermelon', nameFr: 'Pastèque', icon: '🍉', seed: 60, hours: 27, harvest: 111.25, unit: 0.6, color: 0x63b77b },
  { name: 'Rare Rose', nameFr: 'Rose rare', icon: '🌹', seed: 100, hours: 36, harvest: 115, unit: 1, color: 0xe36383 },
];

const fieldCosts = [0, 0.5, 1, 2, 4, 7, 12, 20, 35];
const rods = {
  ordinary: { name: 'Ordinary rod', nameFr: 'Canne ordinaire', price: 0.15, uses: 5, min: 5, max: 15, cooldown: 20, chance: [65, 25, 8, 1.8, 0.2] },
  upgraded: { name: 'Upgraded rod', nameFr: 'Canne améliorée', price: 0.5, uses: 7, min: 4, max: 12, cooldown: 15, chance: [40, 30, 20, 8, 2] },
  legendary: { name: 'Legendary rod', nameFr: 'Canne légendaire', price: 1.6, uses: 10, min: 3, max: 10, cooldown: 10, chance: [15, 25, 30, 22, 8] },
};
const fishTypes = [
  { name: 'Small fish', nameFr: 'Petit poisson', icon: '🐟', price: 0.01 },
  { name: 'Silver fish', nameFr: 'Poisson argenté', icon: '🐟', price: 0.03 },
  { name: 'Gold fish', nameFr: 'Poisson doré', icon: '🐠', price: 0.08 },
  { name: 'Rare blue fish', nameFr: 'Poisson bleu rare', icon: '🐟', price: 0.2 },
  { name: 'Legendary fish', nameFr: 'Poisson légendaire', icon: '🐡', price: 0.8 },
];
const animalSalePrices = { hive: 0.6, coop: 0.35 };
const SAVE_KEY = 'growora-demo-save-v1';
const MIN_DEPOSIT = 1;
const MIN_WITHDRAWAL = 5;
const WITHDRAWAL_FEE = 0.1;
const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, '') || '';
const TELEGRAM_WEBAPP_SHORT_NAME = import.meta.env.VITE_TELEGRAM_WEBAPP_SHORT_NAME?.trim() || '';
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const t = (key) => key;

const text = {
  en: {
    subtitle: 'A little island, a lot of heart',
    demo: 'DEMO BALANCE · NO REAL-MONEY VALUE',
    level: 'ISLAND LEVEL',
    fields: 'Your fields',
    fieldHint: 'Every plot stays right here. Tap one to tend it.',
    plant: 'Plant seeds',
    harvest: 'Harvest crop',
    unlock: 'Unlock field',
    buySeed: 'Buy seed',
    ready: 'Ready to harvest!',
    growing: 'Growing',
    empty: 'Ready for a seed',
    locked: 'Unlock to grow',
    shop: 'Seed shop',
    market: 'Market',
    fishing: 'Fishing',
    garden: 'Island',
    animals: 'Bee & chicken',
    inventory: 'Harvest basket',
    emptyBag: 'Your basket is empty for now.',
    seeds: 'Seed pouch',
    buy: 'Buy',
    sell: 'Sell',
    stock: 'In bag',
    unlockPrice: 'One-time field unlock',
    ocean: 'The little lake',
    fishingLock: 'Open fishing area',
    buyRod: 'Buy a rod',
    equipPrompt: 'Equip an owned rod before casting.',
    equipRod: 'Equip',
    equippedRod: 'Equipped',
    rodOwned: 'Owned',
    cast: 'Cast a line',
    fishingWait: 'A fish is nibbling…',
    collectFish: 'Reel in your fish',
    escaped: 'The fish got away! One rod use was used.',
    fishCaught: 'Nice catch!',
    cooldown: 'Next cast in',
    rodUses: 'uses left',
    rods: 'Fishing rods',
    fishBag: 'Fish in basket',
    beekeeping: 'Bee garden',
    chickenCoop: 'Chicken coop',
    buyHive: 'Build a hive',
    buyCoop: 'Build a coop',
    activate: 'Activate',
    activated: 'Activated',
    notActivated: 'Purchased · activate to begin',
    productionRunning: 'Production running',
    productionStopped: 'Not running',
    cycleFee: 'Cycle start fee',
    startCycle: 'Start 24-hour cycle',
    collectHoney: 'Collect honey',
    collectEggs: 'Collect eggs',
    honeyProduct: 'Honey',
    eggProduct: 'Eggs',
    collectedProducts: 'Products collected.',
    readyProducts: 'Ready to collect',
    cycleProgress: 'Cycle',
    expires: 'Products expire in',
    expired: 'Products expired — start a new cycle.',
    assets: 'Island upgrades',
    upgradeHint: 'One-time upgrades apply to new timers only.',
    owned: 'Owned',
    farming: 'Green thumb',
    fishingAsset: 'Angler’s charm',
    beeAsset: 'Bee whisperer',
    chickenAsset: 'Chicken keeper',
    farmingEffect: 'Crop timers −15%',
    fishingEffect: 'Fishing wait −15%',
    beeEffect: 'Honey cycle −15%',
    chickenEffect: 'Egg cycle −15%',
    hiveYield: '2 honey / 24h',
    coopYield: '6 eggs / 24h',
    crops: 'Crops',
    produce: 'Produce',
    lang: 'FR',
    selected: 'Selected',
    field: 'Field',
    lands: 'Lands',
    landLevel: 'Land level',
    landPrice: 'Unlock price',
    landStatusOpen: 'Open',
    landStatusLocked: 'Locked',
    sold: 'Sold',
    planted: 'Seeds planted!',
    unlocked: 'Field unlocked!',
    upgradeBought: 'Island upgraded!',
    noFunds: 'Not enough demo balance.',
    noSeeds: 'No seeds in your pouch. Get some at the seed shop.',
    noSpace: 'That field is already growing a crop.',
    fishAreaOpened: 'Fishing area opened!',
    rodBought: 'Rod added to your fishing kit.',
    hiveBought: 'Beehive built!',
    coopBought: 'Chicken coop built!',
    cycleStarted: 'Your island’s little cycle has started.',
    returned: 'Welcome back! Your island kept growing while you were away.',
    basket: 'basket',
    none: 'None yet',
    navHint: 'Choose an island activity',
    details: 'Growth details',
    growDuration: 'Growing time',
    harvestQty: 'Harvest quantity',
    seedPrice: 'Seed price',
    saleUnit: 'Sale / unit',
    island: 'GROWORA ISLAND',
    nowGrowing: 'Now growing',
    noField: 'Select a field to see what it needs.',
    welcome: 'Welcome to Growora',
    welcomeText: 'Plant a little, grow a lot. This is a local-only game demo; your balance is pretend and has no real-world value.',
    close: 'Let’s grow',
    playNow: 'Play Now',
    createAccount: 'Create account',
    signIn: 'Log In',
    email: 'Email',
    password: 'Password',
    authDisclaimer: 'Accounts are not connected yet. This demo does not create or save a real account. Do not enter a real password; these fields are never sent or stored.',
    continueDemo: 'Continue to demo',
    notForSale: 'No crops to sell yet.',
    rareOnce: 'You have already caught the legendary fish. This roll became a gold fish.',
    languageName: 'English',
    profile: 'Profile',
    profileName: 'Island farmer',
    profileNote: 'Your progress is saved on this device.',
    playBalance: 'Play balance',
    salesBalance: 'Sales balance',
    farmingTitle: 'Farming',
    plantSelected: 'Plant selected',
    harvestSelected: 'Harvest',
    openShop: 'Seed shop',
    openMarket: 'Market',
    openSettings: 'Settings',
    wallet: 'Wallet',
    tasks: 'Island goals',
    salesReady: 'Harvest value',
    walletHeading: 'Growora wallet',
    walletBalance: 'Play balance',
    walletSales: 'Ready to sell',
    walletLocalNote: 'This demo is saved only in this browser.',
    walletUnavailable: 'Wallet connection, deposits and withdrawals are not available yet.',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    depositMinimum: 'Minimum deposit',
    withdrawMinimum: 'Minimum withdrawal',
    withdrawFee: 'Withdrawal fee',
    walletUnavailableAction: 'Transactions are unavailable until a real wallet provider is connected.',
    walletBack: 'Back to wallet',
    telegramReady: 'Launch link configured. Telegram Mini App setup is still required.',
    audioSettings: 'Audio controls',
    soundEffects: 'Sound effects',
    masterVolume: 'Master volume',
    farmAmbience: 'Farm ambience',
    music: 'Music',
    volume: 'Volume',
    mute: 'Mute',
    unmute: 'Unmute',
    sound: 'Sound',
    audioProcedural: 'Original synthesized music and farm sounds play after your first interaction.',
    telegram: 'Telegram',
    openTelegram: 'Open Growora in Telegram',
    telegramNotConfigured: 'Telegram launch is not configured. Set VITE_TELEGRAM_BOT_USERNAME and VITE_TELEGRAM_WEBAPP_SHORT_NAME to enable it.',
    telegramUnavailable: 'Telegram launch is not configured yet.',
    rodPrice: 'Rod price',
    usesPerRod: 'uses per rod',
    attemptCost: 'Cost per attempt',
    perAttempt: 'per attempt',
    noExtraAttemptFee: 'One rod use per attempt; no separate casting fee. Rods do not expire.',
    cooldownDuration: 'Cooldown',
    fishOdds: 'Catch chances',
    fishType: 'Fish',
    salePrice: 'Sale price',
    ordinary: 'Ordinary',
    upgraded: 'Upgraded',
    legendary: 'Legendary',
    landCrop: 'Crop',
    noFishingArea: 'Unlock the fishing area to buy a rod or cast a line.',
    taskHeading: 'Your island goals',
    taskGarden: 'Tend your garden',
    taskGardenHint: 'Plant a seed in an open field.',
    taskHarvest: 'Bring in a harvest',
    taskHarvestHint: 'Pick a crop when it is ready.',
    taskMarket: 'Prepare a market sale',
    taskMarketHint: 'Harvest a crop or catch a fish for your basket.',
    taskDone: 'Done',
    taskOpenField: 'Go to a field',
    taskOpenMarket: 'Open market',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    recenter: 'Center island',
    gameControls: 'Island view controls',
    tapField: 'Tap a field to plant, check growth, or harvest.',
    fieldReady: 'Ready to harvest!',
    fieldGrowing: 'This crop is still growing',
    tools: 'Island tools',
    marketStall: 'Produce market',
    beeHut: 'Bee garden',
    coopName: 'Chicken coop',
    fishingDock: 'Fishing dock',
    farmhouse: 'Farmhouse',
    unlockedFields: 'fields open',
    seedsLabel: 'Seeds',
    harvestLabel: 'Harvest',
    languageLabel: 'Language',
  },
  fr: {
    subtitle: 'Une petite île, beaucoup de cœur',
    demo: 'SOLDE DÉMO · AUCUNE VALEUR RÉELLE',
    level: 'NIVEAU DE L’ÎLE',
    fields: 'Vos champs',
    fieldHint: 'Chaque parcelle reste en place. Touchez-en une pour vous en occuper.',
    plant: 'Planter',
    harvest: 'Récolter',
    unlock: 'Débloquer',
    buySeed: 'Acheter une graine',
    ready: 'Prêt à récolter !',
    growing: 'En croissance',
    empty: 'Prêt à être semé',
    locked: 'À débloquer',
    shop: 'Graines',
    market: 'Marché',
    fishing: 'Pêche',
    garden: 'Île',
    animals: 'Abeilles & poules',
    inventory: 'Panier',
    emptyBag: 'Votre panier est vide pour le moment.',
    seeds: 'Sachet de graines',
    buy: 'Acheter',
    sell: 'Vendre',
    stock: 'Dans le sac',
    unlockPrice: 'Déblocage unique',
    ocean: 'Le petit lac',
    fishingLock: 'Ouvrir la zone de pêche',
    buyRod: 'Acheter une canne',
    equipPrompt: 'Équipez une canne possédée avant de lancer la ligne.',
    equipRod: 'Équiper',
    equippedRod: 'Équipée',
    rodOwned: 'Possédée',
    cast: 'Lancer la ligne',
    fishingWait: 'Un poisson mord…',
    collectFish: 'Remonter le poisson',
    escaped: 'Le poisson s’est échappé ! Une utilisation a été consommée.',
    fishCaught: 'Belle prise !',
    cooldown: 'Prochain lancer dans',
    rodUses: 'utilisations restantes',
    rods: 'Cannes à pêche',
    fishBag: 'Poissons dans le panier',
    beekeeping: 'Jardin des abeilles',
    chickenCoop: 'Poulailler',
    buyHive: 'Construire une ruche',
    buyCoop: 'Construire un poulailler',
    activate: 'Activer',
    activated: 'Activé',
    notActivated: 'Acheté · activez pour commencer',
    productionRunning: 'Production en cours',
    productionStopped: 'À l’arrêt',
    cycleFee: 'Frais de démarrage du cycle',
    startCycle: 'Lancer un cycle de 24 h',
    collectHoney: 'Récolter le miel',
    collectEggs: 'Ramasser les œufs',
    honeyProduct: 'Miel',
    eggProduct: 'Œufs',
    collectedProducts: 'Produits récoltés.',
    readyProducts: 'À récolter',
    cycleProgress: 'Cycle',
    expires: 'Expiration dans',
    expired: 'Produits expirés — lancez un nouveau cycle.',
    assets: 'Améliorations',
    upgradeHint: 'Les améliorations uniques agissent sur les nouveaux minuteurs.',
    owned: 'Obtenu',
    farming: 'Main verte',
    fishingAsset: 'Charme du pêcheur',
    beeAsset: 'Amie des abeilles',
    chickenAsset: 'Gardienne des poules',
    farmingEffect: 'Pousse −15 %',
    fishingEffect: 'Attente de pêche −15 %',
    beeEffect: 'Cycle de miel −15 %',
    chickenEffect: 'Cycle des œufs −15 %',
    hiveYield: '2 miels / 24 h',
    coopYield: '6 œufs / 24 h',
    crops: 'Cultures',
    produce: 'Produits',
    lang: 'EN',
    selected: 'Sélectionné',
    field: 'Champ',
    lands: 'Terrains',
    landLevel: 'Niveau du terrain',
    landPrice: 'Prix de déblocage',
    landStatusOpen: 'Ouvert',
    landStatusLocked: 'Verrouillé',
    sold: 'Vendu',
    planted: 'Graines plantées !',
    unlocked: 'Champ débloqué !',
    upgradeBought: 'Île améliorée !',
    noFunds: 'Solde démo insuffisant.',
    noSeeds: 'Pas de graines dans votre sac. Passez à la boutique.',
    noSpace: 'Cette parcelle fait déjà pousser une culture.',
    fishAreaOpened: 'Zone de pêche ouverte !',
    rodBought: 'Canne ajoutée à votre équipement.',
    hiveBought: 'Ruche construite !',
    coopBought: 'Poulailler construit !',
    cycleStarted: 'Le cycle de votre île a commencé.',
    returned: 'Bon retour ! Votre île a continué à pousser pendant votre absence.',
    basket: 'panier',
    none: 'Aucun',
    navHint: 'Choisissez une activité',
    details: 'Détails de culture',
    growDuration: 'Temps de pousse',
    harvestQty: 'Quantité récoltée',
    seedPrice: 'Prix de la graine',
    saleUnit: 'Vente / unité',
    island: 'ÎLE GROWORA',
    nowGrowing: 'En croissance',
    noField: 'Choisissez un champ pour voir ses besoins.',
    welcome: 'Bienvenue sur Growora',
    welcomeText: 'Plantez un peu, récoltez beaucoup. Démo locale : le solde est fictif et sans valeur réelle.',
    close: 'C’est parti',
    playNow: 'Jouer',
    createAccount: 'Créer un compte',
    signIn: 'Se connecter',
    email: 'E-mail',
    password: 'Mot de passe',
    authDisclaimer: 'Les comptes ne sont pas encore connectés. Cette démo ne crée ni n’enregistre de vrai compte. N’utilisez pas un vrai mot de passe : ces champs ne sont ni envoyés ni enregistrés.',
    continueDemo: 'Continuer la démo',
    notForSale: 'Aucune récolte à vendre.',
    rareOnce: 'Vous avez déjà pêché le poisson légendaire. Ce lancer donne un poisson doré.',
    languageName: 'Français',
    profile: 'Profil',
    profileName: 'Fermier de l’île',
    profileNote: 'Votre progression est enregistrée sur cet appareil.',
    playBalance: 'Solde de jeu',
    salesBalance: 'Solde des ventes',
    farmingTitle: 'Cultures',
    plantSelected: 'Planter ici',
    harvestSelected: 'Récolter',
    openShop: 'Graines',
    openMarket: 'Marché',
    openSettings: 'Réglages',
    wallet: 'Portefeuille',
    tasks: 'Objectifs',
    salesReady: 'Valeur des récoltes',
    walletHeading: 'Portefeuille Growora',
    walletBalance: 'Solde de jeu',
    walletSales: 'Prêt à vendre',
    walletLocalNote: 'Cette démo est enregistrée dans ce navigateur uniquement.',
    walletUnavailable: 'La connexion, les dépôts et les retraits ne sont pas encore disponibles.',
    deposit: 'Déposer',
    withdraw: 'Retirer',
    depositMinimum: 'Dépôt minimum',
    withdrawMinimum: 'Retrait minimum',
    withdrawFee: 'Frais de retrait',
    walletUnavailableAction: 'Les transactions sont indisponibles tant qu’un vrai fournisseur de portefeuille n’est pas connecté.',
    walletBack: 'Retour au portefeuille',
    telegramReady: 'Le lien de lancement est configuré. La configuration Telegram Mini App reste nécessaire.',
    audioSettings: 'Commandes audio',
    soundEffects: 'Effets sonores',
    masterVolume: 'Volume général',
    farmAmbience: 'Ambiance de la ferme',
    music: 'Musique',
    volume: 'Volume',
    mute: 'Couper le son',
    unmute: 'Réactiver le son',
    sound: 'Son',
    audioProcedural: 'La musique et les sons originaux sont synthétisés après votre première interaction.',
    telegram: 'Telegram',
    openTelegram: 'Ouvrir Growora dans Telegram',
    telegramNotConfigured: 'Le lancement Telegram n’est pas configuré. Définissez VITE_TELEGRAM_BOT_USERNAME et VITE_TELEGRAM_WEBAPP_SHORT_NAME pour l’activer.',
    telegramUnavailable: 'Le lancement Telegram n’est pas encore configuré.',
    rodPrice: 'Prix de la canne',
    usesPerRod: 'utilisations par canne',
    attemptCost: 'Coût par tentative',
    perAttempt: 'par tentative',
    noExtraAttemptFee: 'Une utilisation de canne par tentative, sans frais de lancer. Les cannes n’expirent pas.',
    cooldownDuration: 'Récupération',
    fishOdds: 'Probabilités de capture',
    fishType: 'Poisson',
    salePrice: 'Prix de vente',
    ordinary: 'Ordinaire',
    upgraded: 'Améliorée',
    legendary: 'Légendaire',
    landCrop: 'Culture',
    noFishingArea: 'Débloquez la zone de pêche pour acheter une canne ou lancer la ligne.',
    taskHeading: 'Vos objectifs sur l’île',
    taskGarden: 'Entretenir le jardin',
    taskGardenHint: 'Plantez une graine dans un champ ouvert.',
    taskHarvest: 'Récolter une culture',
    taskHarvestHint: 'Récoltez une culture lorsqu’elle est prête.',
    taskMarket: 'Préparer une vente',
    taskMarketHint: 'Récoltez une culture ou pêchez pour remplir votre panier.',
    taskDone: 'Terminé',
    taskOpenField: 'Voir un champ',
    taskOpenMarket: 'Ouvrir le marché',
    zoomIn: 'Zoom avant',
    zoomOut: 'Zoom arrière',
    recenter: 'Recentrer l’île',
    gameControls: 'Commandes de vue de l’île',
    tapField: 'Touchez un champ pour planter, suivre la pousse ou récolter.',
    fieldReady: 'Prêt à récolter !',
    fieldGrowing: 'Cette culture pousse encore',
    tools: 'Outils de l’île',
    marketStall: 'Marché des récoltes',
    beeHut: 'Jardin des abeilles',
    coopName: 'Poulailler',
    fishingDock: 'Quai de pêche',
    farmhouse: 'Maison de ferme',
    unlockedFields: 'champs ouverts',
    seedsLabel: 'Graines',
    harvestLabel: 'Récoltes',
    languageLabel: 'Langue',
  },
};

function freshState() {
  return {
    balance: 100,
    sales: 0,
    language: 'en',
    selectedField: 0,
    fields: crops.map((crop, index) => ({
      unlocked: index === 0,
      crop: index,
      level: 1,
      plantedAt: null,
      readyAt: null,
    })),
    seeds: crops.map((_, index) => (index === 0 ? 2 : 0)),
    harvest: crops.map(() => 0),
    fish: fishTypes.map(() => 0),
    legendaryCaught: false,
    fishingUnlocked: false,
    rods: { ordinary: 0, upgraded: 0, legendary: 0 },
    ownedRods: { ordinary: false, upgraded: false, legendary: false },
    equippedRod: null,
    fishing: { busyUntil: null, catchDeadline: null, pendingFish: null, cooldownUntil: null, rodId: null },
    audio: normalizeAudioSettings(),
    hive: { owned: false, activated: false, startedAt: null, collected: 0, inventory: 0, expired: false, speed: 1 },
    coop: { owned: false, activated: false, startedAt: null, collected: 0, inventory: 0, expired: false, speed: 1 },
    upgrades: { farming: false, fishing: false, bee: false, chicken: false },
    seenWelcome: false,
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return freshState();
    const parsed = JSON.parse(saved);
    const initial = freshState();
    return {
      ...initial,
      ...parsed,
      sales: Number(parsed.sales || 0),
      fields: initial.fields.map((field, index) => ({ ...field, ...(parsed.fields?.[index] || {}) })),
      seeds: crops.map((_, index) => Number(parsed.seeds?.[index] || 0)),
      harvest: crops.map((_, index) => Number(parsed.harvest?.[index] || 0)),
      fish: fishTypes.map((_, index) => Number(parsed.fish?.[index] || 0)),
      rods: { ...initial.rods, ...parsed.rods },
      ownedRods: restoreRodOwnership(Object.keys(initial.rods), parsed),
      equippedRod: restoreEquippedRod(Object.keys(initial.rods), parsed),
      fishing: { ...initial.fishing, ...parsed.fishing },
      audio: normalizeAudioSettings(parsed.audio),
      hive: {
        ...initial.hive,
        ...parsed.hive,
        activated: parsed.hive?.activated ?? Boolean(parsed.hive?.startedAt),
        inventory: Number(parsed.hive?.inventory || 0),
      },
      coop: {
        ...initial.coop,
        ...parsed.coop,
        activated: parsed.coop?.activated ?? Boolean(parsed.coop?.startedAt),
        inventory: Number(parsed.coop?.inventory || 0),
      },
      upgrades: { ...initial.upgrades, ...parsed.upgrades },
    };
  } catch (error) {
    console.error('Could not load the saved Growora demo.', error);
    return freshState();
  }
}

let state = loadState();
let appScreen = 'welcome';
let authMode = 'signup';
let activeTab = 'garden';
let panelZoom = 1;
let walletView = 'overview';
let fieldActionOpen = false;
let toastTimer;
let scene;
let game;
let pendingFishTimeout;
const app = document.querySelector('#app');
const audioEngine = new FarmAudio();

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function tr(key) {
  return text[state.language]?.[key] || text.en[key] || key;
}

function cropName(index) {
  const crop = crops[index];
  return state.language === 'fr' ? crop.nameFr : crop.name;
}

function money(amount) {
  const rounded = Number(amount.toFixed(6));
  return `$${rounded.toLocaleString(state.language === 'fr' ? 'fr-FR' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })}`;
}

function sellableValue() {
  const cropsValue = state.harvest.reduce((sum, amount, index) => sum + amount * crops[index].unit, 0);
  const fishValue = state.fish.reduce((sum, amount, index) => sum + amount * fishTypes[index].price, 0);
  const animalValue = Object.keys(animalSalePrices).reduce((sum, type) => sum + state[type].inventory * animalSalePrices[type], 0);
  return cropsValue + fishValue + animalValue;
}

function number(value, digits = 2) {
  return Number(value.toFixed(digits)).toLocaleString(state.language === 'fr' ? 'fr-FR' : 'en-US');
}

function duration(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`;
  return `${seconds}s`;
}

function cropReady(index, now = Date.now()) {
  const field = state.fields[index];
  return Boolean(field && field.plantedAt !== null && now >= field.readyAt);
}

function growthDuration(index) {
  const boost = state.upgrades.farming ? 0.85 : 1;
  return crops[index].hours * HOUR * boost;
}

function notify(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
}

function canAfford(price) {
  if (state.balance + 1e-9 < price) {
    notify(tr('noFunds'));
    return false;
  }
  return true;
}

function spend(price) {
  if (!canAfford(price)) return false;
  state.balance = Number((state.balance - price).toFixed(6));
  return true;
}

function updateOfflineState(now = Date.now()) {
  for (const produce of [state.hive, state.coop]) {
    if (!isAnimalProducing(produce)) continue;
    const speed = produce.speed || 1;
    if (!produce.expired && now >= produce.startedAt + DAY * speed + 6 * HOUR) {
      produce.collected = 0;
      produce.expired = true;
    }
  }
  const fishing = state.fishing;
  if (fishing.busyUntil && fishing.catchDeadline && now > fishing.catchDeadline) {
    const rodId = fishing.rodId;
    if (rodId && consumeRodUse(state, rodId)) {
      fishing.cooldownUntil = now + rods[rodId].cooldown * 60_000;
    }
    fishing.busyUntil = null;
    fishing.catchDeadline = null;
    fishing.pendingFish = null;
    fishing.rodId = null;
    save();
    if (activeTab === 'fishing') notify(tr('escaped'));
  }
  state.fields.forEach((field, index) => {
    if (field.plantedAt && now >= field.readyAt) field.ready = true;
    if (field.plantedAt) field.progress = Math.min(1, (now - field.plantedAt) / (field.readyAt - field.plantedAt));
  });
}

function cropStage(index, now = Date.now()) {
  const field = state.fields[index];
  if (!field.plantedAt) return 0;
  if (now >= field.readyAt) return 3;
  const progress = (now - field.plantedAt) / (field.readyAt - field.plantedAt);
  return progress < 0.33 ? 1 : progress < 0.72 ? 2 : 3;
}

function buySeed(index) {
  if (!Number.isInteger(index) || !crops[index] || !state.fields[index]?.unlocked) return;
  if (!spend(crops[index].seed)) return;
  state.seeds[index] += 1;
  save();
  render();
  notify(`${cropName(index)} ${tr('seeds').toLowerCase()} +1`);
}

function plantField(index) {
  const field = state.fields[index];
  if (!field?.unlocked || field.plantedAt) return;
  const crop = crops[field.crop];
  if (state.seeds[field.crop] < 1) {
    notify(tr('noSeeds'));
    activeTab = 'shop';
    render();
    return;
  }
  state.seeds[field.crop] -= 1;
  const now = Date.now();
  field.plantedAt = now;
  field.readyAt = now + growthDuration(field.crop);
  delete field.ready;
  save();
  render();
  notify(`${crop.icon} ${tr('planted')}`);
}

function harvestField(index) {
  if (!Number.isInteger(index) || !cropReady(index)) return;
  const cropIndex = state.fields[index].crop;
  state.harvest[cropIndex] += crops[cropIndex].harvest;
  state.fields[index].plantedAt = null;
  state.fields[index].readyAt = null;
  delete state.fields[index].ready;
  save();
  render();
  notify(`${crops[cropIndex].icon} +${number(crops[cropIndex].harvest, 4)} ${cropName(cropIndex)}`);
}

function unlockField(index) {
  const result = unlockLand(state, index, fieldCosts);
  if (result === 'insufficient-funds') {
    notify(tr('noFunds'));
    return;
  }
  if (result !== 'purchased') return;
  save();
  render();
  notify(`${tr('field')} ${index + 1} · ${tr('unlocked')}`);
}

function sellProduct(type, index) {
  const unitPrice = type === 'crop'
    ? crops[index]?.unit
    : type === 'fish'
      ? fishTypes[index]?.price
      : animalSalePrices[type];
  const result = sellInventoryProduct(state, type, index, unitPrice);
  if (result.status !== 'sold') return;
  save();
  render();
  notify(`${tr('sold')} ${result.quantity} · ${money(result.proceeds)}`);
}

function interactField(index) {
  state.selectedField = index;
  const field = state.fields[index];
  if (!field.unlocked) {
    render();
    unlockField(index);
  } else if (cropReady(index)) {
    harvestField(index);
  } else if (!field.plantedAt) {
    plantField(index);
  } else {
    render();
    notify(`${tr('fieldGrowing')} · ${duration(field.readyAt - Date.now())}`);
  }
}

const upgrades = [
  { id: 'farming', title: 'farming', price: 1000, icon: '🌱' },
  { id: 'fishing', title: 'fishingAsset', price: 500, icon: '🎣' },
  { id: 'bee', title: 'beeAsset', price: 300, icon: '🐝' },
  { id: 'chicken', title: 'chickenAsset', price: 300, icon: '🐔' },
];

function buyUpgrade(id) {
  const upgrade = upgrades.find((item) => item.id === id);
  if (!upgrade || state.upgrades[id] || !spend(upgrade.price)) return;
  state.upgrades[id] = true;
  save();
  render();
  notify(tr('upgradeBought'));
}

function buyFishingArea() {
  if (state.fishingUnlocked || !spend(5)) return;
  state.fishingUnlocked = true;
  save();
  render();
  notify(tr('fishAreaOpened'));
}

function buyRod(id) {
  const result = purchaseRod(state, id, rods);
  if (result === 'insufficient-funds') {
    notify(tr('noFunds'));
    return;
  }
  if (result !== 'purchased') return;
  save();
  render();
  notify(`${rods[id].name} · ${tr('rodBought')}`);
}

function equipRod(id) {
  if (equipRodState(state, id, rods) !== 'equipped') return;
  save();
  render();
  notify(`${tr(id)} · ${tr('equippedRod')}`);
}

function pickFish(id) {
  const rod = rods[id];
  let roll = Math.random() * 100;
  let caught = 0;
  rod.chance.some((chance, index) => {
    roll -= chance;
    if (roll < 0) {
      caught = index;
      return true;
    }
    return false;
  });
  if (caught === 4 && state.legendaryCaught) {
    caught = 2;
    notify(tr('rareOnce'));
  }
  return caught;
}

function castLine(id) {
  const rod = rods[id];
  const now = Date.now();
  if (!rod || !Object.hasOwn(state.rods, id)) return;
  if (!state.fishingUnlocked || state.rods[id] <= 0) {
    notify(`${tr('buyRod')} · ${rod.name}`);
    return;
  }
  if (!canUseEquippedRod(state, id)) return;
  if (state.fishing.busyUntil) return;
  if (state.fishing.cooldownUntil && now < state.fishing.cooldownUntil) {
    notify(`${tr('cooldown')} ${duration(state.fishing.cooldownUntil - now)}`);
    return;
  }
  const fishingBoost = state.upgrades.fishing ? 0.85 : 1;
  const wait = (rod.min + Math.random() * (rod.max - rod.min)) * 60_000 * fishingBoost;
  const result = beginFishingAttempt(state, id, now, wait, pickFish(id));
  if (result !== 'started') return;
  save();
  render();
  pendingFishTimeout = window.setTimeout(refresh, Math.min(wait + 1000, 2_147_000_000));
}

function collectFish() {
  const fishing = state.fishing;
  const now = Date.now();
  if (!fishing.busyUntil || now < fishing.busyUntil) return;
  const rodId = fishing.rodId;
  const pending = fishing.pendingFish;
  if (pending === null || pending === undefined) return;
  if (now > fishing.catchDeadline) {
    if (rodId && consumeRodUse(state, rodId)) fishing.cooldownUntil = now + rods[rodId].cooldown * 60_000;
    notify(tr('escaped'));
  } else {
    if (rodId) consumeRodUse(state, rodId);
    state.fish[pending] += 1;
    if (pending === 4) state.legendaryCaught = true;
    const activeRod = rodId || 'ordinary';
    fishing.cooldownUntil = now + rods[activeRod].cooldown * 60_000;
    notify(`${tr('fishCaught')} ${fishTypes[pending].icon}`);
  }
  fishing.busyUntil = null;
  fishing.catchDeadline = null;
  fishing.pendingFish = null;
  fishing.rodId = null;
  save();
  render();
}

function buyAnimal(type) {
  const prices = { hive: 3, coop: 5 };
  const result = purchaseAnimal(state, type, prices);
  if (result === 'insufficient-funds') {
    notify(tr('noFunds'));
    return;
  }
  if (result !== 'purchased') return;
  save();
  render();
  notify(tr(type === 'hive' ? 'hiveBought' : 'coopBought'));
}

function activateAnimal(type) {
  if (activateAnimalState(state, type, animalSalePrices) !== 'activated') return;
  save();
  render();
  notify(tr('activated'));
}

function startAnimalCycle(type) {
  const fees = { hive: 0.2, coop: 0.4 };
  const speed = state.upgrades[type === 'hive' ? 'bee' : 'chicken'] ? 0.85 : 1;
  const result = startAnimalCycleState(state, type, fees, Date.now(), speed);
  if (result === 'insufficient-funds') {
    notify(tr('noFunds'));
    return;
  }
  if (result !== 'started') return;
  save();
  render();
  notify(tr('cycleStarted'));
}

function animalReady(type, now = Date.now()) {
  const data = state[type];
  if (!isAnimalProducing(data)) return 0;
  const intervals = type === 'hive' ? 12 * HOUR : 8 * HOUR;
  const maximum = type === 'hive' ? 2 : 3;
  const speed = data.speed || 1;
  const cycleDuration = DAY * speed;
  const elapsed = now - data.startedAt;
  if (elapsed >= cycleDuration + 6 * HOUR) return 0;
  return Math.min(maximum, Math.floor(elapsed / (intervals * speed)));
}

function animalProductCount(type) {
  const ready = animalReady(type);
  const data = state[type];
  return type === 'hive' ? Math.max(0, ready * 1 - data.collected) : Math.max(0, ready * 2 - data.collected);
}

function collectAnimal(type) {
  if (!Object.hasOwn(animalSalePrices, type)) return;
  const count = animalProductCount(type);
  if (count <= 0) return;
  const data = state[type];
  data.collected += count;
  data.inventory += count;
  if (animalReady(type) >= (type === 'hive' ? 2 : 3)) {
    data.startedAt = null;
    data.collected = 0;
    data.expired = false;
  }
  save();
  render();
  notify(`${tr('collectedProducts')} +${count}`);
}

function welcomeMarkup() {
  return `<main class="welcome-screen">
    <img class="welcome-image" src="https://videotourl.com/images/1792722412491-0b6f9919-d426-4280-ab26-b33929fd7608.jpg" alt="">
    <div class="welcome-shade"></div>
    <button class="welcome-language" data-action="language" aria-label="${tr('languageLabel')}">${tr('lang')}</button>
    <section class="welcome-copy">
      <span class="welcome-kicker">${tr('subtitle')}</span>
      <h1>Growora</h1>
      <p>${tr('welcomeText')}</p>
      <button class="welcome-play" data-action="play-now">${tr('playNow')} <span aria-hidden="true">→</span></button>
      <div class="welcome-auth-actions">
        <button data-action="welcome-auth" data-mode="signup">${tr('createAccount')}</button>
        <button data-action="welcome-auth" data-mode="signin">${tr('signIn')}</button>
      </div>
    </section>
  </main>`;
}

function authMarkup() {
  const heading = authMode === 'signup' ? tr('createAccount') : tr('signIn');
  return `<main class="auth-screen">
    <button class="auth-language" data-action="language" aria-label="${tr('languageLabel')}">${tr('lang')}</button>
    <section class="auth-panel">
      <button class="auth-back" data-action="auth-back" aria-label="${tr('welcome')}">←</button>
      <span class="auth-mark" aria-hidden="true">G</span>
      <p class="auth-eyebrow">GROWORA</p>
      <h1>${heading}</h1>
      <div class="auth-modes" role="group" aria-label="${heading}">
        <button class="${authMode === 'signup' ? 'active' : ''}" data-action="auth-mode" data-mode="signup">${tr('createAccount')}</button>
        <button class="${authMode === 'signin' ? 'active' : ''}" data-action="auth-mode" data-mode="signin">${tr('signIn')}</button>
      </div>
      <form data-form="demo-enter" autocomplete="off">
        <label>${tr('email')}<input type="email" autocomplete="off"></label>
        <label>${tr('password')}<input type="password" autocomplete="new-password"></label>
        <p class="auth-disclaimer">${tr('authDisclaimer')}</p>
        <button class="auth-submit" type="submit">${tr('continueDemo')} <span aria-hidden="true">→</span></button>
      </form>
    </section>
  </main>`;
}

function render() {
  updateOfflineState();
  document.documentElement.lang = state.language;
  if (appScreen !== 'game') {
    app.innerHTML = appScreen === 'welcome' ? welcomeMarkup() : authMarkup();
    bindActions();
    app.querySelector('[data-form="demo-enter"]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      enterDemo();
    });
    return;
  }
  audioEngine.setScene(activeTab);
  const islandHost = app.querySelector('#island-game');
  const previousPopup = app.querySelector('.activity-panel');
  const popupScroll = previousPopup?.dataset.popupTab === activeTab
    ? {
      panel: previousPopup.querySelector('.panel-content')?.scrollTop ?? previousPopup.scrollTop,
      nested: [...previousPopup.querySelectorAll('.shop-list, .market-list, .rod-list, .upgrade-list, .inventory-rows')]
        .map((element) => [element.className, element.scrollTop]),
    }
    : null;
  app.innerHTML = `
    <div class="app-shell">
      <main class="world-stage">
        <div id="island-game" class="island-canvas" aria-label="Growora animated farming island"></div>
        <header class="world-header">
          <div class="world-brand-wrap">
  <div class="world-brand" aria-label="Growora">
    <span class="world-brand-mark" aria-hidden="true">G</span>
    <b>Growora</b>
  </div>
  <div class="withdrawal-ticker" aria-label="Withdrawal updates">
    <span class="ticker-label">💸 WITHDRAWALS</span>
    <div class="ticker-window">
      <div class="ticker-track">
        <span>Withdrawal updates will appear here when real transaction data is connected.</span>
        <span aria-hidden="true">Withdrawal updates will appear here when real transaction data is connected.</span>
      </div>
    </div>
  </div>
</div>
          <div class="world-header-controls">
            <button class="world-control world-profile" data-action="open-panel" data-tab="profile" aria-label="${tr('profile')}" title="${tr('profile')}"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/></svg><small>${tr('profile')}</small></button>
            <button class="world-control world-balance" data-action="open-panel" data-tab="wallet" aria-label="${tr('playBalance')}"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 6.5v11M15 9.5c-.7-1-1.7-1.5-3-1.5-1.6 0-2.7.8-2.7 2s1.1 1.8 2.7 2 2.7.8 2.7 2-1.1 2-2.7 2c-1.3 0-2.4-.5-3-1.5"/></svg><small>${tr('playBalance')}</small><b>${money(state.balance)}</b></button>
            <div class="world-control world-sales" role="status" aria-label="${tr('salesBalance')}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 18V6m0 12h16M7 15l4-4 3 2 5-6M15 7h4v4"/></svg><small>${tr('salesBalance')}</small><b>${money(state.sales)}</b></div>
            <button class="world-control world-settings" data-action="open-panel" data-tab="settings" aria-label="${tr('openSettings')}" title="${tr('openSettings')}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9.8 3.8.5-1.3h3.4l.5 1.3 1.5.9 1.4-.3 1.7 3-1 1.1v1.8l1 1.1-1.7 3-1.4-.3-1.5.9-.5 1.3h-3.4l-.5-1.3-1.5-.9-1.4.3-1.7-3 1-1.1V8.5l-1-1.1 1.7-3 1.4.3z"/><circle cx="12" cy="9.5" r="2.7"/></svg><small>${tr('openSettings')}</small></button>
          </div>
        </header>
        <nav class="world-systems" aria-label="${tr('navHint')}">
          <button class="world-system" data-action="open-panel" data-tab="farming" aria-label="${tr('farmingTitle')}" title="${tr('farmingTitle')}"><svg aria-hidden="true" viewBox="0 0 32 32"><path d="M16 28V5m0 7c-5 0-8-3-8-7 5 0 8 3 8 7Zm0 6c5 0 8-3 8-7-5 0-8 3-8 7Zm0 5c-4 0-7-2-7-6 4 0 7 2 7 6Zm0 2c4 0 7-2 7-6-4 0-7-2-7-6Z"/></svg><small>${tr('farmingTitle')}</small></button>
          <button class="world-system" data-action="open-panel" data-tab="lands" aria-label="${tr('lands')}" title="${tr('lands')}"><svg aria-hidden="true" viewBox="0 0 32 32"><path d="M5 5h22v22H5zM5 12h22M5 20h22M12 5v22M20 5v22"/></svg><small>${tr('lands')}</small></button>
          <button class="world-system" data-action="open-panel" data-tab="fishing" aria-label="${tr('fishing')}" title="${tr('fishing')}"><svg aria-hidden="true" viewBox="0 0 32 32"><path d="M8 5v7a8 8 0 0 0 16 0V8m-3 0h6m-3-3v6m-4 2c0 3-2 5-5 5s-5-2-5-5m5 5v4a5 5 0 0 0 10 0v-1"/><path d="M24 23c0 2 2 3 4 2"/></svg><small>${tr('fishing')}</small></button>
          <button class="world-system" data-action="open-panel" data-tab="coop" aria-label="${tr('chickenCoop')}" title="${tr('chickenCoop')}"><svg aria-hidden="true" viewBox="0 0 32 32"><path d="m4 13 12-9 12 9M7 12v15h18V12M12 27v-9h8v9"/><path d="M15 14c2-2 5-1 5 1s-2 3-4 2m-3-4-1-2m1 4h-2m12 8c2 0 3 1 3 3s-1 3-3 3-3-1-3-3 1-3 3-3Z"/></svg><small>${state.language === 'fr' ? 'Œufs' : 'Eggs'}</small></button>
          <button class="world-system" data-action="open-panel" data-tab="hive" aria-label="${tr('beekeeping')}" title="${tr('beekeeping')}"><svg aria-hidden="true" viewBox="0 0 32 32"><path d="M7 13 16 6l9 7M9 13v13h14V13M12 17h8m-8 4h8"/><path d="M5 9c1-3 4-4 6-2m16 2c-1-3-4-4-6-2m-5 3v15"/></svg><small>${state.language === 'fr' ? 'Miel' : 'Honey'}</small></button>
        </nav>
        <div class="world-bottom-controls">
          <button class="world-bottom-control" data-action="open-panel" data-tab="wallet" aria-label="${tr('wallet')}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 6.5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h13v3.5"/><path d="M17 12h4m-3 0h.1"/></svg><b>${tr('wallet')}</b></button>
          <button class="world-bottom-control" data-action="open-panel" data-tab="market" aria-label="${tr('market')}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 9h18l-2 12H5L3 9Zm1-5h16l2 5H2l2-5Z"/><path d="M9 13v4m6-4v4"/></svg><b>${tr('market')}</b></button>
          <button class="world-bottom-control world-sound" data-action="toggle-audio" data-channel="master" aria-label="${tr(state.audio.master.muted ? 'unmute' : 'mute')}" aria-pressed="${state.audio.master.muted}" title="${tr(state.audio.master.muted ? 'unmute' : 'mute')}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6l-5 4H4Z"/>${state.audio.master.muted ? '<path d="m16 9 5 6m0-6-5 6"/>' : '<path d="M16 9a5 5 0 0 1 0 6m2-9a9 9 0 0 1 0 12"/>'}</svg><b>${tr('sound')}</b></button>
          <button class="world-bottom-control world-language" data-action="language" aria-label="${tr('languageLabel')}"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18m0-18a14 14 0 0 0 0 18"/></svg><b>${tr('lang')}</b></button>
        </div>
        ${fieldActionOpen ? `<div class="world-field-action">
          <span class="world-field-crop">${state.fields[state.selectedField].unlocked ? crops[state.selectedField].icon : '🔒'}</span>
          <span class="world-field-name"><small>${tr('field')} ${String(state.selectedField + 1).padStart(2, '0')}</small><b>${cropName(state.selectedField)}</b></span>
          ${selectedFieldAction()}
        </div>` : ''}
      </main>
      ${activeTab !== 'garden' ? `<div class="panel-backdrop" data-action="close-panel"><section class="activity-panel panel" role="dialog" aria-modal="true" aria-label="${panelTitle()}" data-panel data-popup-tab="${activeTab}">
        <div class="modal-heading"><span>${panelTitle()}</span><div class="modal-controls">
          <button class="modal-zoom" data-action="panel-zoom-out" aria-label="${tr('zoomOut')}">−</button>
          <output class="modal-zoom-level" aria-live="polite">${Math.round(panelZoom * 100)}%</output>
          <button class="modal-zoom" data-action="panel-zoom-in" aria-label="${tr('zoomIn')}">+</button>
          <button class="modal-close" data-action="close-panel" aria-label="${tr('close')}">×</button>
        </div></div>
        <div class="panel-content" style="zoom:${panelZoom}">${activeTab === 'settings' ? settingsMarkup() : activeTab === 'wallet' ? walletMarkup() : activeTab === 'tasks' ? tasksMarkup() : activeTab === 'profile' ? profileMarkup() : panelMarkup()}</div>
      </section></div>` : ''}
      <div id="toast" class="toast" role="status"></div>
    </div>
  `;
  const nextIslandHost = app.querySelector('#island-game');
  if (islandHost && nextIslandHost) {
    nextIslandHost.replaceWith(islandHost);
  }
  const nextPopup = app.querySelector('.activity-panel');
  if (popupScroll && nextPopup?.dataset.popupTab === activeTab) {
    const content = nextPopup.querySelector('.panel-content');
    if (content) content.scrollTop = popupScroll.panel;
    else nextPopup.scrollTop = popupScroll.panel;
    for (const element of nextPopup.querySelectorAll('.shop-list, .market-list, .rod-list, .upgrade-list, .inventory-rows')) {
      const savedScroll = popupScroll.nested.find(([className]) => className === element.className);
      if (savedScroll) element.scrollTop = savedScroll[1];
    }
  }
  bindActions();
  updateScene();
}

function panelTitle() {
  const titles = {
    farming: 'farmingTitle',
    lands: 'lands',
    profile: 'profile',
    wallet: 'walletHeading',
    settings: 'openSettings',
    inventory: 'inventory',
    shop: 'openShop',
    market: 'openMarket',
    tasks: 'taskHeading',
    fishing: 'fishing',
    animals: 'animals',
    hive: 'beekeeping',
    coop: 'chickenCoop',
  };
  return tr(titles[activeTab] || 'garden');
}

function walletMarkup() {
  if (walletView !== 'overview') {
    const deposit = walletView === 'deposit';
    return `<div class="wallet-card">
      <div class="wallet-balance"><span class="wallet-coin">$</span><div><small>${tr(deposit ? 'deposit' : 'withdraw')}</small><b>${tr(deposit ? 'depositMinimum' : 'withdrawMinimum')}: ${money(deposit ? MIN_DEPOSIT : MIN_WITHDRAWAL)}</b></div></div>
      ${deposit ? '' : `<div class="wallet-sales"><span>${tr('withdrawFee')}</span><b>${Math.round(WITHDRAWAL_FEE * 100)}%</b></div>`}
      <p class="wallet-notice"><span>ⓘ</span>${tr('walletUnavailableAction')}</p>
      <button class="secondary-button full-button" data-action="wallet-back">${tr('walletBack')}</button>
    </div>`;
  }
  return `<div class="wallet-card">
    <div class="wallet-balance"><span class="wallet-coin">$</span><div><small>${tr('walletBalance')}</small><b>${money(state.balance)}</b></div><span class="wallet-level">✦ 01</span></div>
    <div class="wallet-sales"><span>${tr('walletSales')}</span><b>${money(state.sales)}</b></div>
    <p class="wallet-notice"><span>ⓘ</span>${tr('walletLocalNote')}</p>
    <p class="wallet-notice"><span>⌁</span>${tr('walletUnavailable')}</p>
    <div class="wallet-actions">
      <button class="secondary-button" data-action="wallet-view" data-view="deposit">${tr('deposit')}</button>
      <button class="secondary-button" data-action="wallet-view" data-view="withdraw">${tr('withdraw')}</button>
    </div>
  </div>`;
}

function profileMarkup() {
  return `<div class="profile-card">
    <span class="profile-avatar" aria-hidden="true">👩‍🌾</span>
    <div><span class="eyebrow">${tr('level')} 01</span><h2>${tr('profileName')}</h2></div>
  </div>
  <p class="panel-description">${tr('profileNote')}</p>
  <div class="wallet-sales"><span>${tr('playBalance')}</span><b>${money(state.balance)}</b></div>
  <div class="wallet-sales"><span>${tr('salesBalance')}</span><b>${money(state.sales)}</b></div>`;
}

function tasksMarkup() {
  const hasPlanted = state.fields.some((field) => field.plantedAt !== null);
  const readyField = state.fields.findIndex((field, index) => cropReady(index));
  const hasSellable = sellableValue() > 0;
  const gardenDone = hasPlanted;
  const harvestDone = readyField >= 0;
  const marketDone = hasSellable;
  const taskCard = (title, hint, done, action, actionLabel) => `
    <div class="task-card ${done ? 'task-complete' : ''}">
      <span class="task-check">${done ? '✓' : '·'}</span>
      <div><b>${title}</b><small>${done ? tr('taskDone') : hint}</small></div>
      ${done ? '' : `<button data-action="${action}">${actionLabel} →</button>`}
    </div>`;
  return `<div class="task-list">
    ${taskCard(tr('taskGarden'), tr('taskGardenHint'), gardenDone, 'task-plant', tr('taskOpenField'))}
    ${taskCard(tr('taskHarvest'), tr('taskHarvestHint'), harvestDone, 'task-harvest', tr('taskOpenField'))}
    ${taskCard(tr('taskMarket'), tr('taskMarketHint'), marketDone, 'task-market', tr('taskOpenMarket'))}
  </div>
  <p class="task-footnote">${state.language === 'fr' ? 'Des objectifs de jeu locaux, sans récompense monétaire supplémentaire.' : 'Local game goals only — no extra currency rewards.'}</p>`;
}

function selectedFieldAction() {
  const index = state.selectedField;
  const field = state.fields[index];
  if (!field.unlocked) {
    return `<button class="action-button" data-action="unlock-field" data-index="${index}"><span>🔓</span><small>${tr('unlock')} ${money(fieldCosts[index])}</small></button>`;
  }
  if (cropReady(index)) {
    return `<button class="action-button action-primary" data-action="harvest" data-index="${index}"><span>✂</span><small>${tr('harvestSelected')}</small></button>`;
  }
  if (field.plantedAt) {
    return `<button class="action-button" disabled><span>◷</span><small>${duration(field.readyAt - Date.now())}</small></button>`;
  }
  return `<button class="action-button action-primary" data-action="plant" data-index="${index}"><span>♧</span><small>${tr('plantSelected')}</small></button>`;
}

function settingsMarkup() {
  const telegramConfigured = /^[A-Za-z0-9_]{5,32}$/.test(TELEGRAM_BOT_USERNAME)
    && /^[A-Za-z0-9_-]+$/.test(TELEGRAM_WEBAPP_SHORT_NAME);
  const telegramUrl = telegramConfigured
    ? `https://t.me/${encodeURIComponent(TELEGRAM_BOT_USERNAME)}/${encodeURIComponent(TELEGRAM_WEBAPP_SHORT_NAME)}`
    : '';
  return `<div class="settings-panel">
    <section class="settings-tools" aria-label="${tr('audioSettings')}">
      <h3>${tr('audioSettings')}</h3>
      ${['master', 'music', 'ambient'].map((channel) => {
        const label = tr(channel === 'master' ? 'masterVolume' : channel === 'music' ? 'music' : 'farmAmbience');
        const preference = state.audio[channel];
        return `<div class="audio-control">
          <label for="audio-${channel}">${label} · ${tr('volume')}</label>
          <div class="audio-control-row">
            <input id="audio-${channel}" type="range" min="0" max="100" step="1" value="${preference.volume}" data-audio-volume="${channel}" aria-label="${label} ${tr('volume')}">
            <output data-audio-value="${channel}">${preference.volume}%</output>
            <button class="secondary-button audio-mute" data-action="toggle-audio" data-channel="${channel}" aria-pressed="${preference.muted}">${tr(preference.muted ? 'unmute' : 'mute')}</button>
          </div>
        </div>`;
      }).join('')}
      <p class="wallet-notice"><span>ⓘ</span>${tr('audioProcedural')}</p>
    </section>
    <section class="settings-tools telegram-tools" aria-label="${tr('telegram')}">
      <h3>${tr('telegram')}</h3>
      ${telegramConfigured
        ? `<a class="secondary-button telegram-button" href="${telegramUrl}" target="_blank" rel="noopener noreferrer">${tr('openTelegram')}</a>`
        : `<button class="secondary-button telegram-button is-disabled" type="button" disabled>${tr('openTelegram')}</button>`}
      <p class="wallet-notice"><span>ⓘ</span>${tr(telegramConfigured ? 'telegramReady' : 'telegramNotConfigured')}</p>
    </section>
    <p class="save-note">${state.language === 'fr' ? 'Sauvegarde locale sur cet appareil.' : 'Saved locally on this device.'}</p>
  </div>`;
}

function fieldMarkup(field, index) {
  const crop = crops[index];
  const selected = state.selectedField === index;
  const planted = field.plantedAt !== null;
  const ready = cropReady(index);
  const progress = planted ? Math.min(100, Math.max(0, (Date.now() - field.plantedAt) / (field.readyAt - field.plantedAt) * 100)) : 0;
  const status = !field.unlocked ? tr('locked') : !planted ? tr('empty') : ready ? tr('ready') : `${tr('growing')} · ${duration(field.readyAt - Date.now())}`;
  return `<button class="field-card ${selected ? 'selected' : ''} ${!field.unlocked ? 'field-locked' : ''} ${ready ? 'field-ready' : ''}" data-action="select-field" data-index="${index}" style="--crop-color:#${crop.color.toString(16)}">
    <span class="field-number">${String(index + 1).padStart(2, '0')}</span>
    <span class="field-crop">${field.unlocked ? crop.icon : '🔒'}</span>
    <span class="field-name">${cropName(index)}</span>
    <span class="field-status">${status}</span>
    ${planted ? `<span class="field-progress"><i style="width:${progress}%"></i></span>` : ''}
    ${ready ? '<span class="ready-ping"></span>' : ''}
  </button>`;
}

function fieldDetailMarkup() {
  const index = state.selectedField;
  const field = state.fields[index];
  const crop = crops[index];
  const ready = cropReady(index);
  const planted = field.plantedAt !== null;
  const action = !field.unlocked
    ? `<button class="primary-button" data-action="unlock-field" data-index="${index}">${tr('unlock')} <b>${money(fieldCosts[index])}</b></button>`
    : ready
      ? `<button class="primary-button harvest-button" data-action="harvest" data-index="${index}">${tr('harvest')} <span>↗</span></button>`
      : planted
        ? `<button class="primary-button" disabled>${tr('growing')} <span class="button-timer">${duration(field.readyAt - Date.now())}</span></button>`
        : `<button class="primary-button" data-action="plant" data-index="${index}">${tr('plant')} <span>${state.seeds[index]} ${tr('seeds').toLowerCase()}</span></button>`;
  return `<div class="detail-crop-icon" style="--crop-color:#${crop.color.toString(16)}">${crop.icon}</div>
    <div class="detail-main"><span class="eyebrow">${tr('field')} ${String(index + 1).padStart(2, '0')} · ${field.unlocked ? cropName(index) : tr('locked')}</span>
      <h3>${field.unlocked ? planted ? ready ? tr('ready') : tr('nowGrowing') : tr('empty') : cropName(index)}</h3>
      <div class="crop-stats"><span><small>${tr('growDuration')}</small><b>${crop.hours}h${state.upgrades.farming ? ' · −15%' : ''}</b></span><span><small>${tr('harvestQty')}</small><b>${number(crop.harvest, 4)}</b></span><span><small>${tr('seedPrice')}</small><b>${money(crop.seed)}</b></span></div>
    </div><div class="detail-action">${field.unlocked ? action : `<span class="unlock-sub">${tr('unlockPrice')}: ${money(fieldCosts[index])}</span>${action}`}</div>`;
}

function panelMarkup() {
  if (activeTab === 'farming') return farmingMarkup();
  if (activeTab === 'lands') return landsMarkup();
  if (activeTab === 'inventory') return inventoryMarkup();
  if (activeTab === 'shop') return shopMarkup();
  if (activeTab === 'market') return marketMarkup();
  if (activeTab === 'fishing') return fishingMarkup();
  if (activeTab === 'hive') return animalsMarkup('hive');
  if (activeTab === 'coop') return animalsMarkup('coop');
  if (activeTab === 'animals') return animalsMarkup();
  return gardenMarkup();
}

function farmingMarkup() {
  if (!state.fields[state.selectedField]?.unlocked) {
    const firstOpenField = state.fields.findIndex((field) => field.unlocked);
    if (firstOpenField >= 0) state.selectedField = firstOpenField;
  }
  return `<div class="panel-title"><span class="panel-icon green">🌱</span><div><span class="eyebrow">${tr('island')}</span><h2>${tr('fields')}</h2></div></div>
    <p class="panel-description">${tr('fieldHint')}</p>
    <div class="field-grid">${state.fields.map((field, index) => field.unlocked ? fieldMarkup(field, index) : '').join('')}</div>
    <div class="field-detail">${fieldDetailMarkup()}</div>
    <button class="secondary-button full-button" data-action="open-panel" data-tab="shop">${tr('openShop')} <span>→</span></button>`;
}

function landsMarkup() {
  return `<div class="panel-title"><span class="panel-icon green">▦</span><div><span class="eyebrow">${tr('island')}</span><h2>${tr('lands')}</h2></div></div>
    <div class="land-grid">${state.fields.map((field, index) => {
      const crop = crops[field.crop] || crops[index];
      return `<article class="land-card ${field.unlocked ? 'land-open' : 'land-locked'}">
        <div class="land-card-heading"><b class="land-number">${index + 1}</b><span class="land-status">${tr(field.unlocked ? 'landStatusOpen' : 'landStatusLocked')}</span></div>
        <div class="land-crop"><span>${crop.icon}</span><b>${tr('landCrop')}: ${cropName(field.crop)}</b></div>
        <div class="land-facts"><span>${tr('landLevel')} <b>${field.level || 1}</b></span><span>${tr('landPrice')} <b>${money(fieldCosts[index])}</b></span></div>
        ${field.unlocked ? '' : `<button class="primary-button land-unlock" data-action="unlock-field" data-index="${index}">${tr('unlock')} <b>${money(fieldCosts[index])}</b></button>`}
      </article>`;
    }).join('')}</div>`;
}

function inventoryMarkup() {
  const entries = [
    ...crops.map((crop, index) => ({
      icon: crop.icon,
      name: cropName(index),
      seeds: state.seeds[index],
      amount: state.harvest[index],
      value: state.harvest[index] * crop.unit,
    })),
    ...fishTypes.map((fish, index) => ({
      icon: fish.icon,
      name: fish.name,
      seeds: null,
      amount: state.fish[index],
      value: state.fish[index] * fish.price,
    })),
    {
      icon: '🍯',
      name: tr('honeyProduct'),
      seeds: null,
      amount: state.hive.inventory,
      value: state.hive.inventory * animalSalePrices.hive,
    },
    {
      icon: '🥚',
      name: tr('eggProduct'),
      seeds: null,
      amount: state.coop.inventory,
      value: state.coop.inventory * animalSalePrices.coop,
    },
  ];
  return `<div class="panel-title"><span class="panel-icon green">🧺</span><div><span class="eyebrow">${tr('navHint')}</span><h2>${tr('inventory')}</h2></div></div>
    <p class="panel-description">${tr('walletLocalNote')}</p>
    <div class="inventory-rows">${entries.map((entry) => `<div class="inventory-row">
      <span>${entry.icon} ${entry.name}</span>${entry.seeds === null ? '' : `<small>${tr('seeds')}: ${entry.seeds}</small>`}<b>${number(entry.amount, 2)}</b><em>${money(entry.value)}</em>
    </div>`).join('')}</div>`;
}

function gardenMarkup() {
  const seedCount = state.seeds.reduce((sum, count) => sum + count, 0);
  const cropCount = state.harvest.reduce((sum, count) => sum + count, 0);
  const fishCount = state.fish.reduce((sum, count) => sum + count, 0);
  const plantedCount = state.fields.filter((field) => field.plantedAt).length;
  return `<div class="panel-title"><span class="panel-icon green">✿</span><div><span class="eyebrow">${tr('navHint')}</span><h2>${tr('garden')}</h2></div></div>
    <p class="panel-description">${state.language === 'fr' ? 'Un petit coup de main suffit pour faire grandir votre île.' : 'A little tending goes a long way on your island.'}</p>
    <div class="garden-stats">
      <div><span>🌱</span><b>${plantedCount}/9</b><small>${tr('nowGrowing')}</small></div>
      <div><span>🌾</span><b>${number(cropCount, 1)}</b><small>${tr('produce')}</small></div>
      <div><span>🎒</span><b>${seedCount + fishCount}</b><small>${tr('basket')}</small></div>
    </div>
    <div class="panel-divider"></div>
    <div class="panel-subhead"><span>✦</span> ${tr('inventory')}</div>
    ${inventoryPreview()}
    <button class="secondary-button full-button" data-action="tab" data-tab="market">${tr('market')} <span>→</span></button>
    <div class="tip-card"><span>💡</span><span>${state.language === 'fr' ? 'Astuce : les graines correspondent toujours à leur champ.' : 'Tip: each crop’s seeds belong to its matching field.'}</span></div>`;
}

function inventoryPreview() {
  const entries = crops.map((crop, index) => ({ icon: crop.icon, name: cropName(index), amount: state.harvest[index], value: state.harvest[index] * crop.unit })).filter((entry) => entry.amount > 0);
  if (!entries.length) return `<div class="empty-state small-empty"><span>🧺</span><p>${tr('emptyBag')}</p></div>`;
  return `<div class="inventory-preview">${entries.slice(0, 3).map((entry) => `<div><span>${entry.icon} ${entry.name}</span><b>${number(entry.amount, 1)}</b></div>`).join('')}${entries.length > 3 ? `<small>+${entries.length - 3} ${tr('crops').toLowerCase()}</small>` : ''}</div>`;
}

function shopMarkup() {
  return `<div class="panel-title"><span class="panel-icon pink">✿</span><div><span class="eyebrow">${tr('seeds')}</span><h2>${tr('shop')}</h2></div></div>
    <p class="panel-description">${state.language === 'fr' ? 'Choisissez des graines pour vos parcelles débloquées.' : 'Pick up seeds for your unlocked plots.'}</p>
    <div class="shop-list">${crops.map((crop, index) => `<div class="shop-row ${state.fields[index].unlocked ? '' : 'shop-locked'}">
      <span class="shop-crop-icon" style="--crop-color:#${crop.color.toString(16)}">${crop.icon}</span>
      <span class="shop-crop-name"><b>${cropName(index)}</b><small>${tr('stock')}: ${state.seeds[index]} · ${crop.hours}h</small></span>
      <span class="shop-price">${money(crop.seed)}</span>
      <button class="icon-buy" data-action="buy-seed" data-index="${index}" aria-label="${tr('buy')} ${cropName(index)}" ${!state.fields[index].unlocked ? 'disabled title="' + tr('locked') + '"' : ''}>+</button>
    </div>`).join('')}</div>
    <div class="shop-footnote"><span>♡</span> ${state.language === 'fr' ? 'Pas d’achats intégrés — seulement des pièces de jeu fictives.' : 'No in-app purchases — just pretend game coins.'}</div>`;
}

function marketMarkup() {
  const totalValue = sellableValue();
  const marketRow = (type, index, icon, name, amount, unitPrice) => `<div class="market-row">
    <span class="market-product">${icon} ${name}</span>
    <span>${number(amount, type === 'crop' ? 2 : 0)} × ${money(unitPrice)}</span>
    <b>${money(amount * unitPrice)}</b>
    <button class="text-buy market-sell" data-action="sell-product" data-type="${type}" data-index="${index}">${tr('sell')}</button>
  </div>`;
  return `<div class="panel-title"><span class="panel-icon gold">↗</span><div><span class="eyebrow">${tr('produce')}</span><h2>${tr('market')}</h2></div></div>
    <p class="panel-description">${state.language === 'fr' ? 'Échangez vos récoltes contre des pièces de jeu.' : 'Trade your harvest for pretend game coins.'}</p>
    <div class="market-total"><span>${tr('inventory')}</span><b>${money(totalValue)}</b></div>
    <div class="market-list">${crops.map((crop, index) => state.harvest[index] > 0 ? marketRow('crop', index, crop.icon, cropName(index), state.harvest[index], crop.unit) : '').join('')}
      ${fishTypes.map((fish, index) => state.fish[index] > 0 ? marketRow('fish', index, fish.icon, state.language === 'fr' ? fish.nameFr : fish.name, state.fish[index], fish.price) : '').join('')}
      ${state.hive.inventory > 0 ? marketRow('hive', '', '🍯', tr('honeyProduct'), state.hive.inventory, animalSalePrices.hive) : ''}
      ${state.coop.inventory > 0 ? marketRow('coop', '', '🥚', tr('eggProduct'), state.coop.inventory, animalSalePrices.coop) : ''}
      ${totalValue === 0 ? `<div class="empty-state"><span>🧺</span><p>${tr('emptyBag')}</p></div>` : ''}
    </div>
    <div class="market-note"><span>ⓘ</span> ${state.language === 'fr' ? 'Les prix suivent les règles de la démo.' : 'Prices follow the approved demo game rules.'}</div>`;
}

function fishingMarkup() {
  const fishCount = state.fish.reduce((sum, amount) => sum + amount, 0);
  const fishing = state.fishing;
  const now = Date.now();
  const isWaiting = fishing.busyUntil && now < fishing.busyUntil;
  const canCollect = fishing.busyUntil && now >= fishing.busyUntil && now <= fishing.catchDeadline;
  const cooldown = fishing.cooldownUntil && now < fishing.cooldownUntil;
  const availableRod = state.equippedRod && state.ownedRods[state.equippedRod] && state.rods[state.equippedRod] > 0
    ? state.equippedRod
    : null;
  const hasOwnedRod = Object.values(state.ownedRods).some(Boolean);
  const rodLabel = (id) => tr(id);
  const fishLabel = (fish) => state.language === 'fr' ? fish.nameFr : fish.name;
  return `<div class="panel-title"><span class="panel-icon blue">♧</span><div><span class="eyebrow">${tr('ocean')}</span><h2>${tr('fishing')}</h2></div></div>
    ${!state.fishingUnlocked ? `<div class="fishing-hero"><div class="lake-illustration">🌊<span>🐟</span></div><p>${state.language === 'fr' ? 'Une crique tranquille vous attend.' : 'A quiet little fishing spot is waiting.'}</p></div>
      <button class="primary-button full-button" data-action="fish-unlock">${tr('fishingLock')} <b>${money(5)}</b></button>
      <p class="tiny-disclaimer">${state.language === 'fr' ? 'Déblocage unique de la zone.' : 'One-time fishing area unlock.'}</p>
      <p class="wallet-notice fishing-note"><span>ⓘ</span>${tr('noFishingArea')}</p>` : ''}
    <div class="fish-banner"><span class="fish-wave">〰</span><div><b>${tr('fishBag')}</b><small>${fishCount} · ${fishCount ? money(state.fish.reduce((sum, amount, i) => sum + amount * fishTypes[i].price, 0)) : tr('none')}</small></div><span>🎣</span></div>
    <div class="rod-list"><span class="list-label">${tr('rods')}</span>${Object.entries(rods).map(([id, rod]) => `<div class="rod-row"><span class="rod-icon">🎣</span><span class="rod-name"><b>${rodLabel(id)} · ${money(rod.price)}</b><small>${tr('usesPerRod')}: ${rod.uses} · ${state.rods[id]} ${tr('rodUses')}</small><small>${rod.min}–${rod.max} min · ${tr('cooldownDuration')}: ${rod.cooldown} min</small><small>${tr('attemptCost')}: ${money(rod.price / rod.uses)} ${tr('perAttempt')}</small></span>${state.ownedRods[id]
      ? `<button class="text-buy" data-action="equip-rod" data-id="${id}" ${state.equippedRod === id ? 'disabled' : ''}>${state.equippedRod === id ? tr('equippedRod') : tr('equipRod')}</button>`
      : `<button class="text-buy" data-action="buy-rod" data-id="${id}" ${!state.fishingUnlocked ? 'disabled' : ''}>${tr('buy')} · ${money(rod.price)}</button>`}</div>`).join('')}</div>
    <p class="tiny-disclaimer">${tr('noExtraAttemptFee')}</p>
    <div class="fish-odds"><span class="list-label">${tr('fishOdds')}</span><div class="fish-odds-table"><div class="fish-odds-heading"><b>${tr('fishType')}</b><b>${tr('ordinary')}</b><b>${tr('upgraded')}</b><b>${tr('legendary')}</b><b>${tr('salePrice')}</b></div>${fishTypes.map((fish, index) => `<div class="fish-odds-row"><span>${fish.icon} ${fishLabel(fish)}</span><span>${number(rods.ordinary.chance[index], 1)}%</span><span>${number(rods.upgraded.chance[index], 1)}%</span><span>${number(rods.legendary.chance[index], 1)}%</span><b>${money(fish.price)}</b></div>`).join('')}</div></div>
    ${isWaiting ? `<div class="fishing-status waiting"><span class="spinner"></span><span>${tr('fishingWait')}<b>${duration(fishing.busyUntil - now)}</b></span></div>` : ''}
    ${canCollect ? `<div class="fishing-status catch-ready"><span>🐟</span><span>${tr('fishCaught')}<b>${duration(fishing.catchDeadline - now)}</b></span></div>` : ''}
    ${cooldown ? `<div class="cooldown-line">${tr('cooldown')} <b>${duration(fishing.cooldownUntil - now)}</b></div>` : ''}
    ${!availableRod && state.fishingUnlocked ? `<p class="wallet-notice fishing-note"><span>ⓘ</span>${hasOwnedRod ? tr('equipPrompt') : tr('buyRod')}</p>` : ''}
    ${canCollect ? `<button class="primary-button full-button" data-action="fish-collect">${tr('collectFish')} <span>→</span></button>` : `<button class="primary-button full-button" data-action="${state.fishingUnlocked && availableRod && !cooldown && !isWaiting ? 'cast' : 'none'}" ${!state.fishingUnlocked || !availableRod || cooldown || isWaiting ? 'disabled' : ''} data-id="${availableRod || ''}">${tr('cast')} <span>${availableRod ? rodLabel(availableRod) : tr('buyRod')}</span></button>`}
    <p class="tiny-disclaimer">${state.language === 'fr' ? 'Pas de tentative quotidienne gratuite.' : 'No free daily fishing attempts.'}</p>`;
}

function animalsMarkup(type = null) {
  const selectedType = type === 'hive' || type === 'coop' ? type : null;
  const title = selectedType === 'hive' ? tr('beekeeping') : selectedType === 'coop' ? tr('chickenCoop') : tr('animals');
  return `<div class="panel-title"><span class="panel-icon gold">❀</span><div><span class="eyebrow">${tr('animals')}</span><h2>${selectedType ? title : state.language === 'fr' ? 'Les petits habitants' : 'Little island friends'}</h2></div></div>
    <p class="panel-description">${state.language === 'fr' ? 'Ils travaillent à leur rythme, même quand vous êtes absent.' : 'They work at their own pace, even while you’re away.'}</p>
    ${selectedType ? animalCard(selectedType) : `${animalCard('hive')}${animalCard('coop')}`}
    <div class="animal-footnote">${selectedType === 'coop' ? '🥚' : '🐝'} ${state.language === 'fr' ? 'Les produits expirent 6 h après la fin du cycle.' : 'Products expire 6 h after the cycle ends.'}</div>`;
}

function animalCard(type) {
  const data = state[type];
  const isHive = type === 'hive';
  const label = isHive ? tr('beekeeping') : tr('chickenCoop');
  const icon = isHive ? '🐝' : '🐔';
  const price = isHive ? 3 : 5;
  const fee = isHive ? 0.2 : 0.4;
  const ready = animalProductCount(type);
  const max = isHive ? 2 : 3;
  const countReady = animalReady(type);
  const boost = state.upgrades[isHive ? 'bee' : 'chicken'] ? 0.85 : 1;
  const complete = countReady >= max;
  const speed = data.speed || boost;
  const running = isAnimalProducing(data);
  const nextAt = running ? data.startedAt + (isHive ? 12 * HOUR : 8 * HOUR) * speed * (countReady + 1) : 0;
  const expiresAt = running ? data.startedAt + DAY * speed + 6 * HOUR : 0;
  const status = !data.owned
    ? tr(isHive ? 'hiveYield' : 'coopYield')
    : !data.activated
      ? tr('notActivated')
      : running
        ? complete ? tr('readyProducts') : tr('productionRunning')
        : data.expired
          ? tr('expired')
          : tr('productionStopped');
  const productionLabel = ready ? `${ready} ${isHive ? '🍯' : '🥚'} · ` : '';
  const timerLabel = running
    ? complete ? tr('readyProducts') : `${tr('cycleProgress')} · ${duration(Math.max(0, nextAt - Date.now()))}`
    : data.expired ? tr('expired') : tr('productionStopped');
  return `<div class="animal-card">
    <div class="animal-card-top"><span class="animal-icon">${icon}</span><div><b>${label}</b><small>${status}</small></div><span class="animal-state ${data.owned ? 'state-owned' : ''}">${data.owned ? '●' : '○'}</span></div>
    ${!data.owned ? `<button class="secondary-button full-button" data-action="buy-animal" data-id="${type}">${isHive ? tr('buyHive') : tr('buyCoop')} <span>${money(price)}</span></button>` : !data.activated
      ? `<button class="secondary-button full-button" data-action="activate-animal" data-id="${type}">${tr('activate')}</button>`
      : `<div class="animal-progress"><span><i style="width:${Math.min(100, countReady / max * 100)}%"></i></span><small>${productionLabel}${timerLabel} · ${tr('stock')}: ${data.inventory}</small></div>
      <div class="animal-actions">${ready > 0 ? `<button class="secondary-button" data-action="collect-animal" data-id="${type}">${isHive ? tr('collectHoney') : tr('collectEggs')} <b>+${ready}</b></button>` : ''}
      ${!running || data.expired ? `<button class="primary-button" data-action="animal-cycle" data-id="${type}">${tr('startCycle')} <span>${money(fee)}</span></button>` : ''}
      ${running ? `<small class="expiry-text">${tr('cycleFee')}: ${money(fee)}</small>` : ''}
      ${running && !complete ? `<small class="expiry-text">${tr('expires')} ${duration(expiresAt - Date.now())}</small>` : ''}</div>`}
  </div>`;
}

function bindActions() {
  app.querySelectorAll('[data-action]').forEach((element) => {
    element.addEventListener('click', (event) => {
      if (element.classList.contains('panel-backdrop') && event.target.closest('[data-panel]')) return;
      const { action, index, tab, id } = element.dataset;
      const fieldIndex = Number(index);
      switch (action) {
        case 'play-now': enterDemo(); break;
        case 'auth-back': appScreen = 'welcome'; render(); break;
        case 'auth-mode': authMode = element.dataset.mode; render(); break;
        case 'welcome-auth': appScreen = 'auth'; authMode = element.dataset.mode; render(); break;
        case 'enter-demo': enterDemo(); break;
        case 'tab':
        case 'open-panel':
          fieldActionOpen = false;
          if (tab === 'wallet') walletView = 'overview';
          activeTab = tab;
          render();
          break;
        case 'wallet-view': walletView = element.dataset.view; render(); break;
        case 'wallet-back': walletView = 'overview'; render(); break;
        case 'panel-zoom-in':
          panelZoom = Math.min(1.2, Number((panelZoom + 0.1).toFixed(2)));
          render();
          break;
        case 'panel-zoom-out':
          panelZoom = Math.max(0.8, Number((panelZoom - 0.1).toFixed(2)));
          render();
          break;
        case 'toggle-audio': {
          const channel = element.dataset.channel;
          if (channel === 'master' || channel === 'music' || channel === 'ambient') {
            state.audio[channel].muted = !state.audio[channel].muted;
            audioEngine.setSettings(state.audio);
            save();
            render();
          }
          break;
        }
        case 'task-plant': {
          const index = state.fields.findIndex((field, fieldIndex) => field.unlocked && !field.plantedAt && state.seeds[field.crop] > 0);
          if (index >= 0) {
            state.selectedField = index;
            activeTab = 'garden';
            render();
          } else {
            activeTab = 'shop';
            render();
          }
          break;
        }
        case 'task-harvest': {
          const index = state.fields.findIndex((field, fieldIndex) => cropReady(fieldIndex));
          if (index >= 0) {
            state.selectedField = index;
            activeTab = 'garden';
            render();
          } else {
            activeTab = 'garden';
            render();
          }
          break;
        }
        case 'task-market':
          if (hasReadyCrop()) {
            state.selectedField = state.fields.findIndex((field, fieldIndex) => cropReady(fieldIndex));
            activeTab = 'garden';
          } else {
            const index = state.fields.findIndex((field) => field.unlocked && !field.plantedAt && state.seeds[field.crop] > 0);
            state.selectedField = index >= 0 ? index : state.selectedField;
            activeTab = index >= 0 ? 'garden' : 'shop';
          }
          render();
          break;
        case 'close-panel': activeTab = 'garden'; render(); break;
        case 'language': state.language = state.language === 'en' ? 'fr' : 'en'; save(); render(); break;
        case 'select-field': state.selectedField = fieldIndex; render(); break;
        case 'unlock-field': unlockField(fieldIndex); break;
        case 'plant': plantField(fieldIndex); break;
        case 'harvest': harvestField(fieldIndex); break;
        case 'buy-seed': buySeed(fieldIndex); break;
        case 'sell-product': sellProduct(element.dataset.type, Number(index)); break;
        case 'upgrade': buyUpgrade(id); break;
        case 'fish-unlock': buyFishingArea(); break;
        case 'buy-rod': buyRod(id); break;
        case 'equip-rod': equipRod(id); break;
        case 'cast': castLine(id); break;
        case 'fish-collect': collectFish(); break;
        case 'buy-animal': buyAnimal(id); break;
        case 'activate-animal': activateAnimal(id); break;
        case 'animal-cycle': startAnimalCycle(id); break;
        case 'collect-animal': collectAnimal(id); break;
        case 'welcome': state.seenWelcome = true; save(); render(); break;
        default: break;
      }
    });
  });
  app.querySelectorAll('[data-audio-volume]').forEach((element) => {
    element.addEventListener('input', () => {
      const channel = element.dataset.audioVolume;
      if (channel !== 'master' && channel !== 'music' && channel !== 'ambient') return;
      const volume = Number(element.value);
      if (!Number.isFinite(volume)) return;
      state.audio[channel].volume = Math.min(100, Math.max(0, volume));
      audioEngine.setSettings(state.audio);
      save();
      const output = app.querySelector(`[data-audio-value="${channel}"]`);
      if (output) output.value = `${state.audio[channel].volume}%`;
    });
  });
}

function enterDemo() {
  appScreen = 'game';
  state.seenWelcome = true;
  save();
  render();
  audioEngine.start(state.audio, activeTab);
  if (!game) startGame();
}

function updateScene() {
  if (scene) scene.paintIsland(state.fields);
}

function hasReadyCrop() {
  return state.fields.some((field, index) => cropReady(index));
}

class ArchivedIslandScene extends Phaser.Scene {
  constructor() {
    super('island');
    this.ticks = 0;
  }

  create() {
    this.water = this.add.graphics();
    this.island = this.add.graphics();
    this.decor = this.add.graphics();
    this.fieldGraphics = this.add.graphics();
    this.particles = this.add.graphics();
    this.cameras.main.setBackgroundColor('#83d4d1');
    this.paintIsland(state.fields);
    this.events.on('resize', () => this.paintIsland(state.fields));
  }

  update(_time, delta) {
    this.ticks += delta;
    if (this.ticks > 180) {
      this.ticks = 0;
      this.paintIsland(state.fields);
    }
  }

  paintIsland(fields) {
    if (!this.water || !this.game) return;
    const width = this.scale.width;
    const height = this.scale.height;
    const sx = width / 800;
    const sy = height / 440;
    this.water.clear();
    this.water.fillStyle(0x78c9c6, 1);
    this.water.fillRect(0, 0, width, height);
    for (let row = 0; row < 10; row += 1) {
      for (let col = 0; col < 17; col += 1) {
        const wave = Math.sin((col * 0.7 + row * 0.5 + this.time.now / 450) * 1.4) * 4;
        const x = (col * 54 + (row % 2) * 22) * sx;
        const y = (row * 49 + 12 + wave) * sy;
        this.water.fillStyle((row + col) % 3 ? 0x92ded3 : 0x67bdbf, 0.45);
        this.water.fillRect(x, y, 18 * sx, 3 * sy);
        this.water.fillStyle(0xd1f1db, 0.55);
        this.water.fillRect((x + 24 * sx) % width, y + 14 * sy, 6 * sx, 2 * sy);
      }
    }
    this.island.clear();
    this.island.fillStyle(0x3f9b76, 0.17);
    this.island.fillEllipse(405 * sx, 239 * sy, 610 * sx, 285 * sy);
    this.island.fillStyle(0xd9b878, 1);
    this.island.fillEllipse(400 * sx, 218 * sy, 570 * sx, 280 * sy);
    this.island.fillStyle(0x8eca79, 1);
    this.island.fillEllipse(399 * sx, 201 * sy, 535 * sx, 252 * sy);
    this.island.fillStyle(0x6dae66, 0.5);
    this.island.fillEllipse(400 * sx, 206 * sy, 455 * sx, 205 * sy);
    this.decor.clear();
    this.drawTree(this.decor, 178, 112, sx, sy, 1);
    this.drawTree(this.decor, 260, 152, sx, sy, 0.75);
    this.drawTree(this.decor, 607, 117, sx, sy, 0.9);
    this.drawTree(this.decor, 647, 235, sx, sy, 0.7);
    this.drawTree(this.decor, 233, 264, sx, sy, 0.65);
    this.drawBarn(this.decor, 538, 171, sx, sy);
    this.drawChicken(this.decor, 580, 247, sx, sy);
    this.drawBee(this.decor, 326 + Math.sin(this.time.now / 350) * 7, 112 + Math.cos(this.time.now / 270) * 4, sx, sy);
    this.drawPath(this.decor, sx, sy);
    this.paintFields(fields, sx, sy);
    this.particles.clear();
    for (let i = 0; i < 8; i += 1) {
      const x = (65 + i * 92 + Math.sin(this.time.now / 800 + i) * 9) * sx;
      const y = (85 + (i % 4) * 78 + Math.cos(this.time.now / 600 + i * 2) * 6) * sy;
      this.particles.fillStyle(i % 2 ? 0xfff4a2 : 0xffffff, 0.8);
      this.particles.fillRect(x, y, 3 * sx, 3 * sy);
    }
  }

  paintFields(fields, sx, sy) {
    this.fieldGraphics.clear();
    const positions = [[331, 190], [377, 181], [423, 174], [331, 232], [377, 224], [423, 216], [331, 274], [377, 266], [423, 258]];
    positions.forEach(([x, y], index) => {
      const field = fields[index];
      const planted = field.plantedAt !== null;
      const stage = cropStage(index);
      this.fieldGraphics.fillStyle(field.unlocked ? 0x7c543b : 0x8f7a60, 1);
      this.fieldGraphics.fillRect(x * sx, y * sy, 36 * sx, 26 * sy);
      this.fieldGraphics.fillStyle(field.unlocked ? 0xb7804a : 0xb3a080, 1);
      for (let line = 0; line < 3; line += 1) this.fieldGraphics.fillRect((x + 3) * sx, (y + 5 + line * 7) * sy, 30 * sx, 2 * sy);
      this.fieldGraphics.lineStyle(1.5 * sx, state.selectedField === index ? 0xfff5a0 : 0xe5c98e, 1);
      this.fieldGraphics.strokeRect((x - 1) * sx, (y - 1) * sy, 38 * sx, 28 * sy);
      if (!field.unlocked) {
        this.fieldGraphics.fillStyle(0xffffff, 0.9);
        this.fieldGraphics.fillRect((x + 14) * sx, (y + 7) * sy, 9 * sx, 8 * sy);
        this.fieldGraphics.fillStyle(0x796a55, 1);
        this.fieldGraphics.fillRect((x + 15) * sx, (y + 11) * sy, 7 * sx, 5 * sy);
      } else if (planted) {
        const color = crops[index].color;
        const sproutCount = 3 + stage;
        for (let plant = 0; plant < sproutCount; plant += 1) {
          const px = x + 5 + (plant % 4) * 8;
          const py = y + 3 + Math.floor(plant / 4) * 10;
          this.fieldGraphics.fillStyle(0x347c47, 1);
          this.fieldGraphics.fillRect((px + 2) * sx, (py + (stage === 1 ? 3 : 0)) * sy, 2 * sx, (stage + 2) * sy);
          this.fieldGraphics.fillStyle(stage === 1 ? 0x6dbd69 : color, 1);
          this.fieldGraphics.fillRect(px * sx, py * sy, 5 * sx, 3 * sy);
          this.fieldGraphics.fillRect((px + 3) * sx, (py + 2) * sy, 4 * sx, 3 * sy);
        }
      }
      this.fieldGraphics.fillStyle(0xfff6df, 1);
      this.fieldGraphics.fillRect((x + 13) * sx, (y + 28) * sy, 11 * sx, 7 * sy);
      this.fieldGraphics.fillStyle(0x52614d, 1);
      this.fieldGraphics.fillRect((x + 15) * sx, (y + 29) * sy, 8 * sx, 5 * sy);
      this.fieldGraphics.fillStyle(0xffffff, 1);
      this.fieldGraphics.fillRect((x + 17) * sx, (y + 30) * sy, 2 * sx, 2 * sy);
      this.fieldGraphics.fillStyle(0x415947, 1);
      this.fieldGraphics.fillRect((x + 18) * sx, (y + 37) * sy, 2 * sx, 4 * sy);
    });
  }

  drawTree(graphics, x, y, sx, sy, scale) {
    graphics.fillStyle(0x806049, 1);
    graphics.fillRect((x - 4 * scale) * sx, (y + 17 * scale) * sy, 8 * scale * sx, 18 * scale * sy);
    graphics.fillStyle(0x43875c, 1);
    graphics.fillRect((x - 18 * scale) * sx, y * sy, 36 * scale * sx, 22 * scale * sy);
    graphics.fillStyle(0x66a969, 1);
    graphics.fillRect((x - 13 * scale) * sx, (y - 5 * scale) * sy, 26 * scale * sx, 12 * scale * sy);
    graphics.fillStyle(0x9bc775, 1);
    graphics.fillRect((x - 5 * scale) * sx, (y - 7 * scale) * sy, 7 * scale * sx, 4 * scale * sy);
  }

  drawBarn(graphics, x, y, sx, sy) {
    graphics.fillStyle(0xf6e6bd, 1);
    graphics.fillRect(x * sx, y * sy, 64 * sx, 47 * sy);
    graphics.fillStyle(0xd47861, 1);
    graphics.fillRect((x - 5) * sx, (y - 7) * sy, 74 * sx, 12 * sy);
    graphics.fillStyle(0xb9574f, 1);
    graphics.fillRect((x + 7) * sx, (y - 16) * sy, 49 * sx, 12 * sy);
    graphics.fillStyle(0xa7524b, 1);
    graphics.fillRect((x + 24) * sx, (y + 22) * sy, 18 * sx, 25 * sy);
    graphics.lineStyle(2 * sx, 0xffe9c8, 1);
    graphics.lineBetween((x + 24) * sx, (y + 22) * sy, (x + 33) * sx, (y + 31) * sy);
    graphics.lineBetween((x + 42) * sx, (y + 22) * sy, (x + 33) * sx, (y + 31) * sy);
    graphics.fillStyle(0x9a6d4c, 1);
    graphics.fillRect((x + 9) * sx, (y + 13) * sy, 10 * sx, 10 * sy);
    graphics.fillRect((x + 46) * sx, (y + 13) * sy, 10 * sx, 10 * sy);
    graphics.fillStyle(0xb6e0dc, 1);
    graphics.fillRect((x + 11) * sx, (y + 15) * sy, 6 * sx, 6 * sy);
    graphics.fillRect((x + 48) * sx, (y + 15) * sy, 6 * sx, 6 * sy);
  }

  drawChicken(graphics, x, y, sx, sy) {
    graphics.fillStyle(0xfaf1d7, 1);
    graphics.fillRect(x * sx, y * sy, 15 * sx, 10 * sy);
    graphics.fillRect((x + 10) * sx, (y - 4) * sy, 7 * sx, 7 * sy);
    graphics.fillStyle(0xe77d65, 1);
    graphics.fillRect((x + 11) * sx, (y - 7) * sy, 5 * sx, 3 * sy);
    graphics.fillRect((x + 17) * sx, (y - 1) * sy, 4 * sx, 2 * sy);
    graphics.fillStyle(0x425347, 1);
    graphics.fillRect((x + 14) * sx, (y - 2) * sy, 2 * sx, 2 * sy);
    graphics.fillStyle(0xd7a958, 1);
    graphics.fillRect((x + 3) * sx, (y + 9) * sy, 2 * sx, 5 * sy);
    graphics.fillRect((x + 10) * sx, (y + 9) * sy, 2 * sx, 5 * sy);
  }

  drawBee(graphics, x, y, sx, sy) {
    graphics.fillStyle(0xf3bd46, 1);
    graphics.fillRect(x * sx, y * sy, 10 * sx, 6 * sy);
    graphics.fillStyle(0x4d5744, 1);
    graphics.fillRect((x + 4) * sx, y * sy, 2 * sx, 6 * sy);
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillRect((x + 1) * sx, (y - 4) * sy, 4 * sx, 3 * sy);
    graphics.fillRect((x + 7) * sx, (y - 4) * sy, 4 * sx, 3 * sy);
  }

  drawPath(graphics, sx, sy) {
    graphics.lineStyle(12 * sx, 0xd7bb83, 0.9);
    graphics.lineBetween(310 * sx, 308 * sy, 301 * sx, 327 * sy);
    graphics.lineBetween(301 * sx, 327 * sy, 289 * sx, 334 * sy);
    graphics.lineStyle(3 * sx, 0x9a855e, 0.45);
    graphics.lineBetween(310 * sx, 308 * sy, 301 * sx, 327 * sy);
  }
}

class IslandScene extends Phaser.Scene {
  constructor() {
    super('island');
    this.lastPaint = 0;
    this.mapZoom = 1;
    this.mapPanX = 0;
    this.mapPanY = 0;
    this.drag = null;
    this.fieldPositions = [[420, 369], [500, 369], [580, 369], [420, 439], [500, 439], [580, 439], [420, 509], [500, 509], [580, 509]];
  }

  create() {
    this.water = this.add.graphics();
    this.shore = this.add.graphics();
    this.paths = this.add.graphics();
    this.decor = this.add.graphics();
    this.fieldsGraphic = this.add.graphics();
    this.creatures = this.add.graphics();
    this.cameras.main.setBackgroundColor('#38b7b8');
    this.bindWorldInput();
    this.scale.on('resize', () => this.paintIsland(state.fields));
    this.paintIsland(state.fields);
  }

  bindWorldInput() {
    this.input.on('pointerdown', (pointer) => {
      this.drag = {
        id: pointer.id,
        startX: pointer.x,
        startY: pointer.y,
        lastX: pointer.x,
        lastY: pointer.y,
        moved: false,
      };
    });
    this.input.on('pointermove', (pointer) => {
      if (!this.drag || this.drag.id !== pointer.id || !pointer.isDown) return;
      const deltaX = pointer.x - this.drag.lastX;
      const deltaY = pointer.y - this.drag.lastY;
      if (Math.hypot(pointer.x - this.drag.startX, pointer.y - this.drag.startY) > 6) this.drag.moved = true;
      if (this.drag.moved) {
        this.mapPanX += deltaX;
        this.mapPanY += deltaY;
        this.clampPan();
        this.resizeLandscape(this.scale.width, this.scale.height);
        this.paintIsland(state.fields);
      }
      this.drag.lastX = pointer.x;
      this.drag.lastY = pointer.y;
    });
    this.input.on('pointerup', (pointer) => {
      if (!this.drag || this.drag.id !== pointer.id) return;
      this.drag = null;
    });
    this.input.on('wheel', (_pointer, _objects, _deltaX, deltaY) => this.zoomMap(deltaY < 0 ? 1.12 : 1 / 1.12));
  }

  update(time) {
    if (time - this.lastPaint >= 150) {
      this.lastPaint = time;
      this.paintIsland(state.fields);
    }
  }

  point(x, y) {
    const unit = this.mapScale();
    const { offsetX, offsetY } = this.mapOffset(unit);
    return [offsetX + x * unit, offsetY + y * unit];
  }

  mapScale() {
    const width = this.scale.width;
    const height = this.scale.height;
    if (!width || !height) return 1;
    const mobile = width / height < 0.82;
    const fit = Math.min(width / 1000, height / 700);
    const framed = mobile
      ? Math.min(width / 460, height / 550)
      : Math.min(width / 850, height / 610);
    return Math.max(fit, framed) * this.mapZoom;
  }

  mapOffset(unit = this.mapScale()) {
    const focusY = this.scale.width / this.scale.height < 0.82 ? 430 : 350;
    return {
      offsetX: this.scale.width / 2 - 500 * unit + this.mapPanX,
      offsetY: this.scale.height / 2 - focusY * unit + this.mapPanY,
    };
  }

  clampPan() {
    const unit = this.mapScale();
    const maxX = Math.max(0, (1000 * unit - this.scale.width) / 2 + 40 * unit);
    const maxY = Math.max(0, (700 * unit - this.scale.height) / 2 + 40 * unit);
    this.mapPanX = Phaser.Math.Clamp(this.mapPanX, -maxX, maxX);
    this.mapPanY = Phaser.Math.Clamp(this.mapPanY, -maxY, maxY);
  }

  zoomMap(factor) {
    if (!Number.isFinite(factor)) return;
    this.mapZoom = Phaser.Math.Clamp(this.mapZoom * factor, 0.72, 2.2);
    this.clampPan();
    this.resizeLandscape(this.scale.width, this.scale.height);
    this.paintIsland(state.fields);
  }

  centerMap() {
    this.mapZoom = 1;
    this.mapPanX = 0;
    this.mapPanY = 0;
    this.resizeLandscape(this.scale.width, this.scale.height);
    this.paintIsland(state.fields);
  }

  drawLine(graphics, points, color, thickness, unit, alpha = 1) {
    graphics.lineStyle(thickness * unit, color, alpha);
    for (let i = 1; i < points.length; i += 1) {
      graphics.lineBetween(...this.point(...points[i - 1]), ...this.point(...points[i]));
    }
  }

  paintIsland(fields) {
    if (!this.water || !this.scale.width || !this.scale.height) return;
    const width = this.scale.width;
    const height = this.scale.height;
    const unit = Math.min(width / 1000, height / 700);
    const [centerX, centerY] = this.point(500, 350);
    const dot = (graphics, x, y, radius, color, alpha = 1) => {
      const [cx, cy] = this.point(x, y);
      graphics.fillStyle(color, alpha);
      graphics.fillCircle(cx, cy, radius * unit);
    };
    const time = this.time.now / 500;
    this.water.clear();
    this.water.fillStyle(0x37b5b9, 1);
    this.water.fillRect(0, 0, width, height);
    for (let row = 0; row < 12; row += 1) {
      for (let col = 0; col < 16; col += 1) {
        const [x, y] = this.point(22 + col * 66 + (row % 2) * 20, row * 61 + 14 + Math.sin(time + col + row * 0.8) * 5);
        this.water.lineStyle(2 * unit, (row + col) % 3 ? 0x9ce7db : 0x78d4d2, 0.8);
        this.water.beginPath();
        this.water.arc(x, y, (8 + col % 3) * unit, 0.15, 2.8);
        this.water.strokePath();
        if ((row + col) % 5 === 0) dot(this.water, 30 + col * 61, row * 61 + 30, 2, 0xd7fff0, 0.8);
      }
    }
    this.shore.clear();
    this.shore.fillStyle(0x286f68, 0.35);
    this.shore.fillEllipse(centerX + 3 * unit, centerY + 17 * unit, width * 0.92, height * 0.83);
    this.shore.fillStyle(0xd9b879, 1);
    this.shore.fillEllipse(centerX, centerY, width * 0.9, height * 0.81);
    this.shore.fillStyle(0x8bc875, 1);
    this.shore.fillEllipse(centerX, centerY - height * 0.025, width * 0.85, height * 0.75);
    this.shore.fillStyle(0x73b867, 0.45);
    this.shore.fillEllipse(centerX - 12 * unit, centerY, width * 0.76, height * 0.65);
    this.shore.fillStyle(0xa0d27a, 0.36);
    this.shore.fillEllipse(centerX - width * 0.04, centerY - height * 0.11, width * 0.55, height * 0.37);

    this.paths.clear();
    const roads = [
      [[500, 311], [500, 343], [500, 557]],
      [[500, 319], [445, 342], [369, 366], [324, 375]],
      [[500, 319], [581, 315], [649, 286]],
      [[500, 346], [426, 397], [362, 466], [319, 493]],
      [[581, 406], [692, 411], [773, 411]],
    ];
    roads.forEach((road) => {
      this.drawLine(this.paths, road, 0x9a7750, 22, unit, 0.72);
      this.drawLine(this.paths, road, 0xd7bc83, 14, unit);
      road.slice(1, -1).forEach(([x, y], i) => dot(this.paths, x + (i % 2 ? 7 : -6), y - 4, 2, 0x94734f, 0.6));
    });

    this.decor.clear();
    this.drawTree(this.decor, 158, 282, 1, unit);
    this.drawTree(this.decor, 180, 425, 0.7, unit);
    this.drawTree(this.decor, 838, 278, 0.86, unit);
    this.drawTree(this.decor, 840, 532, 0.76, unit);
    this.drawPalm(this.decor, 715, 530, unit);
    this.drawFlowers(this.decor, dot, unit);
    this.drawFarmhouse(this.decor, unit);
    this.drawMarket(this.decor, unit);
    this.drawHive(this.decor, unit);
    this.drawCoop(this.decor, unit);
    this.drawDock(this.decor, unit, time);
    this.paintFields(fields, unit);

    this.creatures.clear();
    this.drawChicken(this.creatures, 277 + Math.sin(time * 1.3) * 9, 512 + Math.cos(time) * 5, unit);
    this.drawChicken(this.creatures, 330 + Math.sin(time + 2) * 8, 538 + Math.sin(time * 0.9) * 5, unit, 0.76);
    this.drawBee(this.creatures, 702 + Math.sin(time * 2) * 17, 228 + Math.cos(time * 1.5) * 10, unit);
    this.drawBee(this.creatures, 740 + Math.cos(time * 1.7) * 13, 247 + Math.sin(time * 2) * 11, unit, 0.72);
  }

  drawFarmhouse(g, unit) {
    const [x, y] = this.point(500, 220);
    const w = 126 * unit;
    const h = 84 * unit;
    g.fillStyle(0x4a7a4b, 0.24);
    g.fillEllipse(x, y + 34 * unit, w * 1.4, h * 0.45);
    g.fillStyle(0xf4dfb3, 1);
    g.fillRoundedRect(x - w * 0.42, y, w * 0.84, h * 0.78, 7 * unit);
    g.fillStyle(0x9a5c51, 1);
    g.fillTriangle(x - w * 0.56, y + 5 * unit, x, y - h * 0.5, x + w * 0.56, y + 5 * unit);
    g.fillStyle(0xc77b68, 1);
    g.fillTriangle(x - w * 0.46, y + 2 * unit, x, y - h * 0.39, x + w * 0.46, y + 2 * unit);
    g.fillStyle(0xf5d9a8, 1);
    g.fillRoundedRect(x - 13 * unit, y + 25 * unit, 26 * unit, 41 * unit, 5 * unit);
    g.fillStyle(0x87564a, 1);
    g.fillRoundedRect(x - 10 * unit, y + 28 * unit, 20 * unit, 39 * unit, 4 * unit);
    g.fillCircle(x + 6 * unit, y + 49 * unit, 2 * unit);
    for (const side of [-1, 1]) {
      g.fillStyle(0xa8d4d0, 1);
      g.fillRoundedRect(x + side * 31 * unit - 8 * unit, y + 19 * unit, 16 * unit, 20 * unit, 3 * unit);
      g.lineStyle(2 * unit, 0xfff1d2, 1);
      g.lineBetween(x + side * 31 * unit, y + 19 * unit, x + side * 31 * unit, y + 39 * unit);
      g.lineBetween(x + side * 31 * unit - 8 * unit, y + 29 * unit, x + side * 31 * unit + 8 * unit, y + 29 * unit);
    }
    g.fillStyle(0x986c52, 1);
    g.fillRect(x + 31 * unit, y - 35 * unit, 12 * unit, 31 * unit);
    g.fillStyle(0xd48b71, 1);
    g.fillRect(x + 28 * unit, y - 38 * unit, 18 * unit, 6 * unit);
    g.fillStyle(0xb18b5c, 1);
    g.fillRoundedRect(x - 23 * unit, y + 66 * unit, 46 * unit, 8 * unit, 3 * unit);
  }

  drawMarket(g, unit) {
    const [x, y] = this.point(288, 362);
    g.fillStyle(0x5d6e48, 0.28);
    g.fillEllipse(x, y + 40 * unit, 136 * unit, 30 * unit);
    g.fillStyle(0x8f6948, 1);
    g.fillRoundedRect(x - 51 * unit, y - 1 * unit, 102 * unit, 47 * unit, 5 * unit);
    g.fillStyle(0xe5bb7d, 1);
    g.fillRect(x - 48 * unit, y + 22 * unit, 96 * unit, 8 * unit);
    g.fillStyle(0x9c5d4e, 1);
    g.fillTriangle(x - 65 * unit, y + 4 * unit, x - 49 * unit, y - 31 * unit, x + 51 * unit, y - 31 * unit);
    g.fillTriangle(x - 49 * unit, y - 31 * unit, x + 65 * unit, y + 4 * unit, x + 51 * unit, y - 31 * unit);
    [0xf4e2bd, 0xcf7868, 0xf4e2bd, 0xcf7868, 0xf4e2bd].forEach((color, i) => {
      g.fillStyle(color, 1);
      g.fillTriangle(x - 58 * unit + i * 23 * unit, y + 2 * unit, x - 47 * unit + i * 23 * unit, y - 28 * unit, x - 36 * unit + i * 23 * unit, y + 2 * unit);
    });
    g.fillStyle(0xb98150, 1);
    g.fillRoundedRect(x - 39 * unit, y + 29 * unit, 34 * unit, 19 * unit, 3 * unit);
    g.fillRoundedRect(x + 8 * unit, y + 29 * unit, 34 * unit, 19 * unit, 3 * unit);
    [[-24, 28, 0x75a85a], [-9, 30, 0xe88a52], [22, 27, 0xc85158], [37, 29, 0xf0c65d]].forEach(([dx, dy, color]) => {
      g.fillStyle(color, 1);
      g.fillCircle(x + dx * unit, y + dy * unit, 7 * unit);
    });
  }

  drawHive(g, unit) {
    const [x, y] = this.point(690, 255);
    g.fillStyle(0x63824c, 0.25);
    g.fillEllipse(x, y + 25 * unit, 117 * unit, 29 * unit);
    g.fillStyle(0x9b6e49, 1);
    g.fillRoundedRect(x - 30 * unit, y - 17 * unit, 60 * unit, 44 * unit, 9 * unit);
    g.fillStyle(0xf0d69d, 1);
    g.fillRoundedRect(x - 24 * unit, y - 10 * unit, 48 * unit, 34 * unit, 8 * unit);
    g.fillStyle(0x815b3c, 1);
    g.fillEllipse(x, y + 16 * unit, 10 * unit, 5 * unit);
    g.fillStyle(0xb9844e, 1);
    g.fillTriangle(x - 40 * unit, y - 12 * unit, x, y - 46 * unit, x + 40 * unit, y - 12 * unit);
    g.fillStyle(0xd5a65d, 1);
    g.fillTriangle(x - 31 * unit, y - 15 * unit, x, y - 40 * unit, x + 31 * unit, y - 15 * unit);
    for (let i = 0; i < 5; i += 1) {
      const fx = x - 57 * unit + i * 28 * unit;
      const fy = y + (34 + Math.sin(i * 2) * 5) * unit;
      g.lineStyle(2 * unit, 0x52894c, 1);
      g.lineBetween(fx, fy, fx, fy - 16 * unit);
      g.fillStyle(i % 2 ? 0xe99b92 : 0xf3d46d, 1);
      for (let petal = 0; petal < 5; petal += 1) {
        const angle = Math.PI * petal * 2 / 5;
        g.fillCircle(fx + Math.cos(angle) * 4 * unit, fy - 17 * unit + Math.sin(angle) * 4 * unit, 3.5 * unit);
      }
      g.fillStyle(0xe7a543, 1);
      g.fillCircle(fx, fy - 17 * unit, 3 * unit);
    }
  }

  drawCoop(g, unit) {
    const [x, y] = this.point(303, 505);
    g.fillStyle(0x567e4a, 0.2);
    g.fillEllipse(x, y + 42 * unit, 145 * unit, 34 * unit);
    g.fillStyle(0xf1d39a, 1);
    g.fillRoundedRect(x - 40 * unit, y - 18 * unit, 80 * unit, 54 * unit, 5 * unit);
    g.fillStyle(0xb75f50, 1);
    g.fillTriangle(x - 49 * unit, y - 14 * unit, x, y - 50 * unit, x + 49 * unit, y - 14 * unit);
    g.fillStyle(0xd88467, 1);
    g.fillTriangle(x - 36 * unit, y - 17 * unit, x, y - 42 * unit, x + 36 * unit, y - 17 * unit);
    g.fillStyle(0x76513a, 1);
    g.fillRoundedRect(x - 11 * unit, y + 2 * unit, 24 * unit, 35 * unit, 8 * unit);
    this.drawLine(g, [[230, 517], [230, 575], [378, 575], [378, 517]], 0xf4e3c2, 3, unit);
    this.drawLine(g, [[230, 539], [378, 539]], 0xf4e3c2, 2, unit);
    for (let i = 0; i < 9; i += 1) {
      const [fx, fy] = this.point(230 + i * 18.5, 517);
      g.lineStyle(2.5 * unit, 0xf4e3c2, 1);
      g.lineBetween(fx, fy, fx, fy + 58 * unit);
    }
  }

  drawDock(g, unit, time) {
    const [x, y] = this.point(795, 411);
    g.fillStyle(0x60bfd1, 0.35);
    g.fillEllipse(x + 20 * unit, y + 31 * unit, 145 * unit, 81 * unit);
    g.fillStyle(0x835d42, 1);
    g.fillRoundedRect(x - 5 * unit, y - 19 * unit, 124 * unit, 28 * unit, 5 * unit);
    for (let i = 0; i < 7; i += 1) {
      g.fillStyle(i % 2 ? 0xb98554 : 0xd0a067, 1);
      g.fillRect(x + i * 16 * unit, y - 16 * unit, 12 * unit, 22 * unit);
    }
    g.fillStyle(0x704f3c, 1);
    g.fillRect(x + 4 * unit, y - 25 * unit, 6 * unit, 38 * unit);
    g.fillRect(x + 104 * unit, y - 25 * unit, 6 * unit, 38 * unit);
    const bx = x + 22 * unit + Math.sin(time) * 4 * unit;
    const by = y + 43 * unit + Math.cos(time * 1.2) * 3 * unit;
    g.fillStyle(0x845844, 1);
    g.fillTriangle(bx - 39 * unit, by, bx - 28 * unit, by + 18 * unit, bx + 39 * unit, by + 14 * unit);
    g.fillTriangle(bx + 39 * unit, by + 14 * unit, bx + 50 * unit, by, bx - 39 * unit, by);
    g.fillStyle(0xd5ab68, 1);
    g.fillEllipse(bx + 4 * unit, by + 3 * unit, 70 * unit, 13 * unit);
    g.lineStyle(2 * unit, 0xf5e8ca, 1);
    g.lineBetween(bx + 3 * unit, by - 35 * unit, bx + 3 * unit, by - 2 * unit);
    g.fillStyle(0xf4f0dc, 1);
    g.fillTriangle(bx + 6 * unit, by - 32 * unit, bx + 6 * unit, by - 6 * unit, bx + 28 * unit, by - 7 * unit);
    for (let i = 0; i < 3; i += 1) {
      const fx = x + 126 * unit + Math.sin(time + i) * 9 * unit;
      const fy = y + (i - 1) * 22 * unit + Math.cos(time * 1.5 + i) * 5 * unit;
      g.fillStyle([0x58a8b8, 0xe4b853, 0x6b98cb][i], 1);
      g.fillEllipse(fx, fy, 20 * unit, 10 * unit);
      g.fillTriangle(fx - 8 * unit, fy, fx - 17 * unit, fy - 7 * unit, fx - 17 * unit, fy + 7 * unit);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(fx + 5 * unit, fy - 1 * unit, 1.5 * unit);
    }
  }

  drawTree(g, x, y, size, unit) {
    const [cx, cy] = this.point(x, y);
    g.fillStyle(0x486d47, 0.24);
    g.fillEllipse(cx + 6 * unit, cy + 28 * unit, 68 * unit * size, 26 * unit * size);
    g.fillStyle(0x896145, 1);
    g.fillRoundedRect(cx - 7 * unit * size, cy + 2 * unit, 14 * unit * size, 39 * unit * size, 4 * unit);
    g.fillStyle(0x3d8052, 1);
    g.fillCircle(cx, cy - 7 * unit * size, 30 * unit * size);
    g.fillStyle(0x4f995d, 1);
    g.fillCircle(cx - 14 * unit * size, cy - 15 * unit * size, 22 * unit * size);
    g.fillCircle(cx + 14 * unit * size, cy - 16 * unit * size, 21 * unit * size);
    g.fillStyle(0x76b86a, 1);
    g.fillCircle(cx - 7 * unit * size, cy - 25 * unit * size, 15 * unit * size);
  }

  drawPalm(g, x, y, unit) {
    const [cx, cy] = this.point(x, y);
    g.lineStyle(12 * unit, 0x906844, 1);
    g.lineBetween(cx, cy + 33 * unit, cx + 3 * unit, cy - 24 * unit);
    for (let i = 0; i < 7; i += 1) {
      const angle = Math.PI * 2 * i / 7;
      g.lineStyle(6 * unit, i % 2 ? 0x4a9059 : 0x69ab5e, 1);
      g.lineBetween(cx + 3 * unit, cy - 25 * unit, cx + Math.cos(angle) * 34 * unit, cy - 25 * unit + Math.sin(angle) * 22 * unit);
    }
    g.fillStyle(0xe4a642, 1);
    g.fillCircle(cx + 3 * unit, cy - 25 * unit, 6 * unit);
  }

  drawFlowers(g, dot, unit) {
    for (const [x, y, color] of [[220, 309, 0xf1d578], [214, 329, 0xe88c91], [615, 351, 0xf1d675], [644, 358, 0xf29a84], [382, 556, 0xf4e38d], [656, 543, 0xe99a9a]]) {
      dot(g, x, y, 3 * unit, 0x508b50);
      dot(g, x - 4, y - 3, 3.5 * unit, color);
      dot(g, x + 4, y - 3, 3.5 * unit, color);
      dot(g, x, y - 7, 3.5 * unit, color);
      dot(g, x, y - 3, 2.2 * unit, 0xf2cf67);
    }
    for (const [x, y] of [[205, 466], [618, 548], [815, 326], [174, 367], [753, 556]]) {
      const [rx, ry] = this.point(x, y);
      g.fillStyle(0x8c9a8e, 1);
      g.fillEllipse(rx, ry, 18 * unit, 11 * unit);
      g.fillStyle(0xc4c9ae, 0.8);
      g.fillEllipse(rx - 3 * unit, ry - 2 * unit, 8 * unit, 4 * unit);
    }
  }

  paintFields(fields, unit) {
    this.fieldsGraphic.clear();
    this.fieldPositions.forEach(([x, y], index) => {
      const [cx, cy] = this.point(x, y);
      const field = fields[index];
      const planted = field.plantedAt !== null;
      const stage = cropStage(index);
      const plotW = 70 * unit;
      const plotH = 46 * unit;
      const g = this.fieldsGraphic;
      g.fillStyle(0x536f48, 0.23);
      g.fillEllipse(cx + 2 * unit, cy + 21 * unit, plotW * 1.18, plotH * 0.39);
      const corners = (inset = 0, offsetY = 0) => [
        new Phaser.Geom.Point(cx - plotW / 2 + inset * unit, cy - plotH / 2 + offsetY * unit),
        new Phaser.Geom.Point(cx + plotW / 2 - 3 * unit - inset * unit, cy - plotH / 2 - 2 * unit + offsetY * unit),
        new Phaser.Geom.Point(cx + plotW / 2 + inset * unit, cy + plotH / 2 - offsetY * unit),
        new Phaser.Geom.Point(cx - plotW / 2 + 3 * unit + inset * unit, cy + plotH / 2 + 2 * unit - offsetY * unit),
      ];
      g.fillStyle(0x536f48, 0.3);
      g.fillPoints(corners(0, 4), true);
      g.fillStyle(field.unlocked ? 0x56784d : 0x7c755e, 1);
      g.fillPoints(corners(), true);
      g.fillStyle(field.unlocked ? 0x876044 : 0xa89a83, 1);
      g.fillPoints(corners(4), true);
      g.fillStyle(field.unlocked ? 0xa8754b : 0xb4a78f, 1);
      g.fillPoints(corners(6, 2), true);
      g.lineStyle(1.5 * unit, state.selectedField === index ? 0xffee9b : 0xd6c18f, 0.95);
      g.strokePoints(corners(), true);
      for (let row = 0; row < 3; row += 1) {
        const rowY = cy - 12 * unit + row * 12 * unit;
        const rowX = cx - 29 * unit + row * 2 * unit;
        g.lineStyle(3 * unit, 0x704830, 0.82);
        g.lineBetween(rowX, rowY, cx + 28 * unit - row * 2 * unit, rowY - 2 * unit);
        g.lineStyle(1.1 * unit, 0xc38d58, 0.92);
        g.lineBetween(rowX, rowY + 2 * unit, cx + 28 * unit - row * 2 * unit, rowY);
      }
      if (!field.unlocked) {
        g.fillStyle(0x78664e, 0.75);
        g.fillRoundedRect(cx - 8 * unit, cy - 8 * unit, 16 * unit, 16 * unit, 3 * unit);
        g.lineStyle(2.4 * unit, 0xffedcb, 1);
        g.strokeCircle(cx, cy - 7 * unit, 5 * unit);
        g.lineBetween(cx - 5 * unit, cy - 4 * unit, cx + 5 * unit, cy - 4 * unit);
      } else if (planted) {
        const count = stage === 1 ? 3 : stage === 2 ? 6 : 9;
        for (let plant = 0; plant < count; plant += 1) {
          const px = cx - 19 * unit + plant % 3 * 19 * unit;
          const py = cy - 11 * unit + Math.floor(plant / 3) * 12 * unit;
          const stem = (stage === 1 ? 7 : stage === 2 ? 10 : 14) * unit;
          g.lineStyle(2 * unit, 0x397b47, 1);
          g.lineBetween(px, py + 5 * unit, px, py + stem);
          g.fillStyle(stage === 1 ? 0x88c965 : 0x529c50, 1);
          g.fillEllipse(px - 3 * unit, py + 2 * unit, 9 * unit, 5 * unit);
          g.fillEllipse(px + 3 * unit, py - 1 * unit, 9 * unit, 5 * unit);
          if (stage >= 2) {
            const mature = stage === 3;
            const fruit = crops[index].color;
            if (index === 0) {
              g.lineStyle(1.5 * unit, 0x78a64c, 1);
              g.lineBetween(px, py + 2 * unit, px - 5 * unit, py - 5 * unit);
              g.lineBetween(px, py + 4 * unit, px + 5 * unit, py - 3 * unit);
              if (mature) {
                g.fillStyle(0xe7bd4e, 1);
                for (let grain = 0; grain < 4; grain += 1) g.fillEllipse(px + (grain % 2 ? 2 : -2) * unit, py - (7 + grain * 2) * unit, 3 * unit, 4 * unit);
              }
            } else if (index === 1) {
              g.fillStyle(0x398448, 1);
              g.fillTriangle(px, py - 3 * unit, px - 8 * unit, py - 11 * unit, px - 2 * unit, py + 1 * unit);
              g.fillTriangle(px, py - 3 * unit, px + 8 * unit, py - 12 * unit, px + 2 * unit, py + 1 * unit);
              if (mature) {
                g.fillStyle(fruit, 1);
                g.fillTriangle(px - 3 * unit, py + 1 * unit, px + 3 * unit, py + 1 * unit, px, py + 10 * unit);
                g.fillStyle(0xffcb72, 0.7);
                g.fillRect(px - unit, py + 3 * unit, 2 * unit, 2 * unit);
              }
            } else if (index === 2) {
              if (mature) {
                g.fillStyle(0xb9965c, 1);
                g.fillEllipse(px - 4 * unit, py + 4 * unit, 8 * unit, 5 * unit);
                g.fillEllipse(px + 5 * unit, py + 3 * unit, 7 * unit, 5 * unit);
                g.fillStyle(0xe1c185, 0.85);
                g.fillCircle(px - 5 * unit, py + 3 * unit, 1.4 * unit);
              }
            } else if (index === 3) {
              g.fillStyle(0x78a64e, 1);
              g.fillTriangle(px, py + 3 * unit, px - 9 * unit, py - 6 * unit, px - unit, py - 2 * unit);
              g.fillTriangle(px, py + 5 * unit, px + 9 * unit, py - 7 * unit, px + unit, py - unit);
              if (mature) {
                g.fillStyle(0x518e42, 1);
                g.fillRoundedRect(px - 3 * unit, py - 8 * unit, 7 * unit, 15 * unit, 3 * unit);
                g.fillStyle(0xf5d05b, 1);
                for (let kernel = 0; kernel < 4; kernel += 1) g.fillRect(px - 2 * unit + (kernel % 2) * 3 * unit, py - 5 * unit + Math.floor(kernel / 2) * 4 * unit, 2 * unit, 2 * unit);
              }
            } else if (index === 4) {
              if (mature) {
                g.fillStyle(0xe6a936, 1);
                for (let petal = 0; petal < 8; petal += 1) {
                  const angle = petal * Math.PI / 4;
                  g.fillCircle(px + Math.cos(angle) * 5 * unit, py - 5 * unit + Math.sin(angle) * 5 * unit, 2.4 * unit);
                }
                g.fillStyle(0x754a36, 1);
                g.fillCircle(px, py - 5 * unit, 3.2 * unit);
              }
            } else if (index === 5) {
              g.lineStyle(1.5 * unit, 0x3f8247, 1);
              g.lineBetween(px - 8 * unit, py + 4 * unit, px + 8 * unit, py - 4 * unit);
              if (mature) {
                g.fillStyle(fruit, 1);
                g.fillEllipse(px + 2 * unit, py + 4 * unit, 11 * unit, 8 * unit);
                g.lineStyle(1 * unit, 0xf4bd6c, 0.9);
                g.lineBetween(px - 2 * unit, py + 1 * unit, px + 4 * unit, py + 7 * unit);
              }
            } else if (index === 6) {
              if (mature) {
                g.fillStyle(fruit, 1);
                g.fillCircle(px - 3 * unit, py + 4 * unit, 3.5 * unit);
                g.fillCircle(px + 4 * unit, py + 2 * unit, 3.2 * unit);
                g.fillStyle(0xf6dbb0, 1);
                g.fillCircle(px - 4 * unit, py + 3 * unit, 0.9 * unit);
              }
            } else if (index === 7) {
              if (mature) {
                g.fillStyle(fruit, 1);
                g.fillEllipse(px, py + 4 * unit, 12 * unit, 7 * unit);
                g.lineStyle(1 * unit, 0x326d45, 1);
                g.lineBetween(px - 4 * unit, py + unit, px - 2 * unit, py + 7 * unit);
                g.lineBetween(px + 2 * unit, py + unit, px + 4 * unit, py + 7 * unit);
              }
            } else if (mature) {
              g.fillStyle(0x499052, 1);
              g.fillCircle(px, py + 2 * unit, 5 * unit);
              g.fillStyle(fruit, 1);
              for (let petal = 0; petal < 5; petal += 1) {
                const angle = petal * Math.PI * 2 / 5;
                g.fillCircle(px + Math.cos(angle) * 4 * unit, py - 6 * unit + Math.sin(angle) * 4 * unit, 2.7 * unit);
              }
              g.fillStyle(0xf4d36c, 1);
              g.fillCircle(px, py - 6 * unit, 2 * unit);
            }
          }
        }
      }
      const markerX = cx - 29 * unit;
      const markerY = cy - 19 * unit;
      g.fillStyle(0x5b4836, 0.24);
      g.fillEllipse(markerX + unit, markerY + 2 * unit, 13 * unit, 7 * unit);
      g.fillStyle(field.unlocked ? 0xf4e5c5 : 0xe7dfd1, 1);
      g.fillCircle(markerX, markerY, 5 * unit);
      g.fillStyle(state.selectedField === index ? 0x45794e : 0x795b42, 1);
      g.fillCircle(markerX, markerY, 2.5 * unit);
    });
  }

  drawChicken(g, x, y, unit, size = 1) {
    const [cx, cy] = this.point(x, y);
    const stride = Math.sin(this.time.now / 95 + x);
    const bob = Math.abs(Math.sin(this.time.now / 110 + x)) * 0.5 * unit;
    g.fillStyle(0x526b46, 0.3);
    g.fillEllipse(cx, cy + 12 * unit, 32 * unit * size, 8 * unit * size);
    g.lineStyle(1.8 * unit, 0xb3813e, 1);
    g.lineBetween(cx - 5 * unit * size, cy + 6 * unit + bob, cx - (5 + stride * 2) * unit * size, cy + (13 + Math.max(0, stride) * 2) * unit * size);
    g.lineBetween(cx + 5 * unit * size, cy + 6 * unit + bob, cx + (5 - stride * 2) * unit * size, cy + (13 + Math.max(0, -stride) * 2) * unit * size);
    g.lineStyle(1.4 * unit, 0xb3813e, 1);
    g.lineBetween(cx - (5 + stride * 2) * unit * size, cy + (13 + Math.max(0, stride) * 2) * unit * size, cx - (8 + stride * 2) * unit * size, cy + (13 + Math.max(0, stride) * 2) * unit * size);
    g.lineBetween(cx + (5 - stride * 2) * unit * size, cy + (13 + Math.max(0, -stride) * 2) * unit * size, cx + (8 - stride * 2) * unit * size, cy + (13 + Math.max(0, -stride) * 2) * unit * size);
    g.fillStyle(0xffefd0, 1);
    g.fillEllipse(cx, cy + bob, 26 * unit * size, 20 * unit * size);
    g.fillEllipse(cx - 11 * unit * size, cy - 3 * unit * size + bob, 7 * unit * size, 5 * unit * size);
    g.fillCircle(cx + 9 * unit * size, cy - 8 * unit * size + bob, 8 * unit * size);
    g.fillStyle(0xf8f0d5, 1);
    g.fillEllipse(cx - 2 * unit * size, cy + 2 * unit * size + bob, 13 * unit * size, 10 * unit * size);
    g.fillStyle(0xd8705c, 1);
    g.fillCircle(cx + 7 * unit * size, cy - 17 * unit * size + bob, 3 * unit * size);
    g.fillCircle(cx + 12 * unit * size, cy - 17 * unit * size + bob, 3 * unit * size);
    g.fillTriangle(cx + 14 * unit * size, cy - 7 * unit * size + bob, cx + 24 * unit * size, cy - 3 * unit * size + bob, cx + 14 * unit * size, cy - 1 * unit * size + bob);
    g.fillStyle(0x3f5041, 1);
    g.fillCircle(cx + 11 * unit * size, cy - 10 * unit * size + bob, 1.5 * unit * size);
  }

  drawBee(g, x, y, unit, size = 1) {
    const [cx, cy] = this.point(x, y);
    const wingBeat = Math.sin(this.time.now / 45 + x);
    g.fillStyle(0xffffff, 0.9);
    g.fillEllipse(cx - 5 * unit * size, cy - (6 + wingBeat) * unit * size, 10 * unit * size, (6 + Math.abs(wingBeat) * 4) * unit * size);
    g.fillEllipse(cx + 5 * unit * size, cy - (6 - wingBeat) * unit * size, 10 * unit * size, (6 + Math.abs(wingBeat) * 4) * unit * size);
    g.fillStyle(0xf0c243, 1);
    g.fillEllipse(cx, cy, 17 * unit * size, 12 * unit * size);
    g.fillStyle(0x494a38, 1);
    g.fillRect(cx - 2 * unit * size, cy - 5 * unit * size, 3 * unit * size, 10 * unit * size);
    g.fillRect(cx + 3 * unit * size, cy - 5 * unit * size, 2 * unit * size, 10 * unit * size);
    g.lineStyle(1 * unit * size, 0x494a38, 1);
    g.lineBetween(cx - 2 * unit * size, cy - 5 * unit * size, cx - 5 * unit * size, cy - 9 * unit * size);
    g.lineBetween(cx + 4 * unit * size, cy - 5 * unit * size, cx + 7 * unit * size, cy - 9 * unit * size);
    g.fillCircle(cx + 8 * unit * size, cy - unit * size, 1.3 * unit * size);
  }
}

class IslandArtworkScene extends IslandScene {
  create() {
    this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)');
  }

  paintIsland() {}
}

function startGame() {
  game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent: 'island-game',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    transparent: true,
    pixelArt: false,
    antialias: true,
    scale: { mode: Phaser.Scale.RESIZE, width: 800, height: 440, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: IslandArtworkScene,
    render: { pixelArt: false, antialias: true, roundPixels: false },
  });
  game.events.once('ready', () => {
    scene = game.scene.getScene('island');
    render();
  });
}

render();

let lastTick = 0;
function refresh() {
  const now = Date.now();
  updateOfflineState(now);
  if (activeTab === 'fishing' && state.fishing.busyUntil && now > state.fishing.catchDeadline) {
    // Leave the expired catch visible until the player acknowledges it.
  }
  render();
  lastTick = now;
}
setInterval(() => {
  if (Date.now() - lastTick > 850) refresh();
}, 1000);

window.addEventListener('beforeunload', save);
window.addEventListener('visibilitychange', () => {
  audioEngine.setActive(document.visibilityState === 'visible');
  if (document.visibilityState === 'visible') {
    const returned = Date.now() - lastTick > 60_000;
    refresh();
    if (returned && state.seenWelcome) notify(tr('returned'));
  }
});
