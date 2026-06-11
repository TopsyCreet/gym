import { Component, type ReactNode } from 'react';
import errorStatePng from '../assets/brand/error_state.png';

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  handleRetry = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ background: 'var(--bg-base)' }}
      >
        <img
          src={errorStatePng}
          alt="Something went wrong"
          className="mb-6 h-32 w-32 object-contain opacity-80"
        />
        <h1 className="text-xl font-black text-white">Something went wrong.</h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          An unexpected error occurred. Your data is safe — reload to continue.
        </p>
        <button
          type="button"
          onClick={this.handleRetry}
          className="btn-primary mt-8"
        >
          Reload
        </button>
        {import.meta.env.DEV && (
          <pre
            className="mt-6 max-w-sm overflow-auto rounded-xl p-4 text-left text-[10px] leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-faint)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {this.state.error.message}
          </pre>
        )}
      </div>
    );
  }
}
