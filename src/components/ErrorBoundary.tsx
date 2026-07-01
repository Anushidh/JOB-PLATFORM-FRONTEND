import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Stack, Text } from '@/components/ui';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <Stack align="center" gap={5} className="max-w-md text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-danger-50">
              <AlertTriangle className="size-7 text-danger-600" />
            </div>

            <div>
              <Text variant="h3">Something went wrong</Text>
              <Text variant="body" color="secondary" className="mt-2">
                An unexpected error occurred. You can try refreshing the page or going back to the home screen.
              </Text>
            </div>

            {this.state.error && (
              <div className="w-full rounded-lg bg-neutral-50 border border-border px-4 py-3 text-left">
                <Text variant="caption" color="muted" className="font-mono break-all">
                  {this.state.error.message}
                </Text>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={this.handleReset} leftIcon={<RefreshCw />}>
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} leftIcon={<Home />}>
                Go Home
              </Button>
            </div>
          </Stack>
        </div>
      );
    }

    return this.props.children;
  }
}
