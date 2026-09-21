import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Recipe, RecipeIngredient, RecipeStep } from '../../types';
import {
  BookOpen,
  ChefHat,
  Flame,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Scale,
  DollarSign,
  Plus,
  Trash2,
  Edit3,
  X,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface KitchenRecipeBookProps {
  initialSelectedRecipeId?: string;
  onCloseCookMode?: () => void;
}

export const KitchenRecipeBook: React.FC<KitchenRecipeBookProps> = ({
  initialSelectedRecipeId,
}) => {
  const { recipes, addRecipe, deleteRecipe } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [cookMode, setCookMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [servingMultiplier, setServingMultiplier] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Timer states
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // New Recipe Modal
  const [isNewRecipeModalOpen, setIsNewRecipeModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Recipe['category']>('Maggi & Fast Bites');
  const [newSellingPrice, setNewSellingPrice] = useState<number>(100);
  const [newCostEstimate, setNewCostEstimate] = useState<number>(35);
  const [newPrepTime, setNewPrepTime] = useState<number>(2);
  const [newCookTime, setNewCookTime] = useState<number>(4);
  const [newCalories, setNewCalories] = useState<number>(300);
  const [newProtein, setNewProtein] = useState<number>(8);
  const [newIngredientsText, setNewIngredientsText] = useState(
    'Maggi Cake (1 pack)\nAmul Butter (20 g)\nProcessed Cheese (30 g)\nFiltered Water (210 ml)'
  );
  const [newStepsText, setNewStepsText] = useState(
    'Boil 210ml filtered water with butter (60s)\nAdd noodle cake and tastemaker (30s)\nCook on medium flame until saucy (120s)\nTop with grated cheese and serve hot'
  );

  // Auto-select if requested
  useEffect(() => {
    if (initialSelectedRecipeId) {
      const found = recipes.find(r => r.id === initialSelectedRecipeId || r.cafeItemId === initialSelectedRecipeId);
      if (found) {
        setActiveRecipe(found);
        setServingMultiplier(1);
      }
    }
  }, [initialSelectedRecipeId, recipes]);

  // Audio tone buzzer
  const playTimerBuzzer = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.65);
    } catch {
      // ignore
    }
  };

  // Timer countdown loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSecondsLeft !== null && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft(prev => {
          if (prev !== null && prev <= 1) {
            setIsTimerRunning(false);
            playTimerBuzzer();
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsLeft, soundEnabled]);

  const startStepTimer = (durationSeconds: number) => {
    setTimerSecondsLeft(durationSeconds);
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = (durationSeconds: number) => {
    setIsTimerRunning(false);
    setTimerSecondsLeft(durationSeconds);
  };

  const handleOpenCookMode = (recipe: Recipe) => {
    setActiveRecipe(recipe);
    setCookMode(true);
    setCurrentStepIndex(0);
    setCompletedSteps({});
    setTimerSecondsLeft(recipe.steps[0]?.durationSeconds || null);
    setIsTimerRunning(false);
  };

  const toggleStepCompleted = (index: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCreateNewRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Parse ingredients
    const parsedIngredients: RecipeIngredient[] = newIngredientsText
      .split('\n')
      .filter(l => l.trim().length > 0)
      .map((line) => {
        return {
          name: line.trim(),
          quantity: 1,
          unit: 'unit',
          costEstimate: Math.round(newCostEstimate / 3),
        };
      });

    // Parse steps
    const parsedSteps: RecipeStep[] = newStepsText
      .split('\n')
      .filter(l => l.trim().length > 0)
      .map((line, idx) => ({
        stepNumber: idx + 1,
        title: `Step ${idx + 1}`,
        instruction: line.trim(),
        durationSeconds: 60,
      }));

    addRecipe({
      cafeItemId: 'custom-' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      prepTimeMinutes: newPrepTime,
      cookTimeMinutes: newCookTime,
      defaultServings: 1,
      difficulty: 'Chef Special',
      costPerServing: newCostEstimate,
      sellingPrice: newSellingPrice,
      dietaryTag: '100% Vegetarian',
      calories: newCalories,
      proteinGrams: newProtein,
      carbsGrams: 40,
      fatGrams: 10,
      ingredients: parsedIngredients,
      steps: parsedSteps,
      chefSecrets: ['Freshly cooked on commercial induction for rapid heat retention.'],
      allergens: [],
      equipmentUsed: ['Commercial Induction Station'],
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    });

    setIsNewRecipeModalOpen(false);
    setNewTitle('');
  };

  const filteredRecipes = recipes.filter(r => {
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ingredients.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', name: 'All Recipes' },
    { id: 'Maggi & Fast Bites', name: 'Maggi & Bowls' },
    { id: 'Cold Coffees & Iced Brews', name: 'Cold Coffees' },
    { id: 'Hot Coffees & Kaapi', name: 'Hot Kaapi & Teas' },
    { id: 'Fresh Fruit Shakes', name: 'Alphonso Shakes' },
    { id: 'Courtside Bites', name: 'Quick Toasts' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/60 via-zinc-900 to-zinc-900 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-zinc-950 uppercase tracking-wider">
              KITCHEN COMMAND & SOPS
            </span>
            <span className="text-xs text-amber-300/80 font-mono">
              {recipes.length} Standard Operating Procedures
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <ChefHat className="w-6 h-6 text-amber-400" />
            <span>Artisanal Cafe Recipe Book & Costing</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Step-by-step master cooking procedures, portion scalers, food cost analysis, and interactive induction timers for kitchen staff and owners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewRecipeModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Recipe SOP</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -tranzinc-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search recipes, ingredients..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredRecipes.map(recipe => {
          const profit = recipe.sellingPrice - recipe.costPerServing;
          const profitMargin = Math.round((profit / recipe.sellingPrice) * 100);

          return (
            <div
              key={recipe.id}
              className="bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-lg transition flex flex-col group"
            >
              {/* Recipe Image & Top Overlays */}
              <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

                {/* Difficulty & Category */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-zinc-900/90 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
                    {recipe.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                    {recipe.dietaryTag}
                  </span>
                </div>

                {/* Margin Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-500 text-zinc-950 shadow-md flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{profitMargin}% Margin</span>
                  </span>
                </div>

                {/* Bottom title inside image */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-base font-black text-white leading-tight drop-shadow-sm">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-300 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins total</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span>{recipe.calories} kcal</span>
                    </span>
                    <span>•</span>
                    <span>{recipe.proteinGrams}g protein</span>
                  </div>
                </div>
              </div>

              {/* Recipe Body Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                {/* Costing breakdown */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Food Cost</span>
                    <span className="text-xs font-black text-amber-300">₹{recipe.costPerServing}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Sell Price</span>
                    <span className="text-xs font-black text-white">₹{recipe.sellingPrice}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Net Profit</span>
                    <span className="text-xs font-black text-emerald-400">+₹{profit}</span>
                  </div>
                </div>

                {/* Key Ingredients snippet */}
                <div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Core Ingredients ({recipe.ingredients.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.ingredients.slice(0, 4).map((ing, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                      >
                        {ing.name} ({ing.quantity} {ing.unit})
                      </span>
                    ))}
                    {recipe.ingredients.length > 4 && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded text-zinc-500">
                        +{recipe.ingredients.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Steps count & Chef secret preview */}
                <div className="text-xs text-zinc-400 bg-amber-950/20 border border-amber-500/20 p-2.5 rounded-xl flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="line-clamp-2 text-[11px] text-zinc-300">
                    <strong className="text-amber-300">Chef Secret:</strong> {recipe.chefSecrets[0] || 'Prepared with precision on commercial wok.'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/80">
                  <button
                    onClick={() => handleOpenCookMode(recipe)}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Cook Mode</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveRecipe(recipe);
                      setCookMode(false);
                      setServingMultiplier(1);
                    }}
                    className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition"
                  >
                    View SOP
                  </button>

                  <button
                    onClick={() => deleteRecipe(recipe.id)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-950/40 border border-zinc-800 transition"
                    title="Delete Recipe"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail / SOP / Cook Mode Modal */}
      {activeRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[92vh] rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {activeRecipe.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activeRecipe.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Selling Price: ₹{activeRecipe.sellingPrice} • Food Cost: ₹{activeRecipe.costPerServing} ({Math.round(((activeRecipe.sellingPrice - activeRecipe.costPerServing) / activeRecipe.sellingPrice) * 100)}% Margin)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mode toggle */}
                <button
                  onClick={() => setCookMode(!cookMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                    cookMode
                      ? 'bg-amber-500 text-zinc-950 border-amber-400'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{cookMode ? 'Cook Mode: Active' : 'Switch to Cook Mode'}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveRecipe(null);
                    setCookMode(false);
                    stopTimer();
                  }}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Serving Scaler Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-zinc-300">Portion Scaler:</span>
                  <span className="text-xs text-zinc-500">Scale ingredient quantities for table orders or mixer rushes:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 4, 8].map(mult => (
                    <button
                      key={mult}
                      onClick={() => setServingMultiplier(mult)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                        servingMultiplier === mult
                          ? 'bg-amber-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {mult}x Portion{mult > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cook Mode Stopwatch & Audio Alert Banner (When Cook Mode is Active) */}
              {cookMode && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-zinc-900 to-zinc-900 border-2 border-amber-500/50 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                      <span className="text-sm font-black text-white">
                        Induction Step Timer (Step {currentStepIndex + 1} of {activeRecipe.steps.length})
                      </span>
                    </div>

                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="text-xs text-zinc-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
                      <span>{soundEnabled ? 'Buzzer On' : 'Muted'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400">
                        {timerSecondsLeft !== null
                          ? `${Math.floor(timerSecondsLeft / 60)}:${(timerSecondsLeft % 60).toString().padStart(2, '0')}`
                          : '--:--'}
                      </div>
                      <span className="text-xs text-zinc-400">
                        {isTimerRunning ? '🔥 Timer running on Induction...' : 'Timer paused / ready'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isTimerRunning ? (
                        <button
                          onClick={stopTimer}
                          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black shadow transition"
                        >
                          Pause Timer
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (timerSecondsLeft === null || timerSecondsLeft === 0) {
                              startStepTimer(activeRecipe.steps[currentStepIndex]?.durationSeconds || 60);
                            } else {
                              setIsTimerRunning(true);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black shadow transition flex items-center gap-1.5"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Start Timer</span>
                        </button>
                      )}

                      <button
                        onClick={() => resetTimer(activeRecipe.steps[currentStepIndex]?.durationSeconds || 60)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700"
                        title="Reset Timer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Scaled Ingredients Table */}
              <div>
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Ingredient Checklist (Scaled for {servingMultiplier}x):</span>
                  <span className="text-amber-400 font-mono text-xs">
                    Estimated Batch Cost: ₹{activeRecipe.costPerServing * servingMultiplier}
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeRecipe.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="font-semibold text-zinc-200">{ing.name}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {ing.quantity * servingMultiplier} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step by Step Cooking SOP */}
              <div>
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
                  Step-by-Step Cooking Procedures ({activeRecipe.steps.length} Steps):
                </h4>
                <div className="space-y-3">
                  {activeRecipe.steps.map((step, idx) => {
                    const isDone = completedSteps[idx];
                    const isCurrent = cookMode && currentStepIndex === idx;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (cookMode) {
                            setCurrentStepIndex(idx);
                            if (step.durationSeconds) {
                              setTimerSecondsLeft(step.durationSeconds);
                              setIsTimerRunning(false);
                            }
                          }
                        }}
                        className={`p-4 rounded-xl border transition cursor-pointer ${
                          isCurrent
                            ? 'bg-amber-950/30 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                            : isDone
                            ? 'bg-zinc-950/40 border-emerald-500/30 opacity-75'
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStepCompleted(idx);
                              }}
                              className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                                isDone
                                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                                  : 'border-zinc-700 text-transparent hover:border-zinc-500'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                            </button>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-amber-400 uppercase">
                                  Step {step.stepNumber}: {step.title}
                                </span>
                                {step.durationSeconds && (
                                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                                    ⏱️ {step.durationSeconds}s
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-zinc-200 mt-1 leading-relaxed">
                                {step.instruction}
                              </p>
                              {step.tip && (
                                <p className="text-[11px] text-amber-300/90 mt-1.5 italic bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                                  💡 <strong>Pro-Tip:</strong> {step.tip}
                                </p>
                              )}
                            </div>
                          </div>

                          {step.durationSeconds && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentStepIndex(idx);
                                startStepTimer(step.durationSeconds!);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-amber-400 text-xs font-bold border border-zinc-700 transition whitespace-nowrap flex items-center gap-1"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>{step.durationSeconds}s</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chef Secrets & Equipment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Club Secret Notes:</span>
                  </span>
                  <ul className="text-xs text-zinc-300 space-y-1.5 list-disc list-inside">
                    {activeRecipe.chefSecrets.map((sec, i) => (
                      <li key={i} className="leading-relaxed">{sec}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">
                    Commercial Equipment:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeRecipe.equipmentUsed.map((eq, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>

                  {activeRecipe.allergens.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1">
                        Allergen Warning:
                      </span>
                      <span className="text-xs text-red-300">
                        Contains {activeRecipe.allergens.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Recipe Modal */}
      {isNewRecipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsNewRecipeModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Create Kitchen SOP & Recipe</h3>
                <p className="text-xs text-zinc-400">Add standard operating procedure for kitchen staff</p>
              </div>
            </div>

            <form onSubmit={handleCreateNewRecipe} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Recipe / Item Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Double Schezwan Cheese Maggi"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as Recipe['category'])}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Maggi & Fast Bites">Maggi & Fast Bites</option>
                    <option value="Cold Coffees & Iced Brews">Cold Coffees & Iced Brews</option>
                    <option value="Hot Coffees & Kaapi">Hot Coffees & Kaapi</option>
                    <option value="Fresh Fruit Shakes">Fresh Fruit Shakes</option>
                    <option value="Courtside Bites">Courtside Bites</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={newSellingPrice}
                    onChange={e => setNewSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Est. Cost (₹)</label>
                  <input
                    type="number"
                    value={newCostEstimate}
                    onChange={e => setNewCostEstimate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Prep (Mins)</label>
                  <input
                    type="number"
                    value={newPrepTime}
                    onChange={e => setNewPrepTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Cook (Mins)</label>
                  <input
                    type="number"
                    value={newCookTime}
                    onChange={e => setNewCookTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Ingredients (One per line)
                </label>
                <textarea
                  rows={3}
                  value={newIngredientsText}
                  onChange={e => setNewIngredientsText(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 font-mono"
                  placeholder="Maggi Cake (1 pack)&#10;Amul Butter (20 g)"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Step-by-Step Instructions (One per line)
                </label>
                <textarea
                  rows={3}
                  value={newStepsText}
                  onChange={e => setNewStepsText(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 font-mono"
                  placeholder="Boil water&#10;Cook noodles for 3 mins&#10;Top with cheese"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewRecipeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black shadow-lg"
                >
                  Save to Recipe Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
