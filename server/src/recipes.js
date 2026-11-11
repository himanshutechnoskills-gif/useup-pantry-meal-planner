// A small, editable starter recipe collection. Quantities are per recipe serving.
export const recipes = [
  {
    id: 'tomato-egg-toast', name: 'Tomato & egg toast', category: 'Breakfast', time: 12, servings: 1,
    difficulty: 'Easy', emoji: '🍳', art: 'sunny', description: 'A quick, warm breakfast with juicy tomatoes and a soft egg.',
    ingredients: [{ name: 'Eggs', quantity: 1, unit: 'piece' }, { name: 'Tomato', quantity: 1, unit: 'piece' }, { name: 'Bread', quantity: 2, unit: 'slices' }, { name: 'Butter', quantity: 1, unit: 'tbsp' }],
    steps: ['Toast the bread in a pan until golden.', 'Warm the butter and cook the chopped tomato for two minutes.', 'Cook the egg the way you like it and serve over the toast.']
  },
  {
    id: 'veg-fried-rice', name: 'Easy vegetable fried rice', category: 'Lunch', time: 20, servings: 2,
    difficulty: 'Easy', emoji: '🍚', art: 'mint', description: 'A useful way to turn leftover rice and vegetables into lunch.',
    ingredients: [{ name: 'Cooked rice', quantity: 2, unit: 'cups' }, { name: 'Carrot', quantity: 1, unit: 'piece' }, { name: 'Peas', quantity: 0.5, unit: 'cup' }, { name: 'Onion', quantity: 1, unit: 'piece' }, { name: 'Soy sauce', quantity: 1, unit: 'tbsp' }],
    steps: ['Chop the vegetables into small pieces.', 'Stir-fry onion, carrot and peas until just tender.', 'Add cooked rice and soy sauce. Toss on high heat for two minutes.']
  },
  {
    id: 'spinach-dal', name: 'Spinach dal', category: 'Dinner', time: 30, servings: 3,
    difficulty: 'Easy', emoji: '🥣', art: 'sage', description: 'Comforting lentils with a handful of greens stirred through.',
    ingredients: [{ name: 'Lentils', quantity: 1, unit: 'cup' }, { name: 'Spinach', quantity: 2, unit: 'cups' }, { name: 'Tomato', quantity: 1, unit: 'piece' }, { name: 'Onion', quantity: 1, unit: 'piece' }, { name: 'Garlic', quantity: 3, unit: 'cloves' }],
    steps: ['Rinse and cook the lentils until soft.', 'Cook onion, garlic and tomato in a little oil.', 'Add spinach and cooked lentils. Simmer for five minutes.']
  },
  {
    id: 'potato-chickpea-bowl', name: 'Potato & chickpea bowl', category: 'Lunch', time: 25, servings: 2,
    difficulty: 'Easy', emoji: '🥔', art: 'peach', description: 'A filling bowl made from pantry basics and fresh herbs.',
    ingredients: [{ name: 'Potatoes', quantity: 2, unit: 'pieces' }, { name: 'Chickpeas', quantity: 1, unit: 'cup' }, { name: 'Yogurt', quantity: 0.5, unit: 'cup' }, { name: 'Cucumber', quantity: 1, unit: 'piece' }, { name: 'Lemon', quantity: 1, unit: 'piece' }],
    steps: ['Boil or roast the potatoes until tender.', 'Mix chickpeas with lemon juice and a pinch of salt.', 'Serve with chopped cucumber and yogurt.']
  },
  {
    id: 'paneer-wrap', name: 'Paneer veggie wrap', category: 'Dinner', time: 18, servings: 2,
    difficulty: 'Easy', emoji: '🌯', art: 'coral', description: 'A quick wrap for the evenings when nobody wants a big cleanup.',
    ingredients: [{ name: 'Paneer', quantity: 200, unit: 'g' }, { name: 'Capsicum', quantity: 1, unit: 'piece' }, { name: 'Onion', quantity: 1, unit: 'piece' }, { name: 'Tortilla', quantity: 2, unit: 'pieces' }, { name: 'Yogurt', quantity: 2, unit: 'tbsp' }],
    steps: ['Slice paneer, capsicum and onion.', 'Cook everything in a pan with your preferred spices.', 'Fill warm tortillas, add yogurt and roll.']
  },
  {
    id: 'banana-oats', name: 'Banana breakfast oats', category: 'Breakfast', time: 8, servings: 1,
    difficulty: 'Easy', emoji: '🥣', art: 'yellow', description: 'A no-fuss breakfast that uses ripe bananas before they turn.',
    ingredients: [{ name: 'Banana', quantity: 1, unit: 'piece' }, { name: 'Oats', quantity: 0.5, unit: 'cup' }, { name: 'Milk', quantity: 1, unit: 'cup' }, { name: 'Peanuts', quantity: 1, unit: 'tbsp' }],
    steps: ['Warm milk in a small pan.', 'Stir in oats and cook until creamy.', 'Top with sliced banana and peanuts.']
  },
  {
    id: 'cucumber-raita', name: 'Cooling cucumber raita', category: 'Side', time: 7, servings: 2,
    difficulty: 'Easy', emoji: '🥒', art: 'mint', description: 'A cool side dish that takes only a few minutes.',
    ingredients: [{ name: 'Yogurt', quantity: 1, unit: 'cup' }, { name: 'Cucumber', quantity: 1, unit: 'piece' }, { name: 'Coriander', quantity: 2, unit: 'tbsp' }],
    steps: ['Grate or finely chop the cucumber.', 'Stir it into the yogurt.', 'Finish with coriander, salt and roasted cumin.']
  },
  {
    id: 'lemon-pasta', name: 'Lemony tomato pasta', category: 'Dinner', time: 22, servings: 2,
    difficulty: 'Easy', emoji: '🍝', art: 'pink', description: 'Bright, simple pasta with tomato and a little lemon.',
    ingredients: [{ name: 'Pasta', quantity: 180, unit: 'g' }, { name: 'Tomato', quantity: 2, unit: 'pieces' }, { name: 'Garlic', quantity: 2, unit: 'cloves' }, { name: 'Lemon', quantity: 0.5, unit: 'piece' }, { name: 'Butter', quantity: 1, unit: 'tbsp' }],
    steps: ['Cook pasta in salted water and save a little pasta water.', 'Cook garlic and chopped tomatoes in butter until soft.', 'Toss with pasta, lemon juice and a splash of pasta water.']
  }
];
