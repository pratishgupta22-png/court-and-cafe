import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CafeItem } from '../../types';
import {
  Search,
  Plus,
  Flame,
  Zap,
  Coffee,
  X,
  Check,
  ShoppingBag,
  Sparkles,
  Droplets,
} from 'lucide-react';

export const CafeMenuView: React.FC = () => {
  const { cafeItems, addToCart, setIsCartOpen, cart } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemForModal, setSelectedItemForModal] = useState<CafeItem | null>(null);

  // Customization modal options state
  const [customMilk, setCustomMilk] = useState<string>('');
  const [customProtein, setCustomProtein] = useState<string>('');
  const [customIce, setCustomIce] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const categories = useMemo(() => {
    const list = [
      'All',
      'Chilled Soft Drinks & MRP',
      'Hydration & Coolers',
      'Courtside Snacks',
      'Fresh Stone-Baked Pizzas',
      'Maggi & Fast Bites',
      'Smoothies & Shakes',
    ];
    cafeItems.forEach(item => {
      if (item.category && !list.includes(item.category)) {
        list.push(item.category);
      }
    });
    return list;
  }, [cafeItems]);

  const filteredItems = useMemo(() => {
    return cafeItems.filter(item => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [cafeItems, activeCategory, searchQuery]);

  const waterBottleItem = useMemo(() => {
    return cafeItems.find(i => i.id === 'drink-water-bottle-20');
  }, [cafeItems]);

  const itemHasOptions = (item: CafeItem): boolean => {
    if (!item.options) return false;
    return Boolean(
      (item.options.milk && item.options.milk.length > 0) ||
      (item.options.proteinBoost && item.options.proteinBoost.length > 0) ||
      (item.options.iceLevel && item.options.iceLevel.length > 0) ||
      (item.options.sugarLevel && item.options.sugarLevel.length > 0) ||
      (item.options.crust && item.options.crust.length > 0)
    );
  };

  const openCustomizeModal = (item: CafeItem) => {
    // If item has no configurable options, add directly!
    if (!itemHasOptions(item)) {
      addToCart(item, 1);
      return;
    }

    setSelectedItemForModal(item);
    setCustomMilk(item.options?.milk?.[0] || '');
    setCustomProtein(item.options?.proteinBoost?.[0] || '');
    setCustomIce(item.options?.iceLevel?.[0] || '');
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedItemForModal) return;
    addToCart(selectedItemForModal, quantity, {
      milk: customMilk || undefined,
      proteinBoost: customProtein || undefined,
      iceLevel: customIce || undefined,
    });
    setSelectedItemForModal(null);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/90 via-zinc-900 to-amber-950/70 border border-amber-500/30 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Cafe & Kitchen Timings: 11:00 AM – 11:00 PM</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Courtside Delivery Active</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Court & Cafe • Kitchen & Refreshments
          </h2>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
            Open daily from 11:00 AM to 11:00 PM. Freshly prepared hot comfort foods, stone-baked pizzas, cheesy buttery Maggi, sealed chilled mineral water, artisan coolers, and South Indian filter coffee. Delivered direct to your court bench!
          </p>
        </div>
      </div>

      {/* Special Courtside ₹20 Mineral Water Quick-Add Feature Card */}
      {waterBottleItem && (
        <div className="rounded-2xl bg-gradient-to-r from-cyan-950/50 via-zinc-900 to-zinc-900 border border-cyan-500/40 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/10">
              <Droplets className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Chilled Mineral Water Bottle (1 Litre)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-cyan-500 text-zinc-950 shadow-sm">
                  ₹20 ONLY
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pure sealed natural mineral water bottle (1000ml), ice-chilled from the kitchen refrigerator.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => addToCart(waterBottleItem, 1)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-zinc-950 font-black text-xs shadow-md shadow-cyan-500/20 transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Water (₹20)</span>
            </button>
            <button
              onClick={() => addToCart(waterBottleItem, 2)}
              className="hidden sm:flex px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-bold text-xs border border-zinc-700 transition active:scale-95"
              title="Add 2 Bottles (₹40)"
            >
              +2 Bottles
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -tranzinc-y-1/2" />
          <input
            type="text"
            placeholder="Search drinks & snacks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-9 pr-4 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="group rounded-2xl border border-zinc-800/90 bg-zinc-900/70 overflow-hidden hover:border-zinc-700 hover:bg-zinc-900 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Item image */}
              <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

                {/* Price tag & MRP indicator */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-white font-black text-sm">
                  <span>₹{item.price}</span>
                  {item.mrp && (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40">
                      MRP ₹{item.mrp}
                    </span>
                  )}
                </div>

                {/* Badge if popular */}
                {item.isPopular && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500 text-zinc-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>Popular</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                    {item.name}
                  </h3>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Tags and nutrition */}
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-1">
                  {item.proteinGrams && (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <Zap className="w-3 h-3" />
                      {item.proteinGrams}g Protein
                    </span>
                  )}
                  <span>•</span>
                  <span>{item.calories} kcal</span>
                </div>
              </div>
            </div>

            {/* Card Action */}
            <div className="p-4 pt-0">
              <button
                type="button"
                onClick={() => openCustomizeModal(item)}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {itemHasOptions(item)
                    ? 'Customize & Add'
                    : 'Add to Order (₹' + item.price + ')'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating cart bar for quick order visibility */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-black px-5 py-3.5 rounded-2xl shadow-2xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-400 transition-all active:scale-95"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-950 text-[10px] text-white">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <span className="text-sm">
              View Refreshment Tray (₹{cart.reduce((s, i) => s + i.item.price * i.quantity, 0)})
            </span>
          </button>
        </div>
      )}

      {/* Item Customization Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-white">{selectedItemForModal.name}</h3>
                <p className="text-xs text-amber-400 font-bold mt-0.5">₹{selectedItemForModal.price}</p>
              </div>
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {selectedItemForModal.description}
            </p>

            {/* Milk Options */}
            {selectedItemForModal.options?.milk && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">Choice of Milk / Base:</label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedItemForModal.options.milk.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCustomMilk(m)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition ${
                        customMilk === m
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Protein Powder Boost */}
            {selectedItemForModal.options?.proteinBoost && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">Protein Boost Option:</label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedItemForModal.options.proteinBoost.map((p: string) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCustomProtein(p)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition ${
                        customProtein === p
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ice Level */}
            {selectedItemForModal.options?.iceLevel && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">Temperature & Ice:</label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedItemForModal.options.iceLevel.map(ice => (
                    <button
                      key={ice}
                      type="button"
                      onClick={() => setCustomIce(ice)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border text-center transition ${
                        customIce === ice
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {ice}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <span className="text-xs font-bold text-zinc-300">Quantity:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="text-sm font-black text-white w-6 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-black text-sm hover:from-amber-400 hover:to-orange-400 transition active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Add to Tray • ₹{selectedItemForModal.price * quantity}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
