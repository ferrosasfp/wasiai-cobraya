import { TopNav } from '@/components/nav/TopNav';
import { BottomTabs } from '@/components/nav/BottomTabs';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-luma-50">
      <TopNav />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomTabs />
    </div>
  );
}
