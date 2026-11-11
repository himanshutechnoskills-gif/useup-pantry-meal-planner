import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.resolve(here, '../data/store.json');

function dateFromToday(daysFromToday) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

export function createInitialStore() {
  return {
    pantry: [
      { id: 'p-1', name: 'Tomato', category: 'Vegetables', quantity: 4, unit: 'pieces', expiryDate: dateFromToday(2), location: 'Fridge', addedAt: new Date().toISOString() },
      { id: 'p-2', name: 'Eggs', category: 'Dairy & eggs', quantity: 6, unit: 'pieces', expiryDate: dateFromToday(8), location: 'Fridge', addedAt: new Date().toISOString() },
      { id: 'p-3', name: 'Milk', category: 'Dairy & eggs', quantity: 1, unit: 'litre', expiryDate: dateFromToday(1), location: 'Fridge', addedAt: new Date().toISOString() },
      { id: 'p-4', name: 'Onion', category: 'Vegetables', quantity: 5, unit: 'pieces', expiryDate: dateFromToday(16), location: 'Pantry', addedAt: new Date().toISOString() },
      { id: 'p-5', name: 'Spinach', category: 'Vegetables', quantity: 1, unit: 'bunch', expiryDate: dateFromToday(2), location: 'Fridge', addedAt: new Date().toISOString() },
      { id: 'p-6', name: 'Bread', category: 'Bakery', quantity: 1, unit: 'packet', expiryDate: dateFromToday(3), location: 'Counter', addedAt: new Date().toISOString() },
      { id: 'p-7', name: 'Potatoes', category: 'Vegetables', quantity: 4, unit: 'pieces', expiryDate: dateFromToday(20), location: 'Pantry', addedAt: new Date().toISOString() },
      { id: 'p-8', name: 'Yogurt', category: 'Dairy & eggs', quantity: 1, unit: 'cup', expiryDate: dateFromToday(5), location: 'Fridge', addedAt: new Date().toISOString() },
      { id: 'p-9', name: 'Lentils', category: 'Grains & pulses', quantity: 2, unit: 'cups', expiryDate: null, location: 'Pantry', addedAt: new Date().toISOString() },
      { id: 'p-10', name: 'Garlic', category: 'Vegetables', quantity: 1, unit: 'bulb', expiryDate: dateFromToday(30), location: 'Pantry', addedAt: new Date().toISOString() }
    ],
    shopping: [
      { id: 'g-1', name: 'Bananas', quantity: '6 pieces', category: 'Fruit', checked: false, source: 'manual', createdAt: new Date().toISOString() },
      { id: 'g-2', name: 'Oats', quantity: '1 packet', category: 'Grains & pulses', checked: false, source: 'manual', createdAt: new Date().toISOString() },
      { id: 'g-3', name: 'Dish soap', quantity: '1 bottle', category: 'Home', checked: true, source: 'manual', createdAt: new Date().toISOString() }
    ],
    mealPlan: [],
    cookingHistory: []
  };
}

let writeQueue = Promise.resolve();

export async function ensureStore() {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(createInitialStore(), null, 2));
  }
}

export async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(dataFile, 'utf8');
  return JSON.parse(raw);
}

// Writes are queued so two quick API requests don't overwrite each other's changes.
export function updateStore(changeFunction) {
  const currentTask = writeQueue.then(async () => {
    const data = await readStore();
    const result = await changeFunction(data);
    const tempFile = `${dataFile}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2));
    await fs.rename(tempFile, dataFile);
    return result;
  });

  // Keep the queue alive even if one request fails.
  writeQueue = currentTask.catch(() => {});
  return currentTask;
}
