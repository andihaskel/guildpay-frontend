import { Sidebar, Topbar } from '@/components/dashboard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />
      <main className="ml-64 mt-16 p-8">{children}</main>
    </div>
  );
}
