'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Grid3x3, Users, Clock, MapPin } from 'lucide-react';

interface TableData {
  id: string;
  table_number: string;
  capacity: number;
  area: 'INDOOR' | 'OUTDOOR' | 'ROOFTOP';
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  activeOrder?: {
    id: string;
    guest_count: number;
    total_amount: number;
    created_at: string;
    item_count: number;
  };
}

const areaFilters = ['All', 'Indoor', 'Outdoor', 'Rooftop'] as const;

export default function TablesPage() {
  const router = useRouter();
  const [tables, setTables] = useState<TableData[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTables();
    
    // Poll every 5 seconds to sync orders from waiters to admin/cashier panels
    const interval = setInterval(() => {
      fetchTables(false); // Pass false to avoid showing loading state on background sync
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      setTables(data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const filteredTables = tables.filter((t) => {
    if (activeFilter === 'All') return true;
    return t.area === activeFilter.toUpperCase();
  });

  const totalTables = tables.length;
  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED').length;
  const freeTables = totalTables - occupiedTables;

  const getMinutesSinceCreated = (createdAt: string) => {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  };

  const handleTableClick = (table: TableData) => {
    if (table.status === 'OCCUPIED' && table.activeOrder) {
      router.push(`/orders/${table.id}`);
    } else {
      router.push(`/orders/${table.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#1A1A1A' }}>
          Floor Plan
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
          {totalTables} tables · <span style={{ color: '#F97316' }}>{occupiedTables} occupied</span> · <span style={{ color: '#10B981' }}>{freeTables} free</span>
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {areaFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: activeFilter === filter ? '#10B981' : '#FFFFFF',
              color: activeFilter === filter ? '#FFFFFF' : '#6B7280',
              border: `1px solid ${activeFilter === filter ? '#10B981' : '#E5E7EB'}`,
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl h-44 animate-pulse"
              style={{ backgroundColor: '#F5F5F3' }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables.map((table, index) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleTableClick(table)}
              className="rounded-xl p-5 cursor-pointer transition-shadow duration-200"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                border: `1px solid ${table.status === 'OCCUPIED' ? '#F9731640' : '#E5E7EB'}`,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3
                    className="text-xl font-bold"
                    style={{ fontFamily: 'var(--font-heading)', color: '#1A1A1A' }}
                  >
                    {table.table_number}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3 h-3" style={{ color: '#9CA3AF' }} />
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>
                      {table.area.charAt(0) + table.area.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{
                    backgroundColor: table.status === 'OCCUPIED' ? '#FEF3C7' : '#ECFDF5',
                    color: table.status === 'OCCUPIED' ? '#B8792E' : '#16A34A',
                  }}
                >
                  {table.status === 'OCCUPIED' ? 'Occupied' : 'Available'}
                </span>
              </div>

              {table.status === 'OCCUPIED' && table.activeOrder ? (
                <div className="space-y-2 mt-3" style={{ borderTop: '1px solid #F3F4F6', paddingTop: '12px' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" style={{ color: '#6B7280' }} />
                      <span className="text-xs" style={{ color: '#6B7280' }}>
                        {table.activeOrder.guest_count} guests
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" style={{ color: '#6B7280' }} />
                      <span className="text-xs" style={{ color: '#6B7280' }}>
                        {getMinutesSinceCreated(table.activeOrder.created_at)} min
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: '#6B7280' }}>
                      Running total
                    </span>
                    <span
                      className="text-base font-bold"
                      style={{ fontFamily: 'var(--font-mono)', color: '#F97316' }}
                    >
                      ₹{table.activeOrder.total_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-3" style={{ borderTop: '1px solid #F3F4F6', paddingTop: '12px' }}>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>
                      {table.capacity} seats
                    </span>
                  </div>
                  <p className="text-xs mt-2" style={{ color: '#10B981' }}>
                    Tap to start new order →
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {filteredTables.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <Grid3x3 className="w-12 h-12 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
          <p className="text-sm" style={{ color: '#6B7280' }}>No tables found in this area</p>
        </div>
      )}
    </motion.div>
  );
}
