import { Component, type ErrorInfo, type ReactNode } from 'react';

/** Catches render errors and offers a reload instead of a blank screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center text-navy dark:text-white">
        <h1 className="text-2xl font-extrabold">
          Algo deu errado <span className="block text-base font-normal opacity-60">Something went wrong</span>
        </h1>
        <p className="max-w-md text-sm opacity-70">{this.state.error.message}</p>
        <button className="btn-primary" onClick={() => location.reload()}>
          Recarregar / Reload
        </button>
      </div>
    );
  }
}
