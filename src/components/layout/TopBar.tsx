import { useAuthStore } from '@/stores/auth.store';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui';
import { useState } from 'react';

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface-elevated px-6">
      {/* Left: Page breadcrumb handled by page */}
      <div className="flex-1" />

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search trigger */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setSearchOpen(!searchOpen)}
          aria-label="Search"
        >
          <Search className="size-4" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notifications"
          className="relative"
        >
          <Bell className="size-4" />
          {/* Unread indicator */}
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger-500" />
        </Button>
      </div>
    </header>
  );
}
