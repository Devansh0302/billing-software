'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ShieldCheck, UserPlus, Lock } from 'lucide-react';

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

  useEffect(() => { fetch('/api/staff').then(r => r.json()).then(setStaff).catch(() => {}); }, []);

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
    </div>
  );
}
