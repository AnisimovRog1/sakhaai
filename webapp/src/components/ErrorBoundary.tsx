import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: Error) { console.error('ErrorBoundary:', err); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#070b14] text-white p-6 text-center">
          <div>
            <p className="text-xl font-bold mb-2">Что-то пошло не так</p>
            <p className="text-slate-400 text-sm mb-4">Попробуйте перезагрузить приложение</p>
            <button onClick={() => location.reload()} className="px-6 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-medium">Перезагрузить</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
