import React, { Component, ErrorInfo, ReactNode } from 'react';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // In production, send to error monitoring service
    if (import.meta.env.PROD) {
      // Example: sendToErrorMonitoring(error, errorInfo);
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Une erreur est survenue</CardTitle>
              </div>
              <CardDescription>
                Nous sommes désolés, une erreur inattendue s'est produite.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {import.meta.env.DEV && this.state.error && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Détails de l'erreur:</p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex gap-2">
              <Button onClick={this.handleReset} variant="default">
                Recharger la page
              </Button>
              <Button 
                onClick={() => window.history.back()} 
                variant="outline"
              >
                Retour
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for error handling in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // In production, send to error monitoring service
    if (import.meta.env.PROD) {
      // Example: sendToErrorMonitoring(error, errorInfo);
    }
    
    // Optionally show a toast notification
    // toast.error(`Une erreur est survenue: ${error.message}`);
  };
}