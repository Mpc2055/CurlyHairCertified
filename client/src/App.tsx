import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Rochester from "@/pages/rochester";
import Forum from "@/pages/forum";
import ForumNew from "@/pages/forum-new";
import ForumTopic from "@/pages/forum-topic";
import AnalyticsMentions from "@/pages/analytics-mentions";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/roc" component={Rochester} />
      <Route path="/forum" component={Forum} />
      <Route path="/forum/new" component={ForumNew} />
      <Route path="/forum/:id" component={ForumTopic} />
      <Route path="/analytics/mentions" component={AnalyticsMentions} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
