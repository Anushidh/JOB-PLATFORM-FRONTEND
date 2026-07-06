import { useAuthStore } from '@/stores/auth.store';
import { useSidebarStore } from '@/stores/sidebar.store';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { CommandPalette } from './CommandPalette';

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const toggleSidebar = useSidebarStore((s) => s.toggle);
  const { role } = useAuthStore();
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface-elevated px-4 sm:px-6">
      {/* Left: Hamburger (mobile) + breadcrumb area */}
      <div className="flex items-center gap-2">
        {/* Mobile menu toggle — hidden on lg+ where sidebar is always visible */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebar}
          aria-label="Open navigation menu"
          className="lg:hidden"
        >
          <Menu className="size-5" />
        </Button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-neutral-50 text-foreground-muted transition-colors mr-2"
          aria-label="Search"
        >
          <Search className="size-4" />
          <span className="text-sm">Search...</span>
          <kbd className="hidden lg:inline-flex items-center gap-1 rounded border border-border bg-neutral-100 px-1.5 font-mono text-[10px] font-medium text-foreground-muted ml-4">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          className="md:hidden mr-1"
        >
          <Search className="size-4" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notifications"
          className="relative"
          onClick={() => navigate(`/${role || 'employee'}/notifications`)}
        >
          <Bell className="size-4" />
          {/* Unread indicator */}
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger-500" />
          )}
        </Button>
      </div>
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
