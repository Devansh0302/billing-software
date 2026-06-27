'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ShieldCheck, UserPlus, Lock, X } from 'lucide-react';

export default function StaffPage() {
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
          <ShieldCheck className="w-5 h-5" style={{ color: '#10B981' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#1A1A1A' }}>Staff Management</h1>
          <p className="text-xs" style={{ color: '#6B7280' }}>Manage restaurant employees and roles</p>
        </div>
      </div>
      <StaffManagement />
    </motion.div>
  );
}

function StaffManagement() {
  const [staff, setStaff] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchStaff = () => { fetch('/api/staff').then(r => r.json()).then(setStaff).catch(() => {}); };
  useEffect(() => { fetchStaff(); }, []);

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await fetch('/api/staff', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_active: !isActive }) });
    const res = await fetch('/api/staff');
    setStaff(await res.json());
    toast.success(isActive ? 'Staff deactivated' : 'Staff activated');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return { bg: '#10B98120', text: '#10B981' };
      case 'CASHIER': return { bg: '#F9731620', text: '#F97316' };
      default: return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold" style={{ color: '#1A1A1A' }}>Staff Members</h2>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2 cursor-pointer" style={{ backgroundColor: '#10B981' }}>
          <UserPlus className="w-4 h-4" /> Add Staff
        </button>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #E5E7EB' }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: '#6B7280' }}>Name</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: '#6B7280' }}>Email</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: '#6B7280' }}>Role</th>
              <th className="text-center px-4 py-3 font-medium" style={{ color: '#6B7280' }}>Status</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: '#6B7280' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(s => {
              const rc = getRoleColor(s.role);
              return (
                <tr key={s.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: '#1A1A1A' }}>{s.name}</td>
                  <td className="px-4 py-3" style={{ color: '#6B7280' }}>{s.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: rc.bg, color: rc.text }}>{s.role}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: s.is_active ? '#ECFDF5' : '#FEF2F2', color: s.is_active ? '#16A34A' : '#EF4444' }}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleToggleActive(s.id, s.is_active)} className="text-xs cursor-pointer px-2 py-1 rounded" style={{ color: s.is_active ? '#EF4444' : '#10B981' }}>
                      {s.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showAddModal && <AddStaffModal onClose={() => setShowAddModal(false)} onAdded={fetchStaff} />}
    </div>
  );
}

function AddStaffModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'WAITER', pin: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('Fill required fields'); return; }
    setIsLoading(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(`Staff member added`);
        onAdded();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add staff');
      }
    } catch { toast.error('Error adding staff'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md rounded-xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Add Staff Member</h3>
          <button onClick={onClose} className="cursor-pointer"><X className="w-4 h-4" style={{ color: '#6B7280' }} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>Name *</label>
            <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Full Name" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB' }} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="Email Address" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB' }} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>Password *</label>
            <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="Password" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>Role</label>
              <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB' }}>
                <option value="WAITER">Waiter</option>
                <option value="CASHIER">Cashier</option>
                <option value="KITCHEN">Kitchen</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>PIN (4-digits)</label>
              <input value={form.pin} onChange={(e) => setForm({...form, pin: e.target.value})} placeholder="e.g. 1234" maxLength={4} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB' }} />
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm font-semibold cursor-pointer" style={{ backgroundColor: '#F3F4F6', color: '#4B5563' }}>Cancel</button>
          <button onClick={handleSave} disabled={isLoading} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-50" style={{ backgroundColor: '#10B981' }}>
            {isLoading ? 'Saving...' : 'Save Staff'}
          </button>
        </div>
      </div>
    </div>
  );
}
