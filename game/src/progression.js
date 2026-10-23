function debit(state, price) {
  if (!Number.isFinite(price) || price < 0 || state.balance + 1e-9 < price) return false;
  state.balance = Number((state.balance - price).toFixed(6));
  return true;
}

export function restoreRodOwnership(rodIds, savedState) {
  return Object.fromEntries(rodIds.map((id) => [
    id,
    typeof savedState.ownedRods?.[id] === 'boolean'
      ? savedState.ownedRods[id]
      : Number(savedState.rods?.[id] || 0) > 0,
  ]));
}

export function restoreEquippedRod(rodIds, savedState) {
  if (Object.hasOwn(savedState, 'equippedRod')) {
    return rodIds.includes(savedState.equippedRod) ? savedState.equippedRod : null;
  }
  return rodIds.find((id) => Number(savedState.rods?.[id] || 0) > 0) || null;
}

export function unlockLand(state, index, prices) {
  const field = state.fields[index];
  if (!Number.isInteger(index) || !field || !Number.isFinite(prices[index])) return 'invalid';
  if (field.unlocked) return 'owned';
  if (!debit(state, prices[index])) return 'insufficient-funds';
  field.unlocked = true;
  return 'purchased';
}

export function sellInventoryProduct(state, type, index, unitPrice) {
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) return { status: 'invalid' };
  let amount;
  let updateInventory;

  if (type === 'crop' || type === 'fish') {
    const inventory = type === 'crop' ? state.harvest : state.fish;
    if (!Array.isArray(inventory) || !Number.isInteger(index) || index < 0 || index >= inventory.length) {
      return { status: 'invalid' };
    }
    amount = inventory[index];
    updateInventory = () => { inventory[index] = 0; };
  } else if (type === 'hive' || type === 'coop') {
    if (!state[type] || typeof state[type] !== 'object') return { status: 'invalid' };
    amount = state[type].inventory;
    updateInventory = () => { state[type].inventory = 0; };
  } else {
    return { status: 'invalid' };
  }

  if (!Number.isFinite(amount) || amount <= 0) return { status: 'empty' };
  const proceeds = Number((amount * unitPrice).toFixed(6));
  if (!Number.isFinite(state.sales) || !Number.isFinite(proceeds)) return { status: 'invalid' };
  updateInventory();
  state.sales = Number((state.sales + proceeds).toFixed(6));
  return { status: 'sold', quantity: amount, proceeds };
}

export function purchaseRod(state, id, catalog) {
  const rod = catalog[id];
  if (!rod || !Object.hasOwn(state.rods, id)) return 'invalid';
  if (!state.fishingUnlocked) return 'locked';
  if (state.ownedRods[id]) return 'owned';
  if (!debit(state, rod.price)) return 'insufficient-funds';
  state.ownedRods[id] = true;
  state.rods[id] = rod.uses;
  return 'purchased';
}

export function equipRod(state, id, catalog) {
  if (!Object.hasOwn(catalog, id) || !state.ownedRods[id]) return 'not-owned';
  if (state.equippedRod === id) return 'already-equipped';
  state.equippedRod = id;
  return 'equipped';
}

export function canUseEquippedRod(state, id) {
  return state.fishingUnlocked
    && state.equippedRod === id
    && state.ownedRods[id]
    && state.rods[id] > 0;
}

export function beginFishingAttempt(state, id, now, wait, pendingFish) {
  if (!canUseEquippedRod(state, id)) return 'rod-unavailable';
  if (state.fishing.busyUntil) return 'busy';
  state.fishing.pendingFish = pendingFish;
  state.fishing.rodId = id;
  state.fishing.busyUntil = now + wait;
  state.fishing.catchDeadline = state.fishing.busyUntil + 60_000;
  return 'started';
}

export function consumeRodUse(state, id) {
  if (!state.ownedRods[id] || state.rods[id] <= 0) return false;
  state.rods[id] -= 1;
  return true;
}

export function purchaseAnimal(state, type, prices) {
  if (!Object.hasOwn(prices, type)) return 'invalid';
  const animal = state[type];
  if (animal.owned) return 'owned';
  if (!debit(state, prices[type])) return 'insufficient-funds';
  animal.owned = true;
  animal.activated = false;
  return 'purchased';
}

export function activateAnimal(state, type, prices) {
  if (!Object.hasOwn(prices, type)) return 'invalid';
  const animal = state[type];
  if (!animal.owned) return 'not-owned';
  if (animal.activated) return 'already-activated';
  animal.activated = true;
  return 'activated';
}

export function startAnimalCycle(state, type, prices, now, speed) {
  if (!Object.hasOwn(prices, type)) return 'invalid';
  const animal = state[type];
  if (!animal.owned) return 'not-owned';
  if (!animal.activated) return 'not-activated';
  if (animal.startedAt !== null && !animal.expired) return 'running';
  if (!debit(state, prices[type])) return 'insufficient-funds';
  animal.startedAt = now;
  animal.speed = speed;
  animal.collected = 0;
  animal.expired = false;
  return 'started';
}

export function isAnimalProducing(animal) {
  return Boolean(animal?.owned && animal.activated && animal.startedAt !== null && animal.startedAt !== undefined && !animal.expired);
}
