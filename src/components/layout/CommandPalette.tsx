import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Modal } from '@/components/ui/modal';
import { Search, User, Briefcase, Bookmark, FileText } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const isEmployee = role === 'employee' || !role;
  const isEmployer = role === 'employer';
  const isAdmin = role === 'admin';

  // Clear query when closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => setQuery(''), 200); // clear after animation
    }
  }, [open]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Navigate to appropriate search page
    let route = '/employee/jobs';
    if (isEmployer) route = '/employer/jobs';
    if (isAdmin) route = '/admin/employees'; // Admin default search

    navigate(`${route}?search=${encodeURIComponent(query)}`);
    onClose();
  };

  const handleQuickLink = (path: string) => {
    navigate(path);
    onClose();
  };

  const getQuickLinks = () => {
    if (isAdmin) {
      return [
        { icon: User, label: 'Manage Employees', path: '/admin/employees' },
        { icon: Briefcase, label: 'Manage Employers', path: '/admin/employers' },
        { icon: FileText, label: 'Job Moderation', path: '/admin/jobs' },
        { icon: Bookmark, label: 'Dashboard', path: '/admin' },
      ];
    }
    if (isEmployer) {
      return [
        { icon: Briefcase, label: 'Manage Jobs', path: '/employer/jobs' },
        { icon: FileText, label: 'View Applications', path: '/employer/applications' },
        { icon: User, label: 'Company Profile', path: '/employer/company' },
      ];
    }
    return [
      { icon: Briefcase, label: 'Find Jobs', path: '/employee/jobs' },
      { icon: FileText, label: 'My Applications', path: '/employee/applications' },
      { icon: Bookmark, label: 'Saved Jobs', path: '/employee/saved-jobs' },
      { icon: User, label: 'My Profile', path: '/employee/profile' },
    ];
  };

  const quickLinks = getQuickLinks();

  const getPlaceholder = () => {
    if (isAdmin) return "Search for users or companies...";
    if (isEmployer) return "Search for candidates or jobs...";
    return "Search for jobs, skills, or companies...";
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="flex flex-col bg-surface-elevated">
        <form onSubmit={handleSearch} className="flex items-center border-b border-border px-4 py-4">
          <Search className="size-5 text-foreground-muted mr-3 shrink-0" />
          <input
            type="text"
            className="flex-1 bg-transparent text-lg outline-none placeholder:text-foreground-muted/50 text-foreground"
            placeholder={getPlaceholder()}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button 
              type="button" 
              onClick={() => setQuery('')} 
              className="text-xs font-medium text-foreground-muted hover:text-foreground px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
               Clear
            </button>
          )}
        </form>

        {!query && (
          <div className="p-4">
            <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-2 px-2">
              Quick Links
            </h3>
            <div className="flex flex-col gap-1">
              {quickLinks.map((link) => (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => handleQuickLink(link.path)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-100 text-left transition-colors text-sm font-medium text-foreground"
                >
                  <link.icon className="size-4 text-foreground-muted" />
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {query && (
          <div className="p-4">
            <button 
              type="button"
              onClick={(e) => handleSearch(e as any)}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors text-sm font-medium text-left"
            >
              <Search className="size-4" />
              <span>Search for "{query}"</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
