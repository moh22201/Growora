import assert from 'node:assert/strict';
import test from 'node:test';
import {
  activateAnimal,
  beginFishingAttempt,
  canUseEquippedRod,
  consumeRodUse,
  equipRod,
  isAnimalProducing,
  purchaseAnimal,
  purchaseRod,
  restoreEquippedRod,
  restoreRodOwnership,
  startAnimalCycle,
  unlockLand,
} from '../src/progression.js';

const fieldCosts = [0, 0.5];
const rods = {
  ordinary: { price: 0.15, uses: 5 },
  upgraded: { price: 0.5, uses: 7 },
};
const animalPrices = { hive: 3, coop: 5 };
const cycleFees = { hive: 0.2, coop: 0.4 };

function makeState(balance = 100) {
  return {
    balance,
    sales: 7,
    fields: [{ unlocked: true }, { unlocked: false }],
    fishingUnlocked: true,
    rods: { ordinary: 0, upgraded: 0 },
    ownedRods: { ordinary: false, upgraded: false },
    equippedRod: null,
    fishing: { busyUntil: null, catchDeadline: null, pendingFish: null, rodId: null },
    hive: { owned: false, activated: false, startedAt: null, collected: 0, expired: false },
    coop: { owned: false, activated: false, startedAt: null, collected: 0, expired: false },
  };
}

test('unlocks a plot once, at its configured price, and leaves insufficient balances unchanged', () => {
  const state = makeState(0.5);
  assert.equal(unlockLand(state, 1, fieldCosts), 'purchased');
  assert.equal(state.balance, 0);
  assert.equal(state.fields[1].unlocked, true);
  assert.equal(unlockLand(state, 1, fieldCosts), 'owned');
  assert.equal(state.balance, 0);

  state.balance = 0.49;
  state.fields[1].unlocked = false;
  assert.equal(unlockLand(state, 1, fieldCosts), 'insufficient-funds');
  assert.equal(state.balance, 0.49);
  assert.equal(state.fields[1].unlocked, false);
});

test('buys one rod, equips it, and consumes its configured fishing attempts', () => {
  const state = makeState(0.15);
  assert.equal(purchaseRod(state, 'ordinary', rods), 'purchased');
  assert.equal(state.balance, 0);
  assert.equal(state.ownedRods.ordinary, true);
  assert.equal(state.rods.ordinary, 5);
  assert.equal(purchaseRod(state, 'ordinary', rods), 'owned');
  assert.equal(state.balance, 0);

  assert.equal(canUseEquippedRod(state, 'ordinary'), false);
  assert.equal(equipRod(state, 'ordinary', rods), 'equipped');
  assert.equal(canUseEquippedRod(state, 'ordinary'), true);
  assert.equal(beginFishingAttempt(state, 'ordinary', 10_000, 300_000, 2), 'started');
  assert.equal(state.fishing.busyUntil, 310_000);
  assert.equal(state.fishing.catchDeadline, 370_000);
  assert.equal(state.fishing.pendingFish, 2);
  const pendingSave = JSON.parse(JSON.stringify(state));
  assert.equal(pendingSave.fishing.busyUntil, 310_000);
  assert.equal(pendingSave.fishing.catchDeadline, 370_000);
  assert.equal(pendingSave.fishing.rodId, 'ordinary');
  assert.equal(beginFishingAttempt(state, 'ordinary', 20_000, 300_000, 1), 'busy');
  assert.equal(state.rods.ordinary, 5);
  assert.equal(consumeRodUse(state, 'ordinary'), true);
  assert.equal(state.rods.ordinary, 4);

  const poorState = makeState(0.14);
  assert.equal(purchaseRod(poorState, 'ordinary', rods), 'insufficient-funds');
  assert.equal(poorState.balance, 0.14);
  assert.equal(poorState.ownedRods.ordinary, false);
});

test('restores an explicit unequipped rod state and migrates older rod saves', () => {
  const rodIds = ['ordinary', 'upgraded'];
  const savedState = {
    equippedRod: null,
    ownedRods: { ordinary: true, upgraded: false },
    rods: { ordinary: 5, upgraded: 0 },
  };
  assert.equal(restoreEquippedRod(rodIds, savedState), null);
  assert.deepEqual(restoreRodOwnership(rodIds, savedState), { ordinary: true, upgraded: false });

  const legacyState = { rods: { ordinary: 0, upgraded: 2 } };
  assert.equal(restoreEquippedRod(rodIds, legacyState), 'upgraded');
  assert.deepEqual(restoreRodOwnership(rodIds, legacyState), { ordinary: false, upgraded: true });
});

test('requires animal purchase, activation, and the configured operating fee before production', () => {
  const state = makeState(3.2);
  assert.equal(startAnimalCycle(state, 'hive', cycleFees, 10_000, 1), 'not-owned');
  assert.equal(state.balance, 3.2);

  assert.equal(purchaseAnimal(state, 'hive', animalPrices), 'purchased');
  assert.equal(state.balance, 0.2);
  assert.equal(state.sales, 7);
  assert.equal(purchaseAnimal(state, 'hive', animalPrices), 'owned');
  assert.equal(state.balance, 0.2);
  assert.equal(isAnimalProducing(state.hive), false);
  assert.equal(startAnimalCycle(state, 'hive', cycleFees, 10_000, 1), 'not-activated');
  assert.equal(state.balance, 0.2);

  assert.equal(activateAnimal(state, 'hive', animalPrices), 'activated');
  assert.equal(isAnimalProducing(state.hive), false);
  assert.equal(startAnimalCycle(state, 'hive', cycleFees, 10_000, 1), 'started');
  assert.equal(state.balance, 0);
  assert.equal(isAnimalProducing(state.hive), true);
  assert.equal(startAnimalCycle(state, 'hive', cycleFees, 20_000, 1), 'running');
  assert.equal(state.balance, 0);

  const noOperatingFunds = makeState(3);
  assert.equal(purchaseAnimal(noOperatingFunds, 'hive', animalPrices), 'purchased');
  assert.equal(activateAnimal(noOperatingFunds, 'hive', animalPrices), 'activated');
  assert.equal(startAnimalCycle(noOperatingFunds, 'hive', cycleFees, 10_000, 1), 'insufficient-funds');
  assert.equal(noOperatingFunds.balance, 0);
  assert.equal(isAnimalProducing(noOperatingFunds.hive), false);
});

test('preserves ownership, activation, balance, and production timing through save serialization', () => {
  const state = makeState(5.55);
  assert.equal(purchaseAnimal(state, 'coop', animalPrices), 'purchased');
  assert.equal(activateAnimal(state, 'coop', animalPrices), 'activated');
  assert.equal(startAnimalCycle(state, 'coop', cycleFees, 123_456, 0.85), 'started');
  assert.equal(purchaseRod(state, 'ordinary', rods), 'purchased');
  assert.equal(equipRod(state, 'ordinary', rods), 'equipped');

  const reloaded = JSON.parse(JSON.stringify(state));
  assert.equal(reloaded.balance, 0);
  assert.equal(reloaded.sales, 7);
  assert.equal(reloaded.coop.owned, true);
  assert.equal(reloaded.coop.activated, true);
  assert.equal(reloaded.coop.startedAt, 123_456);
  assert.equal(reloaded.coop.speed, 0.85);
  assert.equal(isAnimalProducing(reloaded.coop), true);
  assert.equal(reloaded.ownedRods.ordinary, true);
  assert.equal(reloaded.equippedRod, 'ordinary');
  assert.equal(reloaded.rods.ordinary, 5);
  assert.equal(reloaded.fishing.busyUntil, null);
});
