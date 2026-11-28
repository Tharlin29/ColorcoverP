import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface StudioErrorBoundaryProps {
  children: ReactNode;
  onResetHome?: () => void;
  resetKey?: string;
}

interface StudioErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class StudioErrorBoundary extends Component<
  StudioErrorBoundaryProps,
  StudioErrorBoundaryState
> {
  state: StudioErrorBoundaryState = {
    hasError: false,
    errorMessage: "",
  };

  static isChunkLoadError(error: Error): boolean {
    const msg = error?.message || "";
    return (
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("Importing a module script failed") ||
      msg.includes("Loading chunk")
    );
  }

  static getDerivedStateFromError(error: Error): StudioErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || "An unexpected rendering error occurred.",
    };
  }

  componentDidUpdate(prevProps: StudioErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, errorMessage: "" });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("StudioErrorBoundary caught an error:", error, info.componentStack);
    if (StudioErrorBoundary.isChunkLoadError(error)) {
      try {
        const key = "gbtk_chunk_reload_at";
        const last = Number(sessionStorage.getItem(key) || "0");
        if (Date.now() - last > 8000) {
          sessionStorage.setItem(key, String(Date.now()));
          window.location.reload();
        }
      } catch {
        // Ignore storage errors in restricted iframes
      }
    }
  }

  handleRetry = () => {
    if (this.state.errorMessage.includes("dynamically imported module")) {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, errorMessage: "" });
  };

  handleReturnHome = () => {
    this.setState({ hasError: false, errorMessage: "" });
    this.props.onResetHome?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto px-4 py-16">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-1 min-w-0">
                <h2 className="text-base font-semibold text-zinc-950">
                  Something went wrong while loading this tool
                </h2>
                <p className="text-sm text-zinc-600">
                  Your saved Photo Hall pages are safe. Retry this view or return to Showcase.
                </p>
              </div>
            </div>

            {this.state.errorMessage && (
              <div className="px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-700 break-words">
                {this.state.errorMessage}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={this.handleRetry}
                className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              {this.props.onResetHome && (
                <button
                  type="button"
                  onClick={this.handleReturnHome}
                  className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-800 bg-white border border-zinc-200 hover:border-zinc-400 rounded-xl cursor-pointer whitespace-nowrap"
                >
                  <span>Back to Showcase</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
