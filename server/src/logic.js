// Keep these small functions separate so they are easy to test and understand.
export function getDaysUntil(dateString, today = new Date()) {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;

  const [year, month, day] = dateString.split('-').map(Number);
  const target = new Date(year, month - 1, day);

  // JavaScript normalizes dates such as February 31 into the following month.
  // Compare the parts so invalid calendar dates are not treated as real dates.
  if (target.getFullYear() !== year || target.getMonth() !== month - 1 || target.getDate() !== day) {
    return null;
  }

  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - start) / (1000 * 60 * 60 * 24));
}

export function getExpiryLabel(dateString, today = new Date()) {
  const days = getDaysUntil(dateString, today);
  if (days === null) return 'No expiry date';
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days <= 3) return `In ${days} days`;
  return `In ${days} days`;
}

export function scoreRecipe(recipe, pantry) {
  const pantryNames = pantry.map((item) => item.name.trim().toLowerCase());
  const matchedIngredients = recipe.ingredients.filter((ingredient) => pantryNames.includes(ingredient.name.toLowerCase()));
  const missingIngredients = recipe.ingredients.filter((ingredient) => !pantryNames.includes(ingredient.name.toLowerCase()));

  // A simple, explainable score: more ingredients already at home means a better match.
  const score = recipe.ingredients.length === 0
    ? 0
    : Math.round((matchedIngredients.length / recipe.ingredients.length) * 100);

  return {
    ...recipe,
    matchedCount: matchedIngredients.length,
    missingCount: missingIngredients.length,
    matchScore: score,
    missingIngredients
  };
}

export function getRecipeSuggestions(recipes, pantry) {
  return recipes
    .map((recipe) => scoreRecipe(recipe, pantry))
    .sort((a, b) => b.matchScore - a.matchScore || a.time - b.time);
}

export function addMissingItemsToList(recipe, pantry, shopping) {
  const existingNames = new Set(shopping.map((item) => item.name.trim().toLowerCase()));
  const pantryNames = new Set(pantry.map((item) => item.name.trim().toLowerCase()));
  const addedItems = [];

  for (const ingredient of recipe.ingredients) {
    const key = ingredient.name.toLowerCase();
    if (!pantryNames.has(key) && !existingNames.has(key)) {
      addedItems.push({
        id: `g-${Date.now()}-${addedItems.length}`,
        name: ingredient.name,
        quantity: `${ingredient.quantity} ${ingredient.unit}`,
        category: 'From recipe',
        checked: false,
        source: recipe.id,
        createdAt: new Date().toISOString()
      });
      existingNames.add(key);
    }
  }

  return addedItems;
}

export function consumeRecipeIngredients(recipe, pantry) {
  const changes = [];
  for (const ingredient of recipe.ingredients) {
    const pantryItem = pantry.find((item) => item.name.toLowerCase() === ingredient.name.toLowerCase());
    if (!pantryItem) continue;

    // Only subtract when units match. This avoids silently mixing cups, grams and pieces.
    const recipeUnit = ingredient.unit.toLowerCase();
    const pantryUnit = pantryItem.unit.toLowerCase();
    const compatibleUnits = [
      ['piece', 'pieces'], ['cup', 'cups'], ['slice', 'slices'],
      ['clove', 'cloves'], ['tbsp', 'tbsp'], ['g', 'g'], ['ml', 'ml'],
      ['litre', 'litre'], ['packet', 'packet'], ['bunch', 'bunch']
    ];
    const sameUnit = recipeUnit === pantryUnit || compatibleUnits.some((pair) => pair.includes(recipeUnit) && pair.includes(pantryUnit));
    if (!sameUnit) continue;

    const previousQuantity = Number(pantryItem.quantity);
    const usedQuantity = Number(ingredient.quantity);
    if (!Number.isFinite(previousQuantity) || previousQuantity < usedQuantity) continue;

    pantryItem.quantity = Number((previousQuantity - usedQuantity).toFixed(2));
    changes.push({ name: pantryItem.name, used: usedQuantity, unit: pantryItem.unit, remaining: pantryItem.quantity });
  }
  return changes;
}
