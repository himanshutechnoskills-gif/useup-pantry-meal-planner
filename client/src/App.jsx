import { useEffect, useState } from 'react';
import { apiRequest, formatShortDate, getDateString } from './api.js';

const navigation = [
  { id: 'home', label: 'Overview', icon: '⌂' },
  { id: 'pantry', label: 'My pantry', icon: '▦' },
  { id: 'recipes', label: 'Find a meal', icon: '♨' },
  { id: 'planner', label: 'Meal planner', icon: '▤' },
  { id: 'shopping', label: 'Shopping list', icon: '☷' }
];

const emptyPantryForm = {
  name: '', category: 'Vegetables', quantity: '1', unit: 'pieces',
  expiryDate: '', location: 'Fridge'
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function App() {
  const [activePage, setActivePage] = useState('home');
  const [pantry, setPantry] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [shopping, setShopping] = useState([]);
  const [mealPlan, setMealPlan] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [showPantryForm, setShowPantryForm] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  async function loadData() {
    try {
      setError('');
      const [pantryData, recipeData, shoppingData, mealData, dashboardData] = await Promise.all([
        apiRequest('/pantry'),
        apiRequest('/recipes'),
        apiRequest('/shopping'),
        apiRequest('/meal-plan'),
        apiRequest('/dashboard')
      ]);
      setPantry(pantryData);
      setRecipes(recipeData);
      setShopping(shoppingData);
      setMealPlan(mealData);
      setDashboard(dashboardData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Toasts give feedback after an action without interrupting the user's flow.
  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  async function runAction(action, successMessage) {
    try {
      await action();
      await loadData();
      if (successMessage) notify(successMessage);
      return true;
    } catch (requestError) {
      notify(requestError.message);
      return false;
    }
  }

  async function addPantryItem(formValues) {
    const saved = await runAction(() => apiRequest('/pantry', {
      method: 'POST', body: JSON.stringify(formValues)
    }), `${formValues.name} added to your pantry.`);

    // Keep the form open when the API rejects the new ingredient.
    if (saved) setShowPantryForm(false);
    return saved;
  }

  async function changePantryQuantity(item, amount) {
    const nextQuantity = Math.max(0, Number(item.quantity) + amount);
    await runAction(() => apiRequest(`/pantry/${item.id}`, {
      method: 'PATCH', body: JSON.stringify({ quantity: nextQuantity })
    }));
  }

  async function removePantryItem(item) {
    await runAction(() => apiRequest(`/pantry/${item.id}`, { method: 'DELETE' }), `${item.name} removed.`);
  }

  async function addShoppingItem(item) {
    await runAction(() => apiRequest('/shopping', {
      method: 'POST', body: JSON.stringify(item)
    }), `${item.name} added to your list.`);
  }

  async function toggleShoppingItem(item) {
    await runAction(() => apiRequest(`/shopping/${item.id}`, {
      method: 'PATCH', body: JSON.stringify({ checked: !item.checked })
    }));
  }

  async function removeShoppingItem(item) {
    await runAction(() => apiRequest(`/shopping/${item.id}`, { method: 'DELETE' }));
  }

  async function addMissingIngredients(recipe) {
    try {
      const result = await apiRequest(`/recipes/${recipe.id}/add-missing`, { method: 'POST' });
      await loadData();
      notify(result.message);
    } catch (requestError) {
      notify(requestError.message);
    }
  }

  async function cookRecipe(recipe) {
    try {
      const result = await apiRequest(`/recipes/${recipe.id}/cook`, { method: 'POST' });
      await loadData();
      setSelectedRecipe(null);
      notify(result.message);
    } catch (requestError) {
      notify(requestError.message);
    }
  }

  async function saveMeal(date, recipeId) {
    const recipe = recipes.find((item) => item.id === recipeId);
    if (!recipe) return;
    await runAction(() => apiRequest(`/meal-plan/${date}`, {
      method: 'PUT', body: JSON.stringify({ recipeId, slot: 'Dinner' })
    }), `${recipe.name} planned for ${formatShortDate(date)}.`);
  }

  async function removeMeal(meal) {
    await runAction(() => apiRequest(`/meal-plan/${meal.id}`, { method: 'DELETE' }), 'Meal removed from your plan.');
  }

  const pageTitle = navigation.find((item) => item.id === activePage)?.label || 'Overview';

  if (loading) {
    return <div className="loading-screen"><div className="brand-mark">u.</div><p>Setting the table...</p></div>;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setActivePage('home')} aria-label="Go to overview">
          <span className="brand-mark">u.</span>
          <span>useup<span className="brand-period">.</span></span>
        </button>

        <div className="side-label">YOUR KITCHEN</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <button key={item.id} className={`nav-link ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === 'shopping' && shopping.filter((entry) => !entry.checked).length > 0 && (
                <span className="nav-count">{shopping.filter((entry) => !entry.checked).length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="leaf-doodle">✳</div>
          <p className="sidebar-quote">A little less waste. A little more good food.</p>
          <span className="sidebar-note">YOUR KITCHEN, IN GOOD SHAPE</span>
        </div>
        <div className="profile-row">
          <div className="profile-avatar">K</div>
          <div><strong>Kitchen home</strong><span>Personal space</span></div>
          <span className="profile-dots">···</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">u.</span> useup.</div>
          <div className="breadcrumb">Your kitchen <span>/</span> <strong>{pageTitle}</strong></div>
          <div className="topbar-right">
            <span className="today-label">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            <div className="top-avatar">K</div>
          </div>
        </header>

        {error && <div className="error-banner">Couldn't load your kitchen: {error} <button onClick={loadData}>Try again</button></div>}

        {activePage === 'home' && (
          <DashboardPage
            dashboard={dashboard} pantry={pantry} recipes={recipes} shopping={shopping} mealPlan={mealPlan}
            onNavigate={setActivePage} onAddPantry={() => setShowPantryForm(true)}
            onOpenRecipe={setSelectedRecipe} onAddMissing={addMissingIngredients}
          />
        )}
        {activePage === 'pantry' && (
          <PantryPage pantry={pantry} search={search} setSearch={setSearch} categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter} onAdd={() => setShowPantryForm(true)}
            onChangeQuantity={changePantryQuantity} onRemove={removePantryItem}
          />
        )}
        {activePage === 'recipes' && (
          <RecipesPage recipes={recipes} search={search} setSearch={setSearch}
            onOpenRecipe={setSelectedRecipe} onAddMissing={addMissingIngredients}
          />
        )}
        {activePage === 'planner' && (
          <PlannerPage mealPlan={mealPlan} recipes={recipes} onSave={saveMeal} onRemove={removeMeal} />
        )}
        {activePage === 'shopping' && (
          <ShoppingPage shopping={shopping} onAdd={addShoppingItem} onToggle={toggleShoppingItem} onRemove={removeShoppingItem} />
        )}
      </main>

      {showPantryForm && <PantryModal onClose={() => setShowPantryForm(false)} onSave={addPantryItem} />}
      {selectedRecipe && <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} onCook={cookRecipe} onAddMissing={addMissingIngredients} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>
      {action}
    </div>
  );
}

function DashboardPage({ dashboard, pantry, recipes, shopping, mealPlan, onNavigate, onAddPantry, onOpenRecipe, onAddMissing }) {
  const expiring = dashboard?.expiringItems || [];
  const bestRecipe = recipes[0];
  const openShopping = shopping.filter((item) => !item.checked).length;

  return (
    <div className="page-content">
      <PageHeading eyebrow="A FRESH LOOK AT YOUR KITCHEN" title={`${getGreeting()}, home cook.`} description="Here's what's happening in your kitchen today."
        action={<button className="button button-dark" onClick={onAddPantry}><span>＋</span> Add an item</button>} />

      <section className="welcome-strip">
        <div className="welcome-copy"><span className="tiny-kicker">A GOOD PLACE TO START</span><h2>Use what you have.<br /><em>Love what you make.</em></h2><p>A few small kitchen habits can make the week feel a whole lot easier.</p>
          <button className="text-button" onClick={() => onNavigate('recipes')}>Find something to cook <span>↗</span></button>
        </div>
        <div className="welcome-art"><div className="art-sun"></div><div className="art-plate"><span>🥑</span></div><div className="art-tomato">🍅</div><div className="art-leaf">✳</div><span className="art-caption">GOOD FOOD, NO FUSS</span></div>
      </section>

      <section className="stats-grid">
        <StatCard label="IN YOUR PANTRY" value={pantry.length} detail="things on your shelf" icon="▦" tone="cream" />
        <StatCard label="USE SOON" value={expiring.length} detail="items need a little love" icon="◷" tone="rose" />
        <StatCard label="ON YOUR LIST" value={openShopping} detail="things to pick up" icon="☷" tone="green" />
        <StatCard label="MEALS PLANNED" value={dashboard?.stats?.plannedMeals || 0} detail="ready for the week" icon="▤" tone="blue" />
      </section>

      <div className="section-grid dashboard-grid">
        <section className="panel expiring-panel">
          <div className="panel-heading"><div><div className="eyebrow">A LITTLE HEADS-UP</div><h3>Use these first</h3></div><span className="round-icon">◷</span></div>
          {expiring.length === 0 ? <div className="empty-state compact"><span>🌿</span><p>Nothing urgent. Your pantry is looking good.</p></div> : (
            <div className="expiring-list">
              {expiring.slice(0, 4).map((item) => <div className="expiring-item" key={item.id}>
                <div className="ingredient-dot">{getFoodEmoji(item.name)}</div>
                <div className="expiring-name"><strong>{item.name}</strong><span>{item.quantity} {item.unit} · {item.location}</span></div>
                <span className={`expiry-pill ${item.daysLeft <= 1 ? 'urgent' : ''}`}>{item.daysLeft < 0 ? 'Past date' : item.daysLeft === 0 ? 'Today' : item.daysLeft === 1 ? 'Tomorrow' : `${item.daysLeft} days`}</span>
              </div>)}
            </div>
          )}
          <button className="panel-link" onClick={() => onNavigate('pantry')}>See all pantry items <span>→</span></button>
        </section>

        <section className="panel dinner-panel">
          <div className="panel-heading"><div><div className="eyebrow">TONIGHT, MAYBE?</div><h3>A little dinner inspiration</h3></div><span className="round-icon">✳</span></div>
          {bestRecipe ? <>
            <div className={`dinner-art art-${bestRecipe.art}`}><span>{bestRecipe.emoji}</span><small>MADE WITH WHAT YOU HAVE</small></div>
            <div className="dinner-info"><div><h4>{bestRecipe.name}</h4><p>{bestRecipe.matchedCount} of {bestRecipe.ingredients.length} ingredients already at home · {bestRecipe.time} min</p></div><button className="circle-arrow" onClick={() => onOpenRecipe(bestRecipe)} aria-label="View recipe">↗</button></div>
            {bestRecipe.missingCount > 0 && <button className="panel-link" onClick={() => onAddMissing(bestRecipe)}>Add {bestRecipe.missingCount} missing ingredients <span>→</span></button>}
          </> : <div className="empty-state"><span>🍲</span><p>Add a few pantry items to get meal suggestions.</p></div>}
        </section>
      </div>

      <section className="panel week-preview">
        <div className="panel-heading"><div><div className="eyebrow">KEEP IT SIMPLE</div><h3>Your kitchen, this week</h3></div><button className="panel-link no-border" onClick={() => onNavigate('planner')}>Open meal planner <span>→</span></button></div>
        <div className="week-days">
          {Array.from({ length: 5 }, (_, index) => {
            const date = new Date(); date.setDate(date.getDate() + index);
            const dateString = getDateString(date);
            const otherPlan = mealPlan.find((item) => item.date === dateString && item.slot === 'Dinner') || null;
            return <div className={`week-day ${index === 0 ? 'today' : ''}`} key={dateString}>
              <span>{index === 0 ? 'TODAY' : date.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase()}</span>
              <strong>{date.getDate()}</strong>
              <small>{otherPlan?.recipeName || 'Plan a meal'}</small>
            </div>;
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, detail, icon, tone }) {
  return <div className={`stat-card tone-${tone}`}><div className="stat-top"><span>{label}</span><span className="stat-icon">{icon}</span></div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div></div>;
}

function PantryPage({ pantry, search, setSearch, categoryFilter, setCategoryFilter, onAdd, onChangeQuantity, onRemove }) {
  const categories = ['All', ...new Set(pantry.map((item) => item.category))];
  const filtered = pantry.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) && (categoryFilter === 'All' || item.category === categoryFilter));

  return <div className="page-content">
    <PageHeading eyebrow="KNOW WHAT YOU HAVE" title="My pantry" description="A little inventory goes a long way. Keep tabs on the good stuff." action={<button className="button button-dark" onClick={onAdd}>＋ Add an item</button>} />
    <div className="toolbar"><label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find an ingredient..." /></label><div className="filter-pills">{categories.map((category) => <button key={category} className={categoryFilter === category ? 'selected' : ''} onClick={() => setCategoryFilter(category)}>{category}</button>)}</div></div>
    {filtered.length === 0 ? <EmptyPanel title="Nothing here just yet" text="Add an ingredient or try a different search." emoji="🥬" /> : <div className="pantry-grid">{filtered.map((item) => <div className="pantry-card" key={item.id}>
      <div className="pantry-card-top"><span className="food-emoji">{getFoodEmoji(item.name)}</span><button className="more-button" onClick={() => onRemove(item)} title="Remove item">×</button></div>
      <h3>{item.name}</h3><p>{item.category} · {item.location}</p>
      <div className="quantity-row"><div className="quantity-control"><button onClick={() => onChangeQuantity(item, -1)} aria-label={`Decrease ${item.name}`}>−</button><strong>{item.quantity} <small>{item.unit}</small></strong><button onClick={() => onChangeQuantity(item, 1)} aria-label={`Increase ${item.name}`}>＋</button></div>
        <span className="date-note">{item.expiryDate ? `Best by ${formatShortDate(item.expiryDate)}` : 'No expiry set'}</span></div>
    </div>)}</div>}
    <div className="small-note">Tip: quantities are updated when you mark a recipe as cooked. We only subtract ingredients when the units match.</div>
  </div>;
}

function RecipesPage({ recipes, search, setSearch, onOpenRecipe, onAddMissing }) {
  const [mealFilter, setMealFilter] = useState('All');
  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Side'];
  const filtered = recipes.filter((recipe) => recipe.name.toLowerCase().includes(search.toLowerCase()) && (mealFilter === 'All' || recipe.category === mealFilter));

  return <div className="page-content">
    <PageHeading eyebrow="THE WHAT'S-FOR-DINNER QUESTION" title="Find a meal" description="Simple ideas, starting with ingredients already in your kitchen." />
    <div className="recipe-intro"><span className="recipe-intro-icon">✳</span><div><strong>Cook from your pantry</strong><p>Recipes are sorted by how many ingredients you already have.</p></div></div>
    <div className="toolbar recipe-toolbar"><label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search a meal..." /></label><div className="filter-pills">{categories.map((category) => <button key={category} className={mealFilter === category ? 'selected' : ''} onClick={() => setMealFilter(category)}>{category}</button>)}</div></div>
    <div className="recipe-grid">{filtered.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} onOpen={() => onOpenRecipe(recipe)} onAddMissing={() => onAddMissing(recipe)} />)}</div>
    {filtered.length === 0 && <EmptyPanel title="No recipes found" text="Try another name or meal type." emoji="🍋" />}
  </div>;
}

function RecipeCard({ recipe, onOpen, onAddMissing }) {
  return <article className="recipe-card">
    <button className={`recipe-art art-${recipe.art}`} onClick={onOpen} aria-label={`Open ${recipe.name}`}><span>{recipe.emoji}</span><small>{recipe.category.toUpperCase()}</small></button>
    <div className="recipe-card-body"><div className="recipe-meta"><span>◷ {recipe.time} min</span><span>{recipe.difficulty}</span></div><h3>{recipe.name}</h3><p>{recipe.description}</p>
      <div className="match-row"><div className="match-track"><span style={{ width: `${recipe.matchScore}%` }}></span></div><strong>{recipe.matchedCount}/{recipe.ingredients.length} at home</strong></div>
      <div className="recipe-actions"><button className="button button-outline" onClick={onOpen}>View recipe</button>{recipe.missingCount > 0 && <button className="mini-add" onClick={onAddMissing} title="Add missing ingredients">＋ List missing</button>}</div>
    </div>
  </article>;
}

function PlannerPage({ mealPlan, recipes, onSave, onRemove }) {
  const [choices, setChoices] = useState({});
  const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() + index); return date; });

  return <div className="page-content">
    <PageHeading eyebrow="A LITTLE PLAN, A LOT LESS STRESS" title="Meal planner" description="Pick a dinner for the next few days. You can change your mind anytime." />
    <div className="planner-tip"><span>✳</span><p><strong>Keep it flexible.</strong> A plan is just a helpful starting point, not another thing to worry about.</p></div>
    <div className="planner-list">{days.map((date) => {
      const dateString = getDateString(date);
      const planned = mealPlan.find((item) => item.date === dateString && item.slot === 'Dinner');
      const choice = choices[dateString] || planned?.recipeId || '';
      const recipe = recipes.find((item) => item.id === planned?.recipeId);
      return <div className={`planner-day ${dateString === getDateString(new Date()) ? 'is-today' : ''}`} key={dateString}>
        <div className="planner-date"><span>{date.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase()}</span><strong>{date.getDate()}</strong><small>{date.toLocaleDateString('en-IN', { month: 'short' })}</small></div>
        <div className="planner-meal"><div className="planner-meal-icon">{recipe?.emoji || '🍽️'}</div><div><span>DINNER</span><strong>{planned?.recipeName || 'Nothing planned yet'}</strong><small>{planned ? 'A plan is in place' : 'Choose something simple'}</small></div></div>
        <div className="planner-controls"><select value={choice} onChange={(event) => setChoices((old) => ({ ...old, [dateString]: event.target.value }))}><option value="">Choose a meal</option>{recipes.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select><button className="button button-dark small-button" disabled={!choice} onClick={() => onSave(dateString, choice)}>Save</button>{planned && <button className="icon-delete" onClick={() => onRemove(planned)} aria-label="Remove planned meal">×</button>}</div>
      </div>;
    })}</div>
  </div>;
}

function ShoppingPage({ shopping, onAdd, onToggle, onRemove }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const openItems = shopping.filter((item) => !item.checked);
  const doneItems = shopping.filter((item) => item.checked);

  async function submit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    const saved = await onAdd({ name: name.trim(), quantity: quantity.trim() || '1', category: 'Other' });
    // Keep the entered values if the server could not save the item.
    if (saved) {
      setName('');
      setQuantity('1');
    }
  }

  return <div className="page-content">
    <PageHeading eyebrow="A MORE THOUGHTFUL SHOP" title="Shopping list" description="Keep the little things in one place. No more trying to remember in the aisle." />
    <form className="add-shopping-form" onSubmit={submit}><input value={name} onChange={(event) => setName(event.target.value)} placeholder="What do you need?" aria-label="Shopping item name" /><input className="quantity-input" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="Quantity" aria-label="Quantity" /><button className="button button-dark" type="submit">＋ Add to list</button></form>
    <div className="shopping-columns"><section className="panel shopping-panel"><div className="panel-heading"><div><div className="eyebrow">READY TO PICK UP</div><h3>To buy <span className="count-bubble">{openItems.length}</span></h3></div><span className="round-icon">☷</span></div>
      {openItems.length === 0 ? <div className="empty-state compact"><span>🧺</span><p>Your list is clear. Nice work.</p></div> : openItems.map((item) => <ShoppingRow key={item.id} item={item} onToggle={onToggle} onRemove={onRemove} />)}
    </section><section className="panel shopping-panel done-panel"><div className="panel-heading"><div><div className="eyebrow">ALREADY SORTED</div><h3>Picked up <span className="count-bubble muted">{doneItems.length}</span></h3></div><span className="round-icon">✓</span></div>
      {doneItems.length === 0 ? <div className="empty-state compact"><span>🌱</span><p>Tick things off as you shop.</p></div> : doneItems.map((item) => <ShoppingRow key={item.id} item={item} onToggle={onToggle} onRemove={onRemove} />)}
    </section></div>
  </div>;
}

function ShoppingRow({ item, onToggle, onRemove }) {
  return <div className={`shopping-row ${item.checked ? 'checked' : ''}`}><button className="check-button" onClick={() => onToggle(item)} aria-label={item.checked ? 'Mark as not purchased' : 'Mark as purchased'}>{item.checked ? '✓' : ''}</button><div className="shopping-item-name"><strong>{item.name}</strong><span>{item.quantity}{item.source !== 'manual' ? ' · from a recipe' : ''}</span></div><button className="remove-shopping" onClick={() => onRemove(item)} aria-label={`Remove ${item.name}`}>×</button></div>;
}

function PantryModal({ onClose, onSave }) {
  const [form, setForm] = useState(emptyPantryForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  function updateField(event) {
    setForm((old) => ({ ...old, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.name.trim()) { setFormError('Please enter an ingredient name.'); return; }
    if (!form.unit.trim()) { setFormError('Please enter a measurement unit.'); return; }
    if (form.quantity === '' || !Number.isFinite(Number(form.quantity)) || Number(form.quantity) < 0) {
      setFormError('Enter a valid quantity of zero or greater.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const saved = await onSave({ ...form, quantity: Number(form.quantity), expiryDate: form.expiryDate || null });
      if (!saved) setFormError('The ingredient could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="modal-card form-modal" role="dialog" aria-modal="true" aria-labelledby="pantry-modal-title">
    <div className="modal-heading"><div><div className="eyebrow">MAKE A NOTE OF IT</div><h2 id="pantry-modal-title">Add to your pantry</h2></div><button className="modal-close" onClick={onClose}>×</button></div>
    <form onSubmit={submit} className="modal-form"><label>Ingredient name<input autoFocus name="name" value={form.name} onChange={updateField} placeholder="e.g. Green capsicum" /></label>
      <div className="form-two"><label>Category<select name="category" value={form.category} onChange={updateField}><option>Vegetables</option><option>Fruit</option><option>Dairy & eggs</option><option>Grains & pulses</option><option>Bakery</option><option>Meat & seafood</option><option>Other</option></select></label><label>Quantity<input type="number" min="0" step="0.1" name="quantity" value={form.quantity} onChange={updateField} /></label></div>
      <div className="form-two"><label>Unit<input name="unit" value={form.unit} onChange={updateField} placeholder="pieces, g, cups..." /></label><label>Best before<input type="date" name="expiryDate" value={form.expiryDate} onChange={updateField} /></label></div>
      <label>Where do you keep it?<select name="location" value={form.location} onChange={updateField}><option>Fridge</option><option>Freezer</option><option>Pantry</option><option>Counter</option></select></label>
      {formError && <p className="form-error">{formError}</p>}
      <div className="modal-actions"><button type="button" className="button button-outline" onClick={onClose}>Cancel</button><button type="submit" className="button button-dark" disabled={saving}>{saving ? 'Saving...' : 'Save ingredient'}</button></div>
    </form>
  </div></div>;
}

function RecipeModal({ recipe, onClose, onCook, onAddMissing }) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="modal-card recipe-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-modal-title">
    <div className={`modal-recipe-art art-${recipe.art}`}><span>{recipe.emoji}</span><button className="modal-close on-art" onClick={onClose}>×</button></div>
    <div className="recipe-modal-content"><div className="eyebrow">{recipe.category.toUpperCase()} · {recipe.time} MINUTES · {recipe.servings} SERVINGS</div><h2 id="recipe-modal-title">{recipe.name}</h2><p className="modal-description">{recipe.description}</p>
      <div className="recipe-modal-columns"><section><h3>What you'll need</h3>{recipe.ingredients.map((ingredient) => <div className="ingredient-line" key={ingredient.name}><span>{getFoodEmoji(ingredient.name)}</span><span>{ingredient.name}</span><strong>{ingredient.quantity} {ingredient.unit}</strong></div>)}</section><section><h3>Let's make it</h3><ol className="steps-list">{recipe.steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol></section></div>
      <div className="modal-actions recipe-modal-actions"><button className="button button-outline" onClick={() => onAddMissing(recipe)}>＋ Add missing ingredients</button><button className="button button-dark" onClick={() => onCook(recipe)}>I cooked this ✓</button></div>
      <p className="modal-footnote">When you mark a meal as cooked, matching pantry quantities are reduced where the measurement units make sense.</p>
    </div>
  </div></div>;
}

function EmptyPanel({ title, text, emoji }) {
  return <div className="empty-panel"><span>{emoji}</span><h3>{title}</h3><p>{text}</p></div>;
}

function getFoodEmoji(name = '') {
  const key = name.toLowerCase();
  if (key.includes('tomato')) return '🍅';
  if (key.includes('egg')) return '🥚';
  if (key.includes('milk')) return '🥛';
  if (key.includes('onion')) return '🧅';
  if (key.includes('spinach')) return '🥬';
  if (key.includes('bread')) return '🍞';
  if (key.includes('potato')) return '🥔';
  if (key.includes('yogurt')) return '🥣';
  if (key.includes('lentil')) return '🫘';
  if (key.includes('garlic')) return '🧄';
  if (key.includes('banana')) return '🍌';
  if (key.includes('carrot')) return '🥕';
  if (key.includes('pea')) return '🫛';
  if (key.includes('chickpea')) return '🫘';
  if (key.includes('cucumber')) return '🥒';
  if (key.includes('paneer')) return '🧀';
  if (key.includes('capsicum')) return '🫑';
  if (key.includes('lemon')) return '🍋';
  if (key.includes('pasta')) return '🍝';
  if (key.includes('rice')) return '🍚';
  if (key.includes('oat')) return '🥣';
  return '🥬';
}

export default App;
