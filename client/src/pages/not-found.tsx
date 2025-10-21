import { PageLayout } from "@/layouts/PageLayout";
import { ErrorState } from "@/components/shared";

export default function NotFound() {
  return (
    <PageLayout includeNav={false}>
      <div className="flex items-center justify-center min-h-screen">
        <ErrorState
          title="404 - Page Not Found"
          message="The page you're looking for doesn't exist."
          onRetry={() => window.location.href = "/"}
          retryText="Go Home"
        />
      </div>
    </PageLayout>
  );
}
