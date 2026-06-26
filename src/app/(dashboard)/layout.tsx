import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <Sidebar />
      <main
        className="min-h-screen"
        style={{ marginLeft: '240px', padding: '24px 32px' }}
      >
        {children}
      </main>
    </div>
  );
}
