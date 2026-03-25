import { Component } from 'react';
import { clientLogError } from '@/lib/clientLog';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    clientLogError('react_render_error', error, {
      componentStack: info?.componentStack?.slice(0, 400)
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-stone-900 p-8">
          <div className="max-w-md w-full bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-2">
              Algo ha ido mal
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
              {this.state.error?.message || 'Error inesperado en la aplicación.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-turquoise-500 hover:bg-turquoise-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
