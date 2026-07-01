import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container, Stack, Text, Button, Badge, Surface, Grid, Spinner, useToast,
} from '@/components/ui';
import { api, type ApiResponse } from '@/lib/api';
import type { Subscription } from '@/types';
import { CreditCard, Check, Crown, Zap, Building2 } from 'lucide-react';

const subscriptionService = {
  getPlans: () => api.get<ApiResponse<any>>('/subscriptions/plans'),
  getMySubscription: () => api.get<ApiResponse<Subscription | null>>('/subscriptions/my-subscription'),
  createOrder: (planType: string) => api.post<ApiResponse<any>>('/subscriptions/create-order', { planType }),
  cancelSubscription: () => api.post<ApiResponse<any>>('/subscriptions/cancel'),
};

export function SubscriptionPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data } = await subscriptionService.getPlans();
      return data.data;
    },
  });

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: async () => {
      const { data } = await subscriptionService.getMySubscription();
      return data.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => subscriptionService.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
      toast({ variant: 'success', title: 'Subscription cancelled' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed', description: error.response?.data?.message });
    },
  });

  const isLoading = plansLoading || subLoading;

  return (
    <Container size="lg" className="py-6">
      <Stack gap={6}>
        <div>
          <Text variant="h2">Subscription</Text>
          <Text variant="body" color="secondary" className="mt-1">
            Manage your plan and billing
          </Text>
        </div>

        {/* Current Plan */}
        {subscription && (
          <Surface variant="elevated" padding="lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary-50">
                  <Crown className="size-6 text-primary-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Text variant="h4" className="capitalize">{subscription.plan}</Text>
                    <Badge variant={subscription.status === 'active' ? 'success' : 'default'} size="sm" dot>
                      {subscription.status}
                    </Badge>
                  </div>
                  <Text variant="body-sm" color="secondary">
                    {subscription.status === 'active' && subscription.endDate
                      ? `Renews on ${new Date(subscription.endDate).toLocaleDateString()}`
                      : 'No active subscription'}
                  </Text>
                </div>
              </div>
              {subscription.status === 'active' && (
                <Button variant="danger-outline" size="sm" onClick={() => cancelMutation.mutate()} loading={cancelMutation.isPending}>
                  Cancel Plan
                </Button>
              )}
            </div>
          </Surface>
        )}

        {/* Plans */}
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : plans && Array.isArray(plans) ? (
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
            {plans.map((plan: any) => (
              <PlanCard
                key={plan.type || plan.name}
                plan={plan}
                isCurrent={subscription?.plan === (plan.type || plan.name)}
              />
            ))}
          </Grid>
        ) : null}
      </Stack>
    </Container>
  );
}

function PlanCard({ plan, isCurrent }: { plan: any; isCurrent: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const orderMutation = useMutation({
    mutationFn: async () => {
      const { data } = await subscriptionService.createOrder(plan.type || plan.name);
      return data.data;
    },
    onSuccess: (data) => {
      toast({ variant: 'info', title: 'Redirecting to payment...' });
      // In production, integrate Razorpay checkout here
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed', description: error.response?.data?.message });
    },
  });

  const icon = plan.type === 'enterprise' ? <Building2 /> : plan.type === 'premium' ? <Crown /> : <Zap />;

  return (
    <Surface variant={isCurrent ? 'elevated' : 'outlined'} padding="lg" className={isCurrent ? 'ring-2 ring-primary-200' : ''}>
      <Stack gap={4}>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 [&>svg]:size-[18px]">
            {icon}
          </div>
          <Text variant="h5" className="capitalize">{plan.name || plan.type}</Text>
        </div>

        <div>
          <Text variant="h3">
            {plan.price > 0 ? `₹${plan.price}` : 'Free'}
            {plan.price > 0 && <span className="text-sm font-normal text-foreground-muted">/month</span>}
          </Text>
        </div>

        {plan.features && (
          <Stack gap={2}>
            {(Array.isArray(plan.features) ? plan.features : Object.entries(plan.features)).map((feature: any, i: number) => {
              const label = typeof feature === 'string' ? feature : `${feature[0]}: ${feature[1]}`;
              return (
                <div key={i} className="flex items-center gap-2">
                  <Check className="size-4 text-success-600 shrink-0" />
                  <Text variant="body-sm" color="secondary">{label}</Text>
                </div>
              );
            })}
          </Stack>
        )}

        <Button
          variant={isCurrent ? 'secondary' : 'primary'}
          fullWidth
          disabled={isCurrent || plan.price === 0}
          onClick={() => orderMutation.mutate()}
          loading={orderMutation.isPending}
        >
          {isCurrent ? 'Current Plan' : plan.price === 0 ? 'Free' : 'Upgrade'}
        </Button>
      </Stack>
    </Surface>
  );
}
