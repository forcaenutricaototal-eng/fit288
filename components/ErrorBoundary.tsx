import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State {
  hasError: boolean;
  error: Error | null;
}

// Fix: The class must extend React.Component to be a valid class component.
// This gives it access to `this.props`, `this.state`, and `this.setState`.
class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
  }

  handleReset = () => {
    try {
      // Limpa todos os dados do site (incluindo sessões corrompidas)
      localStorage.clear();
      sessionStorage.clear();
      // Recarrega a página para um estado limpo
      window.location.reload();
    } catch (e) {
      console.error("Falha ao limpar o armazenamento:", e);
      this.setState({
        error: new Error("Não foi possível limpar os dados automaticamente. Por favor, limpe os dados do site manualmente nas configurações do seu navegador e tente novamente.")
      });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-100 p-4 font-sans">
          <div className="text-center bg-white p-8 rounded-lg shadow-soft max-w-2xl border-t-4 border-primary">
            <div className="flex justify-center mb-4">
                <AlertTriangle className="text-primary" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">Opa! Algo deu errado.</h2>
            <p className="text-neutral-800 mb-6">
              O aplicativo encontrou um erro inesperado, possivelmente devido a dados de sessão corrompidos em seu navegador.
            </p>
            <p className="text-neutral-800 mb-8">
              A solução é simples: clique no botão abaixo para limpar os dados do aplicativo e recarregar a página. Isso não afetará sua conta.
            </p>
            <button
              onClick={this.handleReset}
              className="bg-primary text-white font-bold py-3 px-8 rounded-md hover:bg-primary-dark transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw size={18} />
              Limpar dados e Recarregar
            </button>
            {this.state.error && (
              <div className="mt-6 text-left bg-neutral-100 p-3 rounded text-xs text-neutral-800">
                <p><strong>Detalhes do Erro:</strong> {this.state.error.toString()}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
