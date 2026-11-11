import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addMissingItemsToList,
  consumeRecipeIngredients,
  getDaysUntil,
  getExpiryLabel,
  getRecipeSuggestions,
  scoreRecipe
} from '../src/logic.js';

const today = new Date(2026, 10, 12);

test('getDaysUntil counts whole calendar days', () => {
  assert.equal(getDaysUntil('2026-11-12', today), 0);
  assert.equal(getDaysUntil('2026-11-14', today), 2);
  assert.equal(getDaysUntil('2026-11-10', today), -2);
  assert.equal(getDaysUntil(null, today), null);
  assert.equal(getDaysUntil('2026-02-31', today), null);
  assert.equal(getDaysUntil('12-11-2026', today), null);
});

test('getExpiryLabel explains dates in everyday language', () => {
  assert.equal(getExpiryLabel('2026-11-12', today), 'Expires today');
  assert.equal(getExpiryLabel('2026-11-13', today), 'Expires tomorrow');
  assert.equal(getExpiryLabel(null, today), 'No expiry date');
});

test('scoreRecipe returns pantry matches and missing ingredients', () => {
  const recipe = { ingredients: [{ name: 'Tomato' }, { name: 'Eggs' }, { name: 'Bread' }] };
  const result = scoreRecipe(recipe, [{ name: 'tomato' }, { name: 'Bread' }]);
  assert.equal(result.matchedCount, 2);
  assert.equal(result.missingCount, 1);
  assert.equal(result.matchScore, 67);
  assert.equal(result.missingIngredients[0].name, 'Eggs');
});

test('suggestions rank recipes with the best pantry match first', () => {
  const recipes = [
    { id: 'one', time: 10, ingredients: [{ name: 'Tomato' }, { name: 'Bread' }] },
    { id: 'two', time: 20, ingredients: [{ name: 'Tomato' }, { name: 'Eggs' }, { name: 'Bread' }] }
  ];
  const result = getRecipeSuggestions(recipes, [{ name: 'Tomato' }, { name: 'Bread' }]);
  assert.equal(result[0].id, 'one');
});

test('missing recipe ingredients are not duplicated in the shopping list', () => {
  const recipe = { id: 'toast', ingredients: [
    { name: 'Eggs', quantity: 2, unit: 'pieces' },
    { name: 'Tomato', quantity: 1, unit: 'piece' },
    { name: 'Bread', quantity: 2, unit: 'slices' }
  ] };
  const added = addMissingItemsToList(recipe, [{ name: 'Tomato' }], [{ name: 'Eggs' }]);
  assert.equal(added.length, 1);
  assert.equal(added[0].name, 'Bread');
});

test('cooking a recipe reduces quantities only when units match and stock is enough', () => {
  const recipe = { ingredients: [
    { name: 'Tomato', quantity: 1, unit: 'piece' },
    { name: 'Milk', quantity: 2, unit: 'cups' },
    { name: 'Eggs', quantity: 2, unit: 'pieces' }
  ] };
  const pantry = [
    { name: 'Tomato', quantity: 4, unit: 'pieces' },
    { name: 'Milk', quantity: 1, unit: 'litre' },
    { name: 'Eggs', quantity: 1, unit: 'pieces' }
  ];
  const changes = consumeRecipeIngredients(recipe, pantry);
  assert.equal(changes.length, 1);
  assert.equal(pantry[0].quantity, 3);
  assert.equal(pantry[1].quantity, 1);
  assert.equal(pantry[2].quantity, 1);
});
