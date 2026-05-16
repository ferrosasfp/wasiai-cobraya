import { TopNav } from '@/components/nav/TopNav';
import { BottomTabs } from '@/components/nav/BottomTabs';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-luma-50">
      <TopNav />
      {/* pb-24 mobile: 96px clears the BottomTabs (~64px) + the raised FAB
          (extends ~28px above the bar). Earlier pb-20 (80px) made the FAB
          sometimes overlap content on short pages. */}
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <BottomTabs />
    </div>
  );
}
