import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StockItem } from '../../types';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Coffee,
  Droplets,
  Layers,
  Sparkles,
  Phone,
  MapPin,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Filter,
  X,
  PlusCircle,
  MinusCircle,
  Truck,
  Building2,
} from 'lucide-react';

export const InventorySectorView: React.FC = () => {
  const { stockItems, adjustStockItem, addStockItem, updateStockItem, deleteStockItem } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedItemForRestock, setSelectedItemForRestock] = useState<StockItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(20);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<StockItem['category']>('kitchen_food');
  const [newItemStock, setNewItemStock] = useState<number>(20);
  const [newItemUnit, setNewItemUnit] = useState('packs');
  const [newItemMinThreshold, setNewItemMinThreshold] = useState<number>(5);
  const [newItemUnitCost, setNewItemUnitCost] = useState<number>(100);
  const [newItemSupplier, setNewItemSupplier] = useState('');
  const [newItemLocation, setNewItemLocation] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');

  // Calculations
  const totalSKUs = stockItems.length;
  const lowStockItems = stockItems.filter(item => item.currentStock <= item.minThreshold);
  const totalStockValuation = stockItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
  const totalWaterBottles = stockItems.find(i => i.id === 'stock-water-1l')?.currentStock || 0;

  // Filtered list
  const filteredItems = useMemo(() => {
    return stockItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'low_stock') return item.currentStock <= item.minThreshold;
      return item.category === selectedCategory;
    });
  }, [stockItems, searchQuery, selectedCategory]);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addStockItem({
      name: newItemName.trim(),
      category: newItemCategory,
      currentStock: Number(newItemStock),
      unit: newItemUnit.trim() || 'units',
      minThreshold: Number(newItemMinThreshold),
      unitCost: Number(newItemUnitCost),
      supplier: newItemSupplier.trim() || 'Local Club Supplier',
      lastRestocked: 'Just now',
      location: newItemLocation.trim() || 'Kitchen Store',
      notes: newItemNotes.trim() || undefined,
    });

    // Reset & close
    setNewItemName('');
    setNewItemStock(20);
    setNewItemUnit('packs');
    setNewItemMinThreshold(5);
    setNewItemUnitCost(100);
    setNewItemSupplier('');
    setNewItemLocation('');
    setNewItemNotes('');
    setIsAddItemModalOpen(false);
  };

  const handleQuickRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForRestock || restockAmount <= 0) return;
    adjustStockItem(selectedItemForRestock.id, restockAmount);
    setSelectedItemForRestock(null);
    setRestockAmount(20);
  };

  const getCategoryBadge = (cat: StockItem['category']) => {
    switch (cat) {
      case 'beverages':
        return { label: 'Beverages & Water', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
      case 'kitchen_food':
        return { label: 'Kitchen & Food', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'court_gear':
        return { label: 'Court Gear', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      case 'facility':
        return { label: 'Facility Supplies', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      default:
        return { label: cat, color: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Top Banner: Warm Inventory Sector Header */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/60 via-zinc-900 to-zinc-900 border border-amber-500/30 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">Staff Inventory Sector</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  COURT & CAFE STOCK
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Live monitoring and reordering for kitchen ingredients, ₹20 chilled water bottles, tournament court gear, and club facility assets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Stock SKU</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total SKUs */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400">Total Tracked SKUs</span>
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{totalSKUs}</span>
            <span className="text-xs text-zinc-400">active items</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-400 flex items-center gap-1">
            <span className="text-amber-400 font-semibold">Kitchen, Bar & Courts</span>
          </div>
        </div>

        {/* Metric 2: Inventory Valuation */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400">Total Stock Value</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              ₹{totalStockValuation.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">
            Cost basis of physical storage
          </div>
        </div>

        {/* Metric 3: Low Stock Alerts */}
        <div className={`p-4 rounded-2xl border shadow-md transition ${
          lowStockItems.length > 0
            ? 'bg-red-950/20 border-red-500/40'
            : 'bg-zinc-900/90 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400">Low Stock Warnings</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              lowStockItems.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl sm:text-3xl font-black ${
              lowStockItems.length > 0 ? 'text-red-400' : 'text-zinc-200'
            }`}>
              {lowStockItems.length}
            </span>
            <span className="text-xs text-zinc-400">SKUs below min threshold</span>
          </div>
          <div className="mt-1 text-[11px]">
            {lowStockItems.length > 0 ? (
              <span className="text-red-400 font-semibold">Immediate reorder required</span>
            ) : (
              <span className="text-emerald-400 font-medium">All inventories healthy</span>
            )}
          </div>
        </div>

        {/* Metric 4: ₹20 Water Bottles Stock */}
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400">Chilled Water Bottles</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Droplets className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
              {totalWaterBottles}
            </span>
            <span className="text-xs text-zinc-400">bottles in stock</span>
          </div>
          <div className="mt-1 text-[11px] text-cyan-400 font-medium">
            Member Price: ₹20 • Sealed 1L
          </div>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search SKU name, supplier, or shelf location..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'low_stock', label: `⚠️ Low Stock (${lowStockItems.length})` },
            { id: 'beverages', label: 'Beverages & Water' },
            { id: 'kitchen_food', label: 'Kitchen & Food' },
            { id: 'court_gear', label: 'Court Gear' },
            { id: 'facility', label: 'Facility' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Item Table / Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <Package className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-zinc-300">No inventory items found</p>
            <p className="text-xs text-zinc-500 mt-1">Try clearing your search query or switching filters.</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const isLow = item.currentStock <= item.minThreshold;
            const badge = getCategoryBadge(item.category);
            const isWaterBottle = item.id === 'stock-water-1l';

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                  isWaterBottle
                    ? 'bg-gradient-to-b from-cyan-950/20 to-zinc-900 border-cyan-500/40 shadow-lg'
                    : isLow
                    ? 'bg-red-950/15 border-red-500/40'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  {/* Top tags row */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                      {badge.label}
                    </span>
                    {isLow && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        LOW STOCK
                      </span>
                    )}
                    {isWaterBottle && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        ₹20 Member Water
                      </span>
                    )}
                  </div>

                  {/* Name & Notes */}
                  <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                    {item.name}
                  </h3>
                  {item.notes && (
                    <p className="text-[11px] text-amber-300/80 mt-1 italic">
                      {item.notes}
                    </p>
                  )}

                  {/* Storage Location & Supplier */}
                  <div className="mt-3 space-y-1 text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate text-zinc-400">{item.supplier}</span>
                    </div>
                  </div>

                  {/* Stock Level Display */}
                  <div className="mt-4 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-zinc-400">Current Stock</span>
                      <span className="text-[11px] text-zinc-500">Min Alert: {item.minThreshold} {item.unit}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-black font-mono ${
                        isLow ? 'text-red-400' : isWaterBottle ? 'text-cyan-300' : 'text-amber-400'
                      }`}>
                        {item.currentStock}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">{item.unit}</span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isLow
                            ? 'bg-red-500'
                            : isWaterBottle
                            ? 'bg-cyan-400'
                            : 'bg-amber-400'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(8, (item.currentStock / (item.minThreshold * 3)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Unit cost & Restock Date */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 px-1">
                    <span>Unit Cost: <strong className="text-zinc-200">₹{item.unitCost}</strong></span>
                    <span className="text-[10px] text-zinc-500">Last: {item.lastRestocked}</span>
                  </div>
                </div>

                {/* Bottom Actions: Adjust Stock & Restock */}
                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => adjustStockItem(item.id, -1)}
                      disabled={item.currentStock <= 0}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-30 transition"
                      title="Deduct 1 unit"
                    >
                      <MinusCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => adjustStockItem(item.id, 1)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                      title="Add 1 unit"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => adjustStockItem(item.id, 10)}
                      className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-zinc-300 hover:text-white transition"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => setSelectedItemForRestock(item)}
                      className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 text-xs font-bold border border-amber-500/40 transition active:scale-95 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Restock</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Quick Restock Dialog */}
      {selectedItemForRestock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl">
            <button
              onClick={() => setSelectedItemForRestock(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Replenish Inventory</h3>
                <p className="text-xs text-zinc-400">{selectedItemForRestock.name}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-300 mb-4 space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Current Balance:</span>
                <span className="font-bold text-white">{selectedItemForRestock.currentStock} {selectedItemForRestock.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Supplier:</span>
                <span className="text-zinc-200">{selectedItemForRestock.supplier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Storage Bay:</span>
                <span className="text-zinc-200">{selectedItemForRestock.location}</span>
              </div>
            </div>

            <form onSubmit={handleQuickRestockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Restock Quantity ({selectedItemForRestock.unit})
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[10, 25, 50, 100].map(qty => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setRestockAmount(qty)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                        restockAmount === qty
                          ? 'bg-amber-500 text-zinc-950 border-amber-400'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                      }`}
                    >
                      +{qty}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={e => setRestockAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between">
                <span>New Stock Level:</span>
                <span className="font-bold font-mono text-sm">
                  {selectedItemForRestock.currentStock + restockAmount} {selectedItemForRestock.unit}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm shadow-lg shadow-amber-500/20 transition"
              >
                Confirm Restock (+{restockAmount} {selectedItemForRestock.unit})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Stock Item */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddItemModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Add New Inventory SKU</h3>
                <p className="text-xs text-zinc-400">Track raw ingredients, drinks, or pro equipment</p>
              </div>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Item SKU Name</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder="e.g. Arabica Roast Beans (1kg) or Dura 40+ Balls"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value as StockItem['category'])}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="kitchen_food">Kitchen & Food</option>
                    <option value="beverages">Beverages & Water</option>
                    <option value="court_gear">Court Gear</option>
                    <option value="facility">Facility Supplies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={e => setNewItemUnit(e.target.value)}
                    placeholder="bottles, kg, packs, cans"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemStock}
                    onChange={e => setNewItemStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemMinThreshold}
                    onChange={e => setNewItemMinThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemUnitCost}
                    onChange={e => setNewItemUnitCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Supplier / Distributor</label>
                <input
                  type="text"
                  value={newItemSupplier}
                  onChange={e => setNewItemSupplier(e.target.value)}
                  placeholder="e.g. Metro Cash & Carry, Amul Direct (+91 98450...)"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Storage Location in Club</label>
                <input
                  type="text"
                  value={newItemLocation}
                  onChange={e => setNewItemLocation(e.target.value)}
                  placeholder="e.g. Chiller Unit A, Kitchen Prep Station, Pro Rack"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Internal Staff Notes (Optional)</label>
                <input
                  type="text"
                  value={newItemNotes}
                  onChange={e => setNewItemNotes(e.target.value)}
                  placeholder="e.g. High turnover on weekends. Keep refrigerated."
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm shadow-lg shadow-amber-500/20 transition"
                >
                  Save & Register Inventory SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
