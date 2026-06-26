'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Save, Loader2, Settings } from 'lucide-react';

export default function SettingsPage() {
  const [form, setForm] = useState({ name: '', address: '', phone: '', gstin: '', cgst_rate: '2.5', sgst_rate: '2.5' });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetch('/api/restaurant')
      .then(r => r.json())
      .then(data => {
        if (data) setForm({
          name: data.name || '', address: data.address || '', phone: data.phone || '',
          gstin: data.gstin || '', cgst_rate: data.cgst_rate?.toString() || '2.5',
          sgst_rate: data.sgst_rate?.toString() || '2.5',
        });
      })
      .catch(() => {})
      .finally(() => setIsFetching(false));
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/restaurant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) toast.success('Settings saved successfully');
      else toast.error('Failed to save settings');
    } catch { toast.error('Failed to save settings'); }
    finally { setIsLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10B98115' }}>
          <Settings className="w-5 h-5" style={{ color: '#10B981' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#1A1A1A' }}>Settings</h1>
          <p className="text-xs" style={{ color: '#6B7280' }}>Restaurant configuration</p>
        </div>
      </div>

      <div className="max-w-lg rounded-xl p-6" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div className="space-y-4">
          {[
            { label: 'Restaurant Name', key: 'name', placeholder: 'Spice Route' },
            { label: 'Address', key: 'address', placeholder: 'MG Road, Jaipur' },
            { label: 'Phone', key: 'phone', placeholder: '+91 98765 43210' },
            { label: 'GSTIN', key: 'gstin', placeholder: '08ABCDE1234F1Z5' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>{label}</label>
              <input
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{ border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>CGST Rate (%)</label>
              <input
                type="number"
                value={form.cgst_rate}
                onChange={(e) => setForm({ ...form, cgst_rate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ border: '1px solid #E5E7EB', fontFamily: 'var(--font-mono)', backgroundColor: '#F9FAFB' }}
                step="0.1"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>SGST Rate (%)</label>
              <input
                type="number"
                value={form.sgst_rate}
                onChange={(e) => setForm({ ...form, sgst_rate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ border: '1px solid #E5E7EB', fontFamily: 'var(--font-mono)', backgroundColor: '#F9FAFB' }}
                step="0.1"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer flex items-center justify-center gap-2 mt-2"
            style={{ backgroundColor: '#10B981' }}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </div>
    </motion.div>
  );
}
