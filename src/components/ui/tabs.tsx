import { cn } from '@/lib/utils';
import { createContext, useContext, useState, type ReactNode } from 'react';

/* ─── Context ─── */
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs components must be used within a Tabs provider');
  return context;
}

/* ─── Tabs Root ─── */
export type TabsProps = {
  defaultValue: string;
  value?: string;
  onChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
};

export function Tabs({ defaultValue, value, onChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeTab = value ?? internalValue;

  const setActiveTab = (newValue: string) => {
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

/* ─── Tab List ─── */
export function TabList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1',
        'overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
        'border-b border-border',
        'px-1',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ─── Tab Trigger ─── */
export function TabTrigger({
  value,
  children,
  className,
  disabled,
}: {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        'relative px-3 py-2 shrink-0 whitespace-nowrap',
        'text-sm font-medium',
        'transition-colors duration-fast',
        'rounded-t-md',
        '-mb-px',
        isActive
          ? 'text-primary-600 border-b-2 border-primary-600'
          : 'text-foreground-muted hover:text-foreground border-b-2 border-transparent',
        disabled && 'opacity-disabled cursor-not-allowed',
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ─── Tab Content ─── */
export function TabContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      className={cn('pt-4', className)}
    >
      {children}
    </div>
  );
}
