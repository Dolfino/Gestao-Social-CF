import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { safeStorage } from './utils/storage.js';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[REACT_ROOT_ERROR]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F5F8', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <div style={{ maxWidth: '440px', width: '100%', backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #FECACA', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px', marginBottom: '14px' }}>
              !
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#991B1B', margin: '0 0 8px 0' }}>
              Falha na exibição da interface
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              {this.state.error?.message || 'Ocorreu uma exceção não tratada na renderização do React.'}
            </p>
            <button
              onClick={() => {
                safeStorage.removeItem('cf_token');
                window.location.reload();
              }}
              style={{ padding: '8px 18px', backgroundColor: '#171B68', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
            >
              Reiniciar Sessão & Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Ouvinte de exceções de scripts
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('[WINDOW_ERROR]:', event.error || event.message);
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  );
}
