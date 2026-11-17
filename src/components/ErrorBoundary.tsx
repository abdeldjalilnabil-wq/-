import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let readable = error.message || 'حدث خطأ غير متوقع في التطبيق.';
    try {
      const parsed = JSON.parse(error.message) as { error?: string; operationType?: string };
      if (parsed.error) {
        readable = `تعذر إتمام العملية (${parsed.operationType || 'بيانات'}): ${parsed.error}`;
      }
    } catch {
      // keep raw error message
    }
    return { hasError: true, message: readable };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full bg-white border border-[#E6E2DA] rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#141518] mb-2">
              حدث خلل مؤقت
            </h2>
            <p className="text-sm text-[#57534E] leading-relaxed mb-6 break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#141518] text-white text-sm font-medium rounded-xl hover:bg-[#27272A] transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة تحميل التطبيق</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
