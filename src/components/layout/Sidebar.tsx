import { cn } from '@/lib/utils';
import { NavLink, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useSidebarStore } from '@/stores/sidebar.store';
import { Avatar, Text, Modal, ModalHeader, ModalBody, ModalFooter, Button } from '@/components/ui';
import { useLogout } from '@/hooks/useAuth';
import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Building2,
  Bell,
  MessageSquare,
  Bookmark,
  BarChart3,
  Settings,
  LogOut,
  Users,
  Sparkles,
  CreditCard,
  Megaphone,
  X,
} from 'lucide-react';
import { UserRole } from '@/types';

/* ─── Nav Item ─── */
interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  badge?: number;
}

function NavItem({ to, icon, label, badge }: NavItemProps) {
  const close = useSidebarStore((s) => s.close);

  return (
    <NavLink
      to={to}
      end
      onClick={close}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2',
          'rounded-lg text-sm font-medium',
          'transition-colors duration-fast',
          isActive
            ? 'bg-primary-50 text-primary-700'
            : 'text-foreground-secondary hover:text-foreground hover:bg-neutral-50',
        )
      }
    >
      <span className="[&>svg]:size-[18px] shrink-0">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-[10px] font-semibold text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  );
}

/* ─── Navigation Config ─── */
function getNavItems(role: UserRole): NavItemProps[] {
  switch (role) {
    case UserRole.EMPLOYEE:
      return [
        { to: '/employee', icon: <LayoutDashboard />, label: 'Dashboard' },
        { to: '/employee/jobs', icon: <Briefcase />, label: 'Find Jobs' },
        { to: '/employee/applications', icon: <FileText />, label: 'My Applications' },
        { to: '/employee/saved', icon: <Bookmark />, label: 'Saved Jobs' },
        { to: '/employee/alerts', icon: <Bell />, label: 'Job Alerts' },
        { to: '/employee/messages', icon: <MessageSquare />, label: 'Messages' },
        { to: '/employee/notifications', icon: <Bell />, label: 'Notifications' },
        { to: '/employee/ai', icon: <Sparkles />, label: 'AI Tools' },
        { to: '/employee/subscription', icon: <CreditCard />, label: 'Subscription' },
        { to: '/employee/profile', icon: <Settings />, label: 'Profile' },
      ];
    case UserRole.EMPLOYER:
      return [
        { to: '/employer', icon: <LayoutDashboard />, label: 'Dashboard' },
        { to: '/employer/jobs', icon: <Briefcase />, label: 'My Jobs' },
        { to: '/employer/applications', icon: <FileText />, label: 'Applications' },
        { to: '/employer/company', icon: <Building2 />, label: 'Company' },
        { to: '/employer/messages', icon: <MessageSquare />, label: 'Messages' },
        { to: '/employer/notifications', icon: <Bell />, label: 'Notifications' },
        { to: '/employer/analytics', icon: <BarChart3 />, label: 'Analytics' },
        { to: '/employer/ai', icon: <Sparkles />, label: 'AI Tools' },
        { to: '/employer/subscription', icon: <CreditCard />, label: 'Subscription' },
        { to: '/employer/profile', icon: <Settings />, label: 'Profile' },
      ];
    case UserRole.ADMIN:
      return [
        { to: '/admin', icon: <LayoutDashboard />, label: 'Dashboard' },
        { to: '/admin/employees', icon: <Users />, label: 'Job Seekers' },
        { to: '/admin/employers', icon: <Building2 />, label: 'Employers' },
        { to: '/admin/jobs', icon: <Briefcase />, label: 'Job Moderation' },
        { to: '/admin/revenue', icon: <BarChart3 />, label: 'Revenue' },
        { to: '/admin/broadcast', icon: <Megaphone />, label: 'Broadcast' },
      ];
    default:
      return [];
  }
}

/* ─── Sidebar Content (shared between desktop & mobile) ─── */
function SidebarContent() {
  const { user, role } = useAuthStore();
  const logoutMutation = useLogout();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!user || !role) return null;

  const navItems = getNavItems(role);

  const handleLogout = () => {
    logoutMutation.mutate();
    setShowLogoutConfirm(false);
  };

  const displayName = user.firstName ? `${user.firstName} ${user.lastName}` : (user as any).email?.split('@')[0] || 'Admin';
  const roleLabel = role === UserRole.ADMIN ? 'Admin' : role === UserRole.EMPLOYER ? 'Employer' : 'Job Seeker';

  return (
    <>
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary-600">
          <Briefcase className="size-4 text-white" />
        </div>
        <Text variant="h5" className="tracking-tight">
          HireFlow
        </Text>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar
            size="sm"
            src={(user as { avatar?: string }).avatar}
            fallback={displayName}
          />
          <div className="flex-1 min-w-0">
            <Text variant="body-sm" className="truncate font-medium">
              {displayName}
            </Text>
            <Text variant="caption" color="muted">
              {roleLabel}
            </Text>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="shrink-0 rounded-md p-1-5 text-foreground-muted hover:text-danger-600 hover:bg-danger-50 transition-colors"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} size="sm">
        <ModalHeader onClose={() => setShowLogoutConfirm(false)}>
          Sign out
        </ModalHeader>
        <ModalBody>
          <Text variant="body" color="secondary">
            Are you sure you want to sign out of your {roleLabel.toLowerCase()} account?
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowLogoutConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout} loading={logoutMutation.isPending}>
            Sign out
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

/* ─── Desktop Sidebar ─── */
function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex h-screen w-[260px] shrink-0 flex-col border-r border-border bg-surface-elevated">
      <SidebarContent />
    </aside>
  );
}

/* ─── Mobile Sidebar (slide-over drawer) ─── */
function MobileSidebar() {
  const { isOpen, close } = useSidebarStore();
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-modal lg:hidden',
        'transition-visibility duration-normal',
        isOpen ? 'visible' : 'invisible',
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-neutral-950/50 backdrop-blur-xs',
          'transition-opacity duration-normal ease-default',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          'relative flex h-full w-[280px] max-w-[85vw] flex-col',
          'bg-surface-elevated shadow-xl',
          'transition-transform duration-normal ease-default',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Close button */}
        <button
          onClick={close}
          className={cn(
            'absolute top-4 right-4 z-10',
            'flex size-8 items-center justify-center rounded-lg',
            'text-foreground-secondary hover:text-foreground hover:bg-neutral-100',
            'transition-colors duration-fast',
          )}
          aria-label="Close navigation"
        >
          <X className="size-5" />
        </button>

        <SidebarContent />
      </aside>
    </div>,
    document.body,
  );
}

/* ─── Sidebar Component ─── */
export function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
