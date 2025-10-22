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
 * Error boundary for the Forum feature
 * Catches errors in the forum and displays a fallback UI
 */
export class ForumErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Forum Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="Forum Error"
          message="Something went wrong loading the forum. Please try refreshing the page."
          onRetry={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}
