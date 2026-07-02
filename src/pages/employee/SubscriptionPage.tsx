import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container, Stack, Text, Button, Badge, Surface, Spinner, useToast,
} from '@/components/ui';
import { api, type ApiResponse } from '@/lib/api';
import type { Subscription } from '@/types';
import { Check, Crown, Zap, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

const subscriptionService = {
  getPlans: () => api.get<ApiResponse<any>>('/subscriptions/plans'),
  getMySubscription: () => api.get<ApiResponse<Subscription | null>>('/subscriptions/my-subscription'),
  createOrder: (planType: string) => api.post<ApiResponse<any>>('/subscriptions/create-order', { planType }),
  verifyPayment: (data: any) => api.post<ApiResponse<any>>('/subscriptions/verify-payment', data),
  cancelSubscription: () => api.post<ApiResponse<any>>('/subscriptions/cancel'),
};

// Employee-focused feature descriptions per plan (based on actual backend enforcement)
function getEmployeeFeatures(planType: string): { label: string; included: boolean }[] {
  switch (planType) {
    case 'basic':
      return [
        { label: '50 job applications / month', included: true },
        { label: '50 saved jobs', included: true },
        { label: 'AI Resume Parser & Cover Letter', included: true },
        { label: 'Job alerts', included: true },
        { label: 'Direct messaging with employers', included: false },
        { label: 'See who viewed your profile', included: false },
        { label: 'Unlimited saved jobs', included: false },
      ];
    case 'premium':
      return [
        { label: '200 job applications / month', included: true },
        { label: 'Unlimited saved jobs', included: true },
        { label: 'AI Resume Parser & Cover Letter', included: true },
        { label: 'Job alerts', included: true },
        { label: 'Direct messaging with employers', included: true },
        { label: 'See who viewed your profile', included: true },
        { label: 'Unlimited applications', included: false },
      ];
    case 'enterprise':
      return [
        { label: 'Unlimited job applications', included: true },
        { label: 'Unlimited saved jobs', included: true },
        { label: 'AI Resume Parser & Cover Letter', included: true },
        { label: 'Job alerts', included: true },
        { label: 'Direct messaging with employers', included: true },
        { label: 'See who viewed your profile', included: true },
        { label: 'Priority support', included: true },
      ];
    default:
      return [];
  }
}

export function EmployeeSubscriptionPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
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
  const currentPlan = subscription?.plan || 'free';

  return (
    <Container size="lg" className="py-6">
      <Stack gap={6}>
        <div>
          <Text variant="h2">Subscription</Text>
          <Text variant="body" color="secondary" className="mt-1">
            Upgrade your plan to unlock more features and stand out to employers
          </Text>
        </div>

        {/* Current Plan Banner */}
        {subscription && subscription.status === 'active' && (
          <Surface variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary-50">
                  <Crown className="size-5 text-primary-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Text variant="subtitle" className="capitalize">{subscription.plan} Plan</Text>
                    <Badge variant="success" size="sm" dot>Active</Badge>
                  </div>
                  <Text variant="body-sm" color="muted">
                    Renews on {new Date(subscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Text>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => cancelMutation.mutate()} loading={cancelMutation.isPending} className="text-danger-600">
                Cancel
              </Button>
            </div>
          </Surface>
        )}

        {/* Free plan info */}
        {currentPlan === 'free' && (
          <Surface variant="flat" padding="md" className="border border-border">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-neutral-100">
                <Zap className="size-4 text-foreground-muted" />
              </div>
              <div>
                <Text variant="subtitle">Free Plan</Text>
                <Text variant="body-sm" color="muted">10 applications/month · 10 saved jobs · AI Resume Parser · Job alerts</Text>
              </div>
            </div>
          </Surface>
        )}

        {/* Plans Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : plans && Array.isArray(plans) ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.filter((p: any) => p.type !== 'free').map((plan: any) => (
              <EmployeePlanCard
                key={plan.type}
                plan={plan}
                isCurrent={currentPlan === plan.type}
                isPopular={plan.type === 'premium'}
                hasActivePlan={!!subscription && subscription.status === 'active'}
                userEmail={user?.email || ''}
              />
            ))}
          </div>
        ) : null}
      </Stack>
    </Container>
  );
}

function EmployeePlanCard({ plan, isCurrent, isPopular, hasActivePlan, userEmail }: { plan: any; isCurrent: boolean; isPopular: boolean; hasActivePlan: boolean; userEmail: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: async (paymentData: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) => {
      const { data } = await subscriptionService.verifyPayment(paymentData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
      toast({ variant: 'success', title: 'Subscription activated!' });
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Verification failed', description: error.response?.data?.message });
    },
  });

  const orderMutation = useMutation({
    mutationFn: async () => {
      const { data } = await subscriptionService.createOrder(plan.type);
      return data.data;
    },
    onSuccess: (data) => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency || 'INR',
        name: 'HireFlow',
        description: `${plan.name} Plan`,
        order_id: data.order.id,
        handler: (response: any) => {
          verifyMutation.mutate({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        prefill: { email: userEmail },
        theme: { color: '#4f46e5' },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        toast({ variant: 'error', title: 'Payment failed', description: response.error?.description });
      });
      rzp.open();
    },
    onError: (error: any) => {
      toast({ variant: 'error', title: 'Failed to create order', description: error.response?.data?.message });
    },
  });

  const price = plan.amount / 100;
  const icon = plan.type === 'enterprise' ? <Crown /> : <Zap />;
  const features = getEmployeeFeatures(plan.type);

  return (
    <div className={`relative rounded-2xl border p-6 flex flex-col ${isPopular ? 'border-primary-300 bg-primary-50/30 shadow-md' : 'border-border bg-surface-elevated'}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="primary" size="lg">Most Popular</Badge>
        </div>
      )}

      <Stack gap={4} className="flex-1">
        <div className="flex items-center gap-3">
          <div className={`flex size-9 items-center justify-center rounded-lg ${isPopular ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-foreground-secondary'} [&>svg]:size-[18px]`}>
            {icon}
          </div>
          <Text variant="h5">{plan.name}</Text>
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <Text variant="h2">₹{price.toLocaleString('en-IN')}</Text>
            <Text variant="body-sm" color="muted">/month</Text>
          </div>
          {plan.gst && plan.gst.rate > 0 && (
            <Text variant="caption" color="muted">+ 18% GST</Text>
          )}
        </div>

        <Stack gap={2} className="flex-1">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-2">
              {feature.included ? (
                <Check className="size-4 text-success-600 shrink-0 mt-0.5" />
              ) : (
                <X className="size-4 text-neutral-300 shrink-0 mt-0.5" />
              )}
              <Text variant="body-sm" color={feature.included ? 'secondary' : 'muted'}>
                {feature.label}
              </Text>
            </div>
          ))}
        </Stack>

        <Button
          variant={isPopular ? 'primary' : 'outline'}
          fullWidth
          disabled={isCurrent || (hasActivePlan && !isCurrent)}
          onClick={() => orderMutation.mutate()}
          loading={orderMutation.isPending || verifyMutation.isPending}
        >
          {isCurrent ? 'Current Plan' : hasActivePlan ? 'Cancel current plan first' : 'Upgrade'}
        </Button>
      </Stack>
    </div>
  );
}
