import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="glass-effect p-10 rounded-2xl border border-cosmic-orange/50 glow-effect-warm max-w-lg">
            <AlertTriangle className="w-16 h-16 text-cosmic-orange mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-cosmic-orange mb-4">Oops! Something went wrong.</h1>
            <p className="text-cosmic-cyan/80 mb-6">
              A cosmic anomaly occurred. Our engineers have been notified. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="text-left bg-black/20 p-4 rounded-lg mb-6">
                <summary className="cursor-pointer text-cosmic-cyan">Error Details</summary>
                <pre className="text-xs text-cosmic-cyan/70 whitespace-pre-wrap mt-2">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <Button
              onClick={this.handleReset}
              className="button-cosmic font-semibold"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 