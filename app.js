
"use strict";

const STORAGE_KEY = "growora-demo-v1";

const CROPS = [
  { id: "wheat", emoji: "🌾", seed: 1, hours: 1, yield: 100.4167, price: 0.01 },
  { id: "carrot", emoji: "🥕", seed: 2, hours: 2, yield: 100.8333, price: 0.02 },
  { id: "potato", emoji: "🥔", seed: 4, hours: 4, yield: 101.6667, price: 0.04 },
  { id: "corn", emoji: "🌽", seed: 7, hours: 6, yield: 102.5, price: 0.07 },
  { id: "sunflower", emoji: "🌻", seed: 12, hours: 9, yield: 103.75, price: 0.12 },
  { id: "pumpkin", emoji: "🎃", seed: 20, hours: 12, yield: 105, price: 0.20 },
  { id: "strawberry", emoji: "🍓", seed: 35, hours: 18, yield: 107.5, price: 0.35 },
  { id: "watermelon", emoji: "🍉", seed: 60, hours: 27, yield: 111.25, price: 0.60 },
  { id: "rose", emoji: "🌹", seed: 100, hours: 36, yield: 115, price: 1.00 }
];

const FIELD_COSTS = [0, 0.5, 1, 2, 4, 7, 12, 20, 35];

const TEXT = {
  en: {
    tagline: "Grow. Upgrade. Build Your Fortune.",
    language: "Language",
    playBalance: "Play balance",
    eyebrow: "YOUR WORLD STARTS HERE",
    heroTitle: "Plant today.<br><em>Build tomorrow.</em>",
    heroText: "Build your farm, grow crops, catch fish, raise chickens and collect honey in a living pixel-inspired world.",
    enterFarm: "Enter your farm",
    prototype: "Playable prototype",
    yourFarm: "YOUR FARM",
    farmTitle: "A little land. A big dream.",
    farmText: "Choose a crop, plant a seed and return when it is ready to harvest.",
    availableFields: "Available fields",
    salesBalance: "Sales balance",
    saveNotice: "Demo progress is saved in this browser on this device. Clearing browser data may erase it.",
    marketEyebrow: "YOUR HARVEST",
    marketTitle: "Farm market",
    marketText: "Sell harvested produce at the fixed prices shown below.",
    crop: "Crop",
    inventory: "Inventory",
    unitPrice: "Unit price",
    action: "Action",
    moreToExplore: "MORE TO EXPLORE",
    systemsTitle: "Your farm is just the beginning",
    fishing: "Fishing",
    fishingText: "Cast your rod and discover different fish.",
    beehive: "Beehive",
    beehiveText: "Manage honey production and collect it in time.",
    chickenCoop: "Chicken coop",
    chickenText: "Raise chickens and gather eggs.",
    comingSoon: "Coming soon",
    walletEyebrow: "YOUR ACCOUNT",
    walletTitle: "Wallet & payments",
    walletText: "Payment and withdrawal actions require secure server-side verification before launch.",
    deposit: "Deposit USDT",
    withdraw: "Withdraw",
    demoNotice: "Demo only: no real deposits, transfers or withdrawals are processed here.",
    footer: "Your farm. Your journey.",
    field: "Field",
    locked: "Locked",
    unlock: "Unlock",
    plant: "Plant seed",
    growing: "Growing",
    ready: "Ready to harvest!",
    harvest: "Harvest",
    empty: "Choose a seed to plant.",
    seedCost: "Seed",
    growth: "Growth",
    harvestAmount: "Harvest",
    buySeed: "You need more play balance to buy this seed.",
    unlocked: "Field unlocked!",
    planted: "Seed planted!",
    harvested: "Harvest collected!",
    sold: "Produce sold!",
    nothingToSell: "You have no produce to sell.",
    needHarvest: "Wait until the crop is ready.",
    needUnlock: "Unlock this field first.",
    noFieldMoney: "Not enough play balance to unlock this field.",
    depositInfo: "Deposits are not connected in this demo. A secure payment system must be installed before real money can be added.",
    withdrawInfo: "Withdrawals are not enabled in this demo. Real withdrawals require a verified sales balance and secure server approval.",
    fieldLabel: "Field",
    price: "Price",
    none: "None",
    cropNames: ["Wheat", "Carrot", "Potato", "Corn", "Sunflower", "Pumpkin", "Strawberry", "Watermelon", "Rare rose"],
    cropDescriptions: ["A dependable first crop.", "A bright root crop.", "A hearty harvest.", "A sunny field favourite.", "Follow the sun.", "A seasonal classic.", "Sweet and colourful.", "A refreshing summer crop.", "A rare and valuable flower."],
    hoursShort: "h",
    minutesShort: "m",
    secondsShort: "s",
    sell: "Sell all",
    emptyInventory: "None",
    demoStart: "This is a local demo. Its balances and saved progress are not real money and cannot be withdrawn."
  },
  fr: {
    tagline: "Cultivez. Améliorez. Bâtissez votre fortune.",
    language: "Langue",
    playBalance: "Solde de jeu",
    eyebrow: "VOTRE MONDE COMMENCE ICI",
    heroTitle: "Plantez aujourd'hui.<br><em>Construisez demain.</em>",
    heroText: "Développez votre ferme, cultivez, pêchez, élevez des poules et récoltez du miel dans un monde vivant au style pixel.",
    enterFarm: "Entrer dans la ferme",
    prototype: "Prototype jouable",
    yourFarm: "VOTRE FERME",
    farmTitle: "Un petit terrain. Un grand rêve.",
    farmText: "Choisissez une culture, plantez une graine et revenez pour la récolter.",
    availableFields: "Champs disponibles",
    salesBalance: "Solde des ventes",
    saveNotice: "La progression de démonstration est enregistrée dans ce navigateur. Effacer les données peut la supprimer.",
    marketEyebrow: "VOTRE RÉCOLTE",
    marketTitle: "Marché agricole",
    marketText: "Vendez vos récoltes aux prix fixes indiqués ci-dessous.",
    crop: "Culture",
    inventory: "Stock",
    unitPrice: "Prix unitaire",
    action: "Action",
    moreToExplore: "À DÉCOUVRIR",
    systemsTitle: "Votre ferme n'est que le début",
    fishing: "Pêche",
    fishingText: "Lancez votre ligne et découvrez différentes espèces.",
    beehive: "Ruche",
    beehiveText: "Gérez la production de miel et récoltez à temps.",
    chickenCoop: "Poulailler",
    chickenText: "Élevez des poules et ramassez les œufs.",
    comingSoon: "Bientôt disponible",
    walletEyebrow: "VOTRE COMPTE",
    walletTitle: "Portefeuille et paiements",
    walletText: "Les paiements et retraits nécessitent une vérification sécurisée côté serveur avant le lancement.",
    deposit: "Déposer des USDT",
    withdraw: "Retirer",
    demoNotice: "Démo uniquement : aucun dépôt, transfert ou retrait réel n'est effectué.",
    footer: "Votre ferme. Votre aventure.",
    field: "Champ",
    locked: "Verrouillé",
    unlock: "Déverrouiller",
    plant: "Planter",
    growing: "En croissance",
    ready: "Prêt à récolter !",
    harvest: "Récolter",
    empty: "Choisissez une graine à planter.",
    seedCost: "Graine",
    growth: "Croissance",
    harvestAmount: "Récolte",
    buySeed: "Votre solde de jeu est insuffisant pour acheter cette graine.",
    unlocked: "Champ déverrouillé !",
    planted: "Graine plantée !",
    harvested: "Récolte récupérée !",
    sold: "Récolte vendue !",
    nothingToSell: "Vous n'avez rien à vendre.",
    needHarvest: "Attendez que la culture soit prête.",
    needUnlock: "Déverrouillez d'abord ce champ.",
    noFieldMoney: "Solde insuffisant pour déverrouiller ce champ.",
    depositInfo: "Les dépôts ne sont pas connectés à cette démo. Un système de paiement sécurisé doit être installé avant tout dépôt réel.",
    withdrawInfo: "Les retraits ne sont pas activés dans cette démo. Ils nécessitent un solde de ventes vérifié et une validation sécurisée.",
    fieldLabel: "Champ",
    price: "Prix",
    none: "Aucun",
    cropNames: ["Blé", "Carotte", "Pomme de terre", "Maïs", "Tournesol", "Citrouille", "Fraise", "Pastèque", "Rose rare"],
    cropDescriptions: ["Une première culture fiable.", "Une racine colorée.", "Une récolte généreuse.", "Un classique ensoleillé.", "Suivez le soleil.", "Un classique de saison.", "Sucrée et colorée.", "Un fruit rafraîchissant.", "Une fleur rare et précieuse."],
    hoursShort: "h",
    minutesShort: "min",
    secondsShort: "s",
    sell: "Tout vendre",
    emptyInventory: "Aucun",
    demoStart: "Ceci est une démo locale. Les soldes et la progression ne représentent pas de l'argent réel et ne peuvent pas être retirés."
  }
};

let state = loadState();
let currentLang = localStorage.getItem("growora-language") || "en";
let toastTimer;

function defaultState() {
  return {
    // Demo-only balance to let you test planting without real payments.
    playBalance: 10,
    salesBalance: 0,
    unlockedFields: 1,
    plots: Array.from({ length: 9 }, () => ({ cropId: null, plantedAt: null, readyAt: null })),
    inventory: Object.fromEntries(CROPS.map(crop => [crop.id, 0]))
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.plots) || !saved.inventory) return defaultState();
    const base = defaultState();
    return {
      ...base,
      ...saved,
      plots: base.plots.map((plot, i) => ({ ...plot, ...(saved.plots[i] || {}) })),
      inventory: { ...base.inventory, ...saved.inventory }
    };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function t(key) {
  return TEXT[currentLang][key] ?? TEXT.en[key] ?? key;
}

function money(value) {
  return "$" + Number(value || 0).toFixed(2);
}

function quantity(value) {
  return Number(value || 0).toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

function cropName(crop) {
  return TEXT[currentLang].cropNames[CROPS.findIndex(item => item.id === crop.id)];
}

function formatDuration(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours) return `${hours}${t("hoursShort")} ${minutes}${t("minutesShort")}`;
  if (minutes) return `${minutes}${t("minutesShort")} ${secs}${t("secondsShort")}`;
  return `${secs}${t("secondsShort")}`;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function translatePage() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = "ltr";
  document.title = currentLang === "fr"
    ? "Growora — Votre ferme vivante"
    : "Growora — Your Living Farm";

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;
    if (TEXT[currentLang][key] !== undefined) {
      element.innerHTML = TEXT[currentLang][key];
    }
  });

  document.getElementById("languageSelect").value = currentLang;
  renderAll();
}

function renderAll() {
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("playBalance").textContent = money(state.playBalance);
  document.getElementById("salesBalance").textContent = money(state.salesBalance);
  document.getElementById("fieldCount").textContent = `${state.unlockedFields} / 9`;
  renderFields();
  renderMarket();
}

function renderFields() {
  const grid = document.getElementById("fieldGrid");
  grid.innerHTML = "";

  state.plots.forEach((plot, index) => {
    const fieldNumber = index + 1;
    const unlocked = fieldNumber <= state.unlockedFields;
    const crop = CROPS[index];
    const card = document.createElement("article");
    card.className = `plot${unlocked ? "" : " locked"}`;

    if (!unlocked) {
      card.innerHTML = `
        <div class="plot-top"><h3>${t("field")} ${fieldNumber}</h3><span class="small-tag">${t("locked")}</span></div>
        <div class="plot-art">🔒</div>
        <p>${cropName(crop)} · ${money(FIELD_COSTS[index])}</p>
        <p>${t("seedCost")}: ${money(crop.seed)} · ${crop.hours}${t("hoursShort")}</p>
        <button class="secondary" data-unlock="${index}">${t("unlock")} · ${money(FIELD_COSTS[index])}</button>`;
      grid.appendChild(card);
      return;
    }

    const cropOptions = CROPS.slice(0, state.unlockedFields).map(item => `
      <option value="${item.id}" ${plot.cropId === item.id ? "selected" : ""}>
        ${item.emoji} ${cropName(item)} — ${money(item.seed)}
      </option>`).join("");

    let action = "";
    let description = t("empty");
    let art = "🟫";

    if (plot.cropId) {
      const plantedCrop = CROPS.find(item => item.id === plot.cropId);
      const remaining = plot.readyAt - Date.now();
      art = remaining <= 0 ? plantedCrop.emoji : "🌱";

      if (remaining <= 0) {
        description = `${t("ready")} ${quantity(plantedCrop.yield)} ${cropName(plantedCrop)}`;
        action = `<button data-harvest="${index}">${t("harvest")}</button>`;
      } else {
        description = `${t("growing")}: ${formatDuration(remaining)}`;
        action = `<button disabled>${formatDuration(remaining)}</button>`;
      }
    } else {
      action = `
        <select aria-label="${t("plant")} ${t("field")} ${fieldNumber}" id="cropSelect${index}">
          ${cropOptions}
        </select>
        <button data-plant="${index}">${t("plant")}</button>`;
    }

    card.innerHTML = `
      <div class="plot-top"><h3>${t("field")} ${fieldNumber} · ${cropName(crop)}</h3><span class="small-tag">${money(crop.seed)}</span></div>
      <div class="plot-art">${art}</div>
      <p>${description}</p>
      <p>${t("growth")}: ${crop.hours}${t("hoursShort")} · ${t("harvestAmount")}: ${quantity(crop.yield)}</p>
      ${plot.cropId ? action : action}`;
    grid.appendChild(card);
  });
}

function renderMarket() {
  const tbody = document.getElementById("marketRows");
  tbody.innerHTML = "";

  CROPS.forEach(crop => {
    const amount = Number(state.inventory[crop.id] || 0);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${crop.emoji} ${cropName(crop)}</td>
      <td>${quantity(amount)}</td>
      <td>${money(crop.price)}</td>
      <td><button class="secondary" data-sell="${crop.id}" ${amount <= 0 ? "disabled" : ""}>${t("sell")}</button></td>`;
    tbody.appendChild(row);
  });
}

function plantField(index) {
  const plot = state.plots[index];
  if (index >= state.unlockedFields || plot.cropId) return;

  const selector = document.getElementById(`cropSelect${index}`);
  const crop = CROPS.find(item => item.id === selector.value);
  if (!crop) return;

  if (state.playBalance < crop.seed) {
    showToast(t("buySeed"));
    return;
  }

  state.playBalance = Number((state.playBalance - crop.seed).toFixed(4));
  plot.cropId = crop.id;
  plot.plantedAt = Date.now();
  plot.readyAt = Date.now() + crop.hours * 60 * 60 * 1000;
  saveState();
  renderAll();
  showToast(t("planted"));
}

function harvestField(index) {
  const plot = state.plots[index];
  if (!plot || !plot.cropId) return;

  if (Date.now() < plot.readyAt) {
    showToast(t("needHarvest"));
    return;
  }

  const crop = CROPS.find(item => item.id === plot.cropId);
  state.inventory[crop.id] = Number((state.inventory[crop.id] + crop.yield).toFixed(4));
  state.plots[index] = { cropId: null, plantedAt: null, readyAt: null };
  saveState();
  renderAll();
  showToast(t("harvested"));
}

function unlockField(index) {
  const fieldNumber = index + 1;
  if (fieldNumber !== state.unlockedFields + 1 || fieldNumber > 9) return;

  const cost = FIELD_COSTS[index];
  if (state.playBalance < cost) {
    showToast(t("noFieldMoney"));
    return;
  }

  state.playBalance = Number((state.playBalance - cost).toFixed(4));
  state.unlockedFields = fieldNumber;
  saveState();
  renderAll();
  showToast(t("unlocked"));
}

function sellCrop(cropId) {
  const crop = CROPS.find(item => item.id === cropId);
  const amount = Number(state.inventory[cropId] || 0);

  if (!crop || amount <= 0) {
    showToast(t("nothingToSell"));
    return;
  }

  const revenue = amount * crop.price;
  state.salesBalance = Number((state.salesBalance + revenue).toFixed(4));
  state.inventory[cropId] = 0;
  saveState();
  renderAll();
  showToast(`${t("sold")} +${money(revenue)}`);
}

document.getElementById("languageSelect").addEventListener("change", event => {
  currentLang = event.target.value === "fr" ? "fr" : "en";
  localStorage.setItem("growora-language", currentLang);
  translatePage();
});

document.getElementById("fieldGrid").addEventListener("click", event => {
  const plant = event.target.closest("[data-plant]");
  const harvest = event.target.closest("[data-harvest]");
  const unlock = event.target.closest("[data-unlock]");

  if (plant) plantField(Number(plant.dataset.plant));
  if (harvest) harvestField(Number(harvest.dataset.harvest));
  if (unlock) unlockField(Number(unlock.dataset.unlock));
});

document.getElementById("marketRows").addEventListener("click", event => {
  const button = event.target.closest("[data-sell]");
  if (button && !button.disabled) sellCrop(button.dataset.sell);
});

document.getElementById("startBtn").addEventListener("click", () => {
  document.getElementById("farm").scrollIntoView({ behavior: "smooth" });
  showToast(t("demoStart"));
});

document.getElementById("depositBtn").addEventListener("click", () => {
  showToast(t("depositInfo"));
});

document.getElementById("withdrawBtn").addEventListener("click", () => {
  showToast(t("withdrawInfo"));
});

// Refresh countdowns without changing stored game rules.
translatePage();
setInterval(() => {
  if (state.plots.some(plot => plot.cropId)) renderFields();
}, 1000);
