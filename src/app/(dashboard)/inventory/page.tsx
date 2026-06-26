'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Package, Plus, Pencil, Trash2, AlertTriangle, Loader2, Lock, X } from 'lucide-react';

export default function InventoryPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#10B98120' }}>
          <Lock className="w-8 h-8" style={{ color: '#10B981' }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: '#1A1A1A' }}>
          Access Denied
        </h2>
        <p className="text-sm" style={{ color: '#6B7280' }}>Admin access required.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10B98120' }}>
          <Package className="w-5 h-5" style={{ color: '#10B981' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#1A1A1A' }}>Inventory Management</h1>
          <p className="text-xs" style={{ color: '#6B7280' }}>Track ingredients, stock levels, and receive alerts</p>
        </div>
      </div>
      <InventoryModule />
    </motion.div>
  );
}

function InventoryModule() {
  const [items, setItems] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStock, setEditingStock] = useState<any>(null);
  const [newStock, setNewStock] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/inventory');
      setItems(await res.json());
    } catch { toast.error('Failed to load inventory'); }
    finally { setIsLoading(false); }
  };

  const handleUpdateStock = async () => {
    if (!editingStock || newStock === '') return;
    try {
      const res = await fetch(`/api/inventory/${editingStock.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: parseFloat(newStock) }),
      });
      if (res.ok) {
        toast.success(`Stock updated for ${editingStock.name}`);
        setEditingStock(null);
        setNewStock('');
        fetchInventory();
      }
    } catch { toast.error('Failed to update stock'); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from inventory?`)) return;
    try {
      await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      toast.success(`${name} deleted`);
      fetchInventory();
    } catch { toast.error('Failed to delete item'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold" style={{ color: '#1A1A1A' }}>Current Stock</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2 cursor-pointer"
          style={{ backgroundColor: '#10B981' }}
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E5E7EB' }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: '#6B7280' }}>Item Name</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: '#6B7280' }}>Category</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: '#6B7280' }}>Current Stock</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: '#6B7280' }}>Status</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: '#6B7280' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">Loading inventory...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No inventory items found. Add one to get started.</td></tr>
            ) : (
              items.map(item => {
                const isLowStock = item.quantity <= item.min_stock;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #F3F4F6' }} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-3 font-medium" style={{ color: '#1A1A1A' }}>{item.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#F3F4F6', color: '#4B5563' }}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" style={{ fontFamily: 'var(--font-mono)', color: isLowStock ? '#EF4444' : '#1A1A1A' }}>
                      <span className="font-semibold">{item.quantity}</span> <span className="text-xs" style={{ color: '#6B7280' }}>{item.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isLowStock ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-600 border border-red-100">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-600 border border-green-100">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditingStock(item); setNewStock(item.quantity.toString()); }}
                          className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-[#F5F5F3]"
                          style={{ color: '#6B7280' }}
                          title="Update Stock"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-[#FEF2F2]"
                          style={{ color: '#EF4444' }}
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Update Stock Modal */}
      {editingStock && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-sm rounded-xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <h3 className="text-base font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Update Stock</h3>
            <p className="text-sm mb-1" style={{ color: '#1A1A1A' }}>{editingStock.name}</p>
            <p className="text-xs mb-4" style={{ color: '#6B7280' }}>Minimum Stock Alert: {editingStock.min_stock} {editingStock.unit}</p>
            <div className="relative mb-4 flex items-center">
              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="w-full pr-12 pl-4 py-2.5 rounded-lg text-sm outline-none"
                style={{ border: '1px solid #E5E7EB', fontFamily: 'var(--font-mono)' }}
                min="0"
                step="0.1"
              />
              <span className="absolute right-4 text-sm" style={{ color: '#6B7280' }}>{editingStock.unit}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingStock(null)} className="flex-1 py-2 rounded-lg text-sm cursor-pointer" style={{ backgroundColor: '#F5F5F3', color: '#6B7280' }}>Cancel</button>
              <button onClick={handleUpdateStock} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: '#10B981' }}>Update</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && <AddItemModal onClose={() => setShowAddModal(false)} onAdded={fetchInventory} />}
    </div>
  );
}

function AddItemModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ name: '', category: 'GENERAL', quantity: '', unit: 'kg', min_stock: '5' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.quantity) { toast.error('Fill required fields'); return; }
    setIsLoading(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(`Inventory item added`);
        onAdded();
        onClose();
      } else {
        toast.error('Failed to add item');
      }
    } catch { toast.error('Error adding item'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md rounded-xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Add Inventory Item</h3>
          <button onClick={onClose} className="cursor-pointer"><X className="w-4 h-4" style={{ color: '#6B7280' }} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>Item Name *</label>
            <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="e.g. Tomato, Chicken, Rice" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>Category</label>
              <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB' }}>
                <option value="GENERAL">General</option>
                <option value="PRODUCE">Produce (Veg/Fruit)</option>
                <option value="MEAT">Meat & Seafood</option>
                <option value="DAIRY">Dairy</option>
                <option value="SPICES">Spices</option>
                <option value="BEVERAGE">Beverage</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>Unit</label>
              <select value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB' }}>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="liter">Liters (L)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="piece">Pieces</option>
                <option value="packet">Packets</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>Initial Stock *</label>
              <input type="number" step="0.1" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB', fontFamily: 'var(--font-mono)' }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>Min Stock Alert</label>
              <input type="number" step="0.1" value={form.min_stock} onChange={(e) => setForm({...form, min_stock: e.target.value})} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB', fontFamily: 'var(--font-mono)' }} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm cursor-pointer" style={{ backgroundColor: '#F5F5F3', color: '#6B7280' }}>Cancel</button>
            <button onClick={handleSave} disabled={isLoading} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer flex items-center justify-center gap-2" style={{ backgroundColor: '#10B981' }}>
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
