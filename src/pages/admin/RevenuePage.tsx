import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container, Stack, Text, Button, Badge, Surface, Grid, Spinner,
} from '@/components/ui';
import { adminService } from '@/services/admin.service';
import { exportToExcel, exportToPDF } from '@/lib/export';
import { Dropdown, DropdownItem } from '@/components/ui/dropdown';
import { CreditCard, TrendingUp, Users, DollarSign, ChevronLeft, ChevronRight, Download, FileText, Table } from 'lucide-react';

export function RevenuePage() {
  const [page, setPage] = useState(1);

  const { data: revenueStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-revenue-stats'],
    queryFn: async () => {
      const { data } = await adminService.getRevenueStats();
      return data.data;
    },
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-payments', page],
    queryFn: async () => {
      const { data } = await adminService.getPaymentHistory({ page, limit: 15 });
      return data;
    },
  });

  return (
    <Container size="xl" className="py-6">
      <Stack gap={6}>
        <div>
          <Text variant="h2">Revenue</Text>
          <Text variant="body" color="secondary" className="mt-1">
            Platform revenue and payment history
          </Text>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className="flex justify-center py-8"><Spinner size="lg" /></div>
        ) : revenueStats ? (
          <Grid cols={4} gap={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<DollarSign />} label="Total Revenue" value={`₹${((revenueStats.totalRevenue || 0) / 100).toLocaleString('en-IN')}`} />
            <StatCard icon={<TrendingUp />} label="This Month" value={`₹${((revenueStats.mrr || revenueStats.monthlyRevenue || 0) / 100).toLocaleString('en-IN')}`} />
            <StatCard icon={<Users />} label="Active Subscriptions" value={revenueStats.activeSubscriptions ?? 0} />
            <StatCard icon={<CreditCard />} label="Total Payments" value={revenueStats.totalTransactions ?? revenueStats.totalPayments ?? 0} />
          </Grid>
        ) : null}

        {/* Payment History */}
        <Surface variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <Text variant="h5">Payment History</Text>
            {payments?.data && payments.data.length > 0 && (
              <Dropdown align="end" trigger={
                <Button variant="outline" size="xs" leftIcon={<Download />}>
                  Export
                </Button>
              }>
                <DropdownItem 
                  icon={<Table />} 
                  onClick={() => {
                    const exportData = payments.data.map((p: any) => ({
                      User: p.user?.firstName ? `${p.user.firstName} ${p.user.lastName}` : p.user?.email || '—',
                      Plan: p.plan,
                      'Amount (INR)': (p.amount / 100),
                      Status: p.status,
                      Date: new Date(p.createdAt).toLocaleDateString(),
                    }));
                    exportToExcel(exportData, 'payment-history');
                  }}
                >
                  Export as Excel
                </DropdownItem>
                <DropdownItem 
                  icon={<FileText />} 
                  onClick={() => {
                    const exportData = payments.data.map((p: any) => ({
                      User: p.user?.firstName ? `${p.user.firstName} ${p.user.lastName}` : p.user?.email || '—',
                      Plan: p.plan,
                      'Amount (INR)': (p.amount / 100),
                      Status: p.status,
                      Date: new Date(p.createdAt).toLocaleDateString(),
                    }));
                    exportToPDF(exportData, 'payment-history', 'Payment History Report');
                  }}
                >
                  Export as PDF
                </DropdownItem>
              </Dropdown>
            )}
          </div>

          {paymentsLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : !payments?.data || payments.data.length === 0 ? (
            <Text variant="body-sm" color="muted" className="text-center py-8">No payments recorded yet.</Text>
          ) : (
            <div className="overflow-x-auto pb-2">
              <table className="w-full text-left whitespace-nowrap min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">User</th>
                    <th className="pb-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Plan</th>
                    <th className="pb-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Amount</th>
                    <th className="pb-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Status</th>
                    <th className="pb-3 text-xs font-semibold text-foreground-muted uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.data.map((payment: any) => (
                    <tr key={payment._id} className="border-b border-border last:border-0">
                      <td className="py-3"><Text variant="body-sm">{payment.user?.firstName ? `${payment.user.firstName} ${payment.user.lastName}` : payment.user?.email || '—'}</Text></td>
                      <td className="py-3"><Badge variant="primary" size="sm" className="capitalize">{payment.plan}</Badge></td>
                      <td className="py-3"><Text variant="body-sm" className="font-medium">₹{(payment.amount / 100)?.toLocaleString()}</Text></td>
                      <td className="py-3">
                        <Badge variant={payment.status === 'active' ? 'success' : 'default'} size="sm">{payment.status}</Badge>
                      </td>
                      <td className="py-3"><Text variant="caption" color="muted">{new Date(payment.createdAt).toLocaleDateString()}</Text></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {payments?.pagination && payments.pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={!payments.pagination.hasPrev} onClick={() => setPage(p => p - 1)}><ChevronLeft className="size-4" /></Button>
              <Text variant="body-sm" color="muted" className="px-3">{payments.pagination.page} / {payments.pagination.pages}</Text>
              <Button variant="outline" size="sm" disabled={!payments.pagination.hasNext} onClick={() => setPage(p => p + 1)}><ChevronRight className="size-4" /></Button>
            </div>
          )}
        </Surface>
      </Stack>
    </Container>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Surface variant="elevated" padding="md">
      <Stack gap={3}>
        <div className="flex size-9 items-center justify-center rounded-lg bg-success-50 text-success-600 [&>svg]:size-[18px]">
          {icon}
        </div>
        <div>
          <Text variant="h3" className="tabular-nums">{value}</Text>
          <Text variant="body-sm" color="secondary">{label}</Text>
        </div>
      </Stack>
    </Surface>
  );
}
