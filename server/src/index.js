import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import { ensureStore, readStore, updateStore } from './store.js';
import { recipes } from './recipes.js';
import { addMissingItemsToList, consumeRecipeIngredients, getDaysUntil, getRecipeSuggestions } from './logic.js';

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json({ limit: '1mb' }));

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function validatePantryItem(body) {
  const name = String(body.name || '').trim();
  const quantity = Number(body.quantity);
  const unit = String(body.unit || '').trim();
  if (!name) return 'Ingredient name is required.';
  if (!Number.isFinite(quantity) || quantity < 0) return 'Quantity must be zero or greater.';
  if (!unit) return 'Unit is required.';
  return null;
}

function validateShoppingItem(body) {
  if (!String(body.name || '').trim()) return 'Item name is required.';
  if (!String(body.quantity || '').trim()) return 'Quantity is required.';
  return null;
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'UseUp API' }));

app.get('/api/dashboard', async (req, res, next) => {
  try {
    const data = await readStore();
    const expiringItems = data.pantry
      .map((item) => ({ ...item, daysLeft: getDaysUntil(item.expiryDate) }))
      .filter((item) => item.daysLeft !== null && item.daysLeft <= 3)
      .sort((a, b) => a.daysLeft - b.daysLeft);
    const suggestions = getRecipeSuggestions(recipes, data.pantry).slice(0, 4);
    res.json({
      stats: {
        pantryCount: data.pantry.length,
        expiringCount: expiringItems.length,
        plannedMeals: data.mealPlan.length,
        openShopping: data.shopping.filter((item) => !item.checked).length
      },
      expiringItems,
      suggestions,
      nextMeal: data.mealPlan[0] || null
    });
  } catch (error) { next(error); }
});

app.get('/api/pantry', async (req, res, next) => {
  try { const data = await readStore(); res.json(data.pantry); }
  catch (error) { next(error); }
});

app.post('/api/pantry', async (req, res, next) => {
  try {
    const errorMessage = validatePantryItem(req.body);
    if (errorMessage) return res.status(400).json({ error: errorMessage });
    const item = {
      id: createId('p'), name: String(req.body.name).trim(), category: String(req.body.category || 'Other'),
      quantity: Number(req.body.quantity), unit: String(req.body.unit).trim(),
      expiryDate: req.body.expiryDate || null, location: String(req.body.location || 'Pantry'), addedAt: new Date().toISOString()
    };
    await updateStore((data) => data.pantry.push(item));
    res.status(201).json(item);
  } catch (error) { next(error); }
});

app.patch('/api/pantry/:id', async (req, res, next) => {
  try {
    if (req.body.quantity !== undefined && (!Number.isFinite(Number(req.body.quantity)) || Number(req.body.quantity) < 0)) {
      return res.status(400).json({ error: 'Quantity must be zero or greater.' });
    }
    const item = await updateStore((data) => {
      const found = data.pantry.find((entry) => entry.id === req.params.id);
      if (!found) return null;
      Object.assign(found, req.body, { id: found.id });
      if (found.quantity !== undefined) found.quantity = Number(found.quantity);
      return found;
    });
    if (!item) return res.status(404).json({ error: 'Pantry item not found.' });
    res.json(item);
  } catch (error) { next(error); }
});

app.delete('/api/pantry/:id', async (req, res, next) => {
  try {
    const removed = await updateStore((data) => {
      const index = data.pantry.findIndex((item) => item.id === req.params.id);
      if (index === -1) return false;
      data.pantry.splice(index, 1);
      return true;
    });
    if (!removed) return res.status(404).json({ error: 'Pantry item not found.' });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.get('/api/recipes', async (req, res, next) => {
  try {
    const data = await readStore();
    res.json(getRecipeSuggestions(recipes, data.pantry));
  } catch (error) { next(error); }
});

app.post('/api/recipes/:id/add-missing', async (req, res, next) => {
  try {
    const recipe = recipes.find((entry) => entry.id === req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found.' });
    const added = await updateStore((data) => {
      const newItems = addMissingItemsToList(recipe, data.pantry, data.shopping);
      data.shopping.push(...newItems);
      return newItems;
    });
    res.status(201).json({ added, message: added.length ? 'Missing ingredients added.' : 'You already have everything or the items are on your list.' });
  } catch (error) { next(error); }
});

app.post('/api/recipes/:id/cook', async (req, res, next) => {
  try {
    const recipe = recipes.find((entry) => entry.id === req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found.' });
    const result = await updateStore((data) => {
      const changes = consumeRecipeIngredients(recipe, data.pantry);
      data.cookingHistory.unshift({ id: createId('cook'), recipeId: recipe.id, recipeName: recipe.name, cookedAt: new Date().toISOString(), changes });
      return { changes, cookedAt: new Date().toISOString() };
    });
    res.json({ message: 'Nice work. Your pantry has been updated.', ...result });
  } catch (error) { next(error); }
});

app.get('/api/shopping', async (req, res, next) => {
  try { const data = await readStore(); res.json(data.shopping); }
  catch (error) { next(error); }
});

app.post('/api/shopping', async (req, res, next) => {
  try {
    const errorMessage = validateShoppingItem(req.body);
    if (errorMessage) return res.status(400).json({ error: errorMessage });
    const item = {
      id: createId('g'), name: String(req.body.name).trim(), quantity: String(req.body.quantity).trim(),
      category: String(req.body.category || 'Other'), checked: false, source: 'manual', createdAt: new Date().toISOString()
    };
    await updateStore((data) => data.shopping.push(item));
    res.status(201).json(item);
  } catch (error) { next(error); }
});

app.patch('/api/shopping/:id', async (req, res, next) => {
  try {
    const item = await updateStore((data) => {
      const found = data.shopping.find((entry) => entry.id === req.params.id);
      if (!found) return null;
      if (typeof req.body.checked === 'boolean') found.checked = req.body.checked;
      if (req.body.name !== undefined) found.name = String(req.body.name).trim();
      if (req.body.quantity !== undefined) found.quantity = String(req.body.quantity).trim();
      return found;
    });
    if (!item) return res.status(404).json({ error: 'Shopping item not found.' });
    res.json(item);
  } catch (error) { next(error); }
});

app.delete('/api/shopping/:id', async (req, res, next) => {
  try {
    const removed = await updateStore((data) => {
      const index = data.shopping.findIndex((item) => item.id === req.params.id);
      if (index === -1) return false;
      data.shopping.splice(index, 1);
      return true;
    });
    if (!removed) return res.status(404).json({ error: 'Shopping item not found.' });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.get('/api/meal-plan', async (req, res, next) => {
  try { const data = await readStore(); res.json(data.mealPlan); }
  catch (error) { next(error); }
});

app.put('/api/meal-plan/:date', async (req, res, next) => {
  try {
    const { recipeId, slot = 'Dinner' } = req.body;
    const recipe = recipes.find((entry) => entry.id === recipeId);
    if (!recipe) return res.status(400).json({ error: 'Choose a valid recipe.' });
    const date = req.params.date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(`${date}T00:00:00`).getTime())) {
      return res.status(400).json({ error: 'Date must use YYYY-MM-DD format.' });
    }
    const saved = await updateStore((data) => {
      const existing = data.mealPlan.find((entry) => entry.date === date && entry.slot === slot);
      if (existing) Object.assign(existing, { recipeId, recipeName: recipe.name });
      else data.mealPlan.push({ id: createId('meal'), date, slot, recipeId, recipeName: recipe.name });
      return data.mealPlan.find((entry) => entry.date === date && entry.slot === slot);
    });
    res.json(saved);
  } catch (error) { next(error); }
});

app.delete('/api/meal-plan/:id', async (req, res, next) => {
  try {
    const removed = await updateStore((data) => {
      const index = data.mealPlan.findIndex((entry) => entry.id === req.params.id);
      if (index === -1) return false;
      data.mealPlan.splice(index, 1);
      return true;
    });
    if (!removed) return res.status(404).json({ error: 'Meal plan entry not found.' });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

await ensureStore();
app.listen(PORT, () => console.log(`UseUp API is running at http://localhost:${PORT}`));
