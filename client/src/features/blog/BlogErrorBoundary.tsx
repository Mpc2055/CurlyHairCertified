import { Component, ReactNode } from "react";
import { ErrorState } from "@/components/shared";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary for the Blog feature
 * Catches errors in the blog and displays a fallback UI
 */
export class BlogErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Blog Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="Blog Error"
          message="Something went wrong loading the blog. Please try refreshing the page."
          onRetry={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}
