
"use strict";

const STORAGE_KEY = "growora-demo-v2";
const LANGUAGE_KEY = "growora-language";

const CROPS = [
  { id:"wheat", emoji:"🌾", seed:1, hours:1, yield:100.4167, price:0.01, en:"Wheat", fr:"Blé" },
  { id:"carrot", emoji:"🥕", seed:2, hours:2, yield:100.8333, price:0.02, en:"Carrot", fr:"Carotte" },
  { id:"potato", emoji:"🥔", seed:4, hours:4, yield:101.6667, price:0.04, en:"Potato", fr:"Pomme de terre" },
  { id:"corn", emoji:"🌽", seed:7, hours:6, yield:102.5, price:0.07, en:"Corn", fr:"Maïs" },
  { id:"sunflower", emoji:"🌻", seed:12, hours:9, yield:103.75, price:0.12, en:"Sunflower", fr:"Tournesol" },
  { id:"pumpkin", emoji:"🎃", seed:20, hours:12, yield:105, price:0.20, en:"Pumpkin", fr:"Citrouille" },
  { id:"strawberry", emoji:"🍓", seed:35, hours:18, yield:107.5, price:0.35, en:"Strawberry", fr:"Fraise" },
  { id:"watermelon", emoji:"🍉", seed:60, hours:27, yield:111.25, price:0.60, en:"Watermelon", fr:"Pastèque" },
  { id:"rose", emoji:"🌹", seed:100, hours:36, yield:115, price:1.00, en:"Rare rose", fr:"Rose rare" }
];

const FIELD_COSTS = [0,0.5,1,2,4,7,12,20,35];

const TEXT = {
  en: {
    playBalance:"Play balance", salesBalance:"Sales balance",
    welcome:"YOUR WORLD, YOUR PACE",
    heroTitle:'A little land.<br><em>A lot of possibilities.</em>',
    heroText:"Plant your first seeds, care for your fields, and grow your farm one harvest at a time.",
    enterFarm:"Enter your farm",
    demoNote:"Demo mode · balances are not real money",
    yourLand:"YOUR LITTLE WORLD",
    farmTitle:"The farm",
    farmSubtitle:"Choose a plot, plant its crop, then come back when it is ready.",
    fieldsUnlocked:"Fields open",
    livingFarm:"YOUR LIVING FARM",
    tapPlot:"Tap a field to interact",
    readyLegend:"Ready to harvest",
    growingLegend:"Growing",
    lockedLegend:"Locked field",
    saveNotice:"Your demo progress is saved on this device. It is not connected to real payments.",
    harvestMarket:"HARVEST & TRADE",
    marketTitle:"Farm market",
    marketSubtitle:"Sell what you harvest and add the proceeds to your sales balance.",
    crop:"Crop",
    inStorage:"In storage",
    unitPrice:"Unit price",
    action:"Action",
    sell:"Sell",
    noHarvest:"Nothing to sell",
    moreToExplore:"MORE TO EXPLORE",
    beyondFields:"Beyond the fields",
    systemsSubtitle:"New corners of your world will become playable in future updates.",
    comingSoon:"COMING SOON",
    fishing:"Fishing pond",
    fishingDesc:"Cast a line, wait for a bite, and collect your catch.",
    beehive:"Bee garden",
    beeDesc:"Keep your hive buzzing and gather sweet honey.",
    chickenCoop:"Chicken coop",
    chickenDesc:"Care for your chickens and collect fresh eggs.",
    wallet:"WALLET",
    walletTitle:"Your balances, at a glance",
    walletText:"This version is a local demo. Deposits and withdrawals are not active yet.",
    spendSeeds:"Used for seeds and field upgrades",
    withdrawWallet:"Future withdrawal eligibility balance",
    deposit:"Deposit",
    withdraw:"Withdraw",
    footerText:"A growing world, one little step at a time.",
    field:"Field",
    locked:"Locked",
    unlock:"Unlock",
    plant:"Plant",
    harvest:"Harvest",
    growing:"Growing",
    empty:"Ready to plant",
    ready:"Ready to harvest",
    hours:"h",
    minutes:"m",
    seconds:"s",
    needMoney:"Not enough play balance for this seed.",
    planted:"{crop} planted in Field {field}.",
    harvested:"Harvested {amount} {crop}.",
    unlocked:"Field {field} unlocked!",
    needUnlock:"Unlock the previous field first.",
    demoWallet:"Deposits and withdrawals are not active in this demo.",
    sellSuccess:"Sold {amount} {crop} for {money}.",
    lockedHint:"Unlock this field to continue.",
    fieldCrop:"This field grows {crop}.",
    startTip:"Your farm is ready. Tap a field to plant or harvest.",
    wait:"Time left",
    cost:"Seed",
    yield:"Harvest",
    price:"Sell price"
  },
  fr: {
    playBalance:"Solde de jeu",
    salesBalance:"Solde des ventes",
    welcome:"VOTRE MONDE, À VOTRE RYTHME",
    heroTitle:'Un petit terrain.<br><em>De grandes possibilités.</em>',
    heroText:"Plantez vos premières graines, prenez soin des champs et développez votre ferme récolte après récolte.",
    enterFarm:"Entrer dans la ferme",
    demoNote:"Mode démo · argent fictif",
    yourLand:"VOTRE PETIT MONDE",
    farmTitle:"La ferme",
    farmSubtitle:"Choisissez une parcelle, plantez sa culture puis revenez lorsqu’elle est prête.",
    fieldsUnlocked:"Champs ouverts",
    livingFarm:"VOTRE FERME VIVANTE",
    tapPlot:"Touchez un champ pour agir",
    readyLegend:"Prêt à récolter",
    growingLegend:"En croissance",
    lockedLegend:"Champ verrouillé",
    saveNotice:"Votre progression démo est enregistrée sur cet appareil. Aucun paiement réel n’est connecté.",
    harvestMarket:"RÉCOLTE & ÉCHANGE",
    marketTitle:"Marché de la ferme",
    marketSubtitle:"Vendez vos récoltes et ajoutez le produit à votre solde des ventes.",
    crop:"Culture",
    inStorage:"En réserve",
    unitPrice:"Prix unitaire",
    action:"Action",
    sell:"Vendre",
    noHarvest:"Rien à vendre",
    moreToExplore:"À DÉCOUVRIR",
    beyondFields:"Au-delà des champs",
    systemsSubtitle:"De nouveaux espaces seront jouables dans de futures mises à jour.",
    comingSoon:"BIENTÔT",
    fishing:"Étang de pêche",
    fishingDesc:"Lancez votre ligne, attendez une touche et récupérez votre prise.",
    beehive:"Jardin des abeilles",
    beeDesc:"Faites bourdonner la ruche et récoltez du miel.",
    chickenCoop:"Poulailler",
    chickenDesc:"Prenez soin des poules et ramassez des œufs frais.",
    wallet:"PORTEFEUILLE",
    walletTitle:"Vos soldes en un coup d’œil",
    walletText:"Cette version est une démo locale. Les dépôts et retraits ne sont pas encore actifs.",
    spendSeeds:"Pour les graines et les améliorations",
    withdrawWallet:"Solde futur admissible au retrait",
    deposit:"Déposer",
    withdraw:"Retirer",
    footerText:"Un monde qui grandit, un petit pas à la fois.",
    field:"Champ",
    locked:"Verrouillé",
    unlock:"Débloquer",
    plant:"Planter",
    harvest:"Récolter",
    growing:"En croissance",
    empty:"Prêt à planter",
    ready:"Prêt à récolter",
    hours:"h",
    minutes:"min",
    seconds:"s",
    needMoney:"Solde de jeu insuffisant pour cette graine.",
    planted:"{crop} planté dans le champ {field}.",
    harvested:"Récolte de {amount} {crop}.",
    unlocked:"Champ {field} débloqué !",
    needUnlock:"Débloquez d’abord le champ précédent.",
    demoWallet:"Les dépôts et retraits ne sont pas actifs dans cette démo.",
    sellSuccess:"Vente de {amount} {crop} pour {money}.",
    lockedHint:"Débloquez ce champ pour continuer.",
    fieldCrop:"Ce champ produit : {crop}.",
    startTip:"Votre ferme est prête. Touchez un champ pour planter ou récolter.",
    wait:"Temps restant",
    cost:"Graine",
    yield:"Récolte",
    price:"Prix de vente"
  }
};

let lang = localStorage.getItem(LANGUAGE_KEY) || "en";
if (!TEXT[lang]) lang = "en";

let state;
let toastTimer;

function freshState() {
  return {
    playBalance: 10,
    salesBalance: 0,
    unlockedFields: 1,
    plots: Array.from({length:9}, () => ({
      plantedAt: null,
      readyAt: null
    })),
    inventory: Object.fromEntries(CROPS.map(c => [c.id, 0]))
  };
}

function loadState() {
  const fallback = freshState();

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

    if (!saved || typeof saved !== "object") return fallback;

    return {
      ...fallback,
      ...saved,
      unlockedFields: Math.min(9, Math.max(1, Number(saved.unlockedFields) || 1)),
      plots: fallback.plots.map((plot, index) => ({
        ...plot,
        ...(saved.plots && saved.plots[index] ? saved.plots[index] : {})
      })),
      inventory: {
        ...fallback.inventory,
        ...(saved.inventory || {})
      }
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function t(key, vars = {}) {
  let value = TEXT[lang][key] ?? TEXT.en[key] ?? key;

  for (const [name, replacement] of Object.entries(vars)) {
    value = value.replaceAll(`{${name}}`, String(replacement));
  }

  return value;
}

function money(value) {
  return "$" + Number(value || 0).toFixed(2);
}

function cropForField(index) {
  return CROPS[index];
}

function cropName(crop) {
  return crop[lang] || crop.en;
}

function formatAmount(number) {
  return Number(number).toLocaleString(
    lang === "fr" ? "fr-FR" : "en-US",
    { maximumFractionDigits: 4 }
  );
}

function remaining(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours) {
    return `${hours}${t("hours")} ${String(minutes).padStart(2,"0")}${t("minutes")}`;
  }

  if (minutes) {
    return `${minutes}${t("minutes")} ${String(secs).padStart(2,"0")}${t("seconds")}`;
  }

  return `${secs}${t("seconds")}`;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function translatePage() {
  document.documentElement.lang = lang;
  document.documentElement.dir = "ltr";

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;

    if (TEXT[lang][key]) {
      element.innerHTML = TEXT[lang][key];
    }
  });

  document.getElementById("languageSelect").value = lang;
  renderAll();
}

function renderBalances() {
  document.getElementById("playBalance").textContent = money(state.playBalance);
  document.getElementById("salesBalance").textContent = money(state.salesBalance);
  document.getElementById("walletPlayBalance").textContent = money(state.playBalance);
  document.getElementById("walletSalesBalance").textContent = money(state.salesBalance);
  document.getElementById("fieldCount").textContent = state.unlockedFields;
}

function plotStatus(index, plot, crop) {
  if (index >= state.unlockedFields) {
    return {
      cls: "locked",
      icon: "🔒",
      title: t("field") + " " + (index + 1),
      status: money(FIELD_COSTS[index]) + " · " + t("unlock")
    };
  }

  if (plot.readyAt && Date.now() >= plot.readyAt) {
    return {
      cls: "ready",
      icon: crop.emoji,
      title: cropName(crop),
      status: t("ready")
    };
  }

  if (plot.readyAt) {
    return {
      cls: "growing",
      icon: crop.emoji,
      title: cropName(crop),
      status: remaining(plot.readyAt - Date.now())
    };
  }

  return {
    cls: "empty",
    icon: crop.emoji,
    title: cropName(crop),
    status: t("empty")
  };
}

function renderFields() {
  const grid = document.getElementById("fieldGrid");
  grid.innerHTML = "";

  state.plots.forEach((plot, index) => {
    const crop = cropForField(index);
    const status = plotStatus(index, plot, crop);
    const button = document.createElement("button");

    button.type = "button";
    button.className = `plot ${status.cls}`;
    button.dataset.field = String(index);
    button.setAttribute(
      "aria-label",
      `${t("field")} ${index + 1}: ${status.status}`
    );

    let progress = 0;

    if (plot.plantedAt && plot.readyAt) {
      progress = Math.max(
        0,
        Math.min(
          100,
          ((Date.now() - plot.plantedAt) / (plot.readyAt - plot.plantedAt)) * 100
        )
      );
    }

    button.innerHTML = `
      <span class="plot-inner"></span>
      <span class="plot-icon">${status.icon}</span>
      <span class="plot-info">
        <span class="plot-title">${escapeHtml(status.title)}</span>
        <span class="plot-status">${escapeHtml(status.status)}</span>
      </span>
      ${
        plot.readyAt && index < state.unlockedFields
          ? `<span class="mini-progress" style="width:${progress}%"></span>`
          : ""
      }
    `;

    grid.appendChild(button);
  });
}

function renderMarket() {
  const rows = document.getElementById("marketRows");
  rows.innerHTML = "";

  CROPS.forEach(crop => {
    const amount = Number(state.inventory[crop.id] || 0);
    const row = document.createElement("div");

    row.className = "market-row";

    row.innerHTML = `
      <div class="market-crop">
        <span class="crop-emoji">${crop.emoji}</span>
        <span>
          ${escapeHtml(cropName(crop))}
          <span class="crop-sub">${t("price")}: ${money(crop.price)}</span>
        </span>
      </div>
      <span class="market-quantity">${formatAmount(amount)}</span>
      <span class="market-price">${money(crop.price)}</span>
      <span>
        <button
          class="sell-button"
          data-sell="${crop.id}"
          ${amount <= 0 ? "disabled" : ""}
        >${amount > 0 ? t("sell") : t("noHarvest")}</button>
      </span>
    `;

    rows.appendChild(row);
  });
}

function renderAll() {
  renderBalances();
  renderFields();
  renderMarket();

  document.getElementById("year").textContent = new Date().getFullYear();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

function handlePlot(index) {
  const plot = state.plots[index];
  const crop = cropForField(index);

  // Unlock fields in order.
  if (index >= state.unlockedFields) {
    if (index !== state.unlockedFields) {
      showToast(t("needUnlock"));
      return;
    }

    const cost = FIELD_COSTS[index];

    if (state.playBalance < cost) {
      showToast(t("needMoney"));
      return;
    }

    state.playBalance = Number((state.playBalance - cost).toFixed(4));
    state.unlockedFields++;

    saveState();
    renderAll();

    showToast(t("unlocked", { field: index + 1 }));
    return;
  }

  // Harvest if the crop has finished growing.
  if (plot.readyAt && Date.now() >= plot.readyAt) {
    state.inventory[crop.id] = Number(
      (Number(state.inventory[crop.id] || 0) + crop.yield).toFixed(4)
    );

    plot.plantedAt = null;
    plot.readyAt = null;

    saveState();
    renderAll();

    showToast(
      t("harvested", {
        amount: formatAmount(crop.yield),
        crop: cropName(crop)
      })
    );

    return;
  }

  // A planted crop cannot be replanted until it is harvested.
  if (plot.readyAt) {
    showToast(`${t("wait")}: ${remaining(plot.readyAt - Date.now())}`);
    return;
  }

  // Buy and plant the crop assigned to this field.
  if (state.playBalance < crop.seed) {
    showToast(t("needMoney"));
    return;
  }

  state.playBalance = Number((state.playBalance - crop.seed).toFixed(4));

  const now = Date.now();
  plot.plantedAt = now;
  plot.readyAt = now + crop.hours * 60 * 60 * 1000;

  saveState();
  renderAll();

  showToast(
    t("planted", {
      crop: cropName(crop),
      field: index + 1
    })
  );
}

function sellCrop(id) {
  const crop = CROPS.find(item => item.id === id);
  const amount = Number(state.inventory[id] || 0);

  if (!crop || amount <= 0) return;

  const proceeds = Number((amount * crop.price).toFixed(4));

  state.inventory[id] = 0;
  state.salesBalance = Number((state.salesBalance + proceeds).toFixed(4));

  saveState();
  renderAll();

  showToast(
    t("sellSuccess", {
      amount: formatAmount(amount),
      crop: cropName(crop),
      money: money(proceeds)
    })
  );
}

function init() {
  state = loadState();

  document.getElementById("languageSelect").addEventListener("change", event => {
    lang = event.target.value;
    localStorage.setItem(LANGUAGE_KEY, lang);
    translatePage();
  });

  document.getElementById("fieldGrid").addEventListener("click", event => {
    const button = event.target.closest("[data-field]");

    if (button) {
      handlePlot(Number(button.dataset.field));
    }
  });

  document.getElementById("marketRows").addEventListener("click", event => {
    const button = event.target.closest("[data-sell]");

    if (button) {
      sellCrop(button.dataset.sell);
    }
  });

  document.getElementById("startBtn").addEventListener("click", () => {
    document.getElementById("farm").scrollIntoView({ behavior: "smooth" });
    showToast(t("startTip"));
  });

  document.getElementById("depositBtn").addEventListener("click", () => {
    showToast(t("demoWallet"));
  });

  document.getElementById("withdrawBtn").addEventListener("click", () => {
    showToast(t("demoWallet"));
  });

  translatePage();

  // Refresh crop timers while crops are growing.
  setInterval(() => {
    const hasGrowing = state.plots.some(
      (plot, index) => index < state.unlockedFields && plot.readyAt
    );

    if (hasGrowing) renderFields();
  }, 1000);
}

document.addEventListener("DOMContentLoaded", init);
