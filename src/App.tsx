import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import OnboardChannel from "./pages/onboard/OnboardChannel.tsx";
import OnboardAnalyzing from "./pages/onboard/OnboardAnalyzing.tsx";
import OnboardBrandProfile from "./pages/onboard/OnboardBrandProfile.tsx";
import OnboardPreferences from "./pages/onboard/OnboardPreferences.tsx";
import OnboardVoiceprints from "./pages/onboard/OnboardVoiceprints.tsx";
import OnboardReady from "./pages/onboard/OnboardReady.tsx";
import AppShell from "./components/app/AppShell.tsx";
import Library from "./pages/Library.tsx";
import NewRun from "./pages/NewRun.tsx";
import RunOverview from "./pages/RunOverview.tsx";
import RunTimeline from "./pages/RunTimeline.tsx";
import RunGraph from "./pages/RunGraph.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboard/channel" element={<OnboardChannel />} />
          <Route path="/onboard/analyzing" element={<OnboardAnalyzing />} />
          <Route path="/onboard/brand-profile" element={<OnboardBrandProfile />} />
          <Route path="/onboard/preferences" element={<OnboardPreferences />} />
          <Route path="/onboard/voiceprints" element={<OnboardVoiceprints />} />
          <Route path="/onboard/ready" element={<OnboardReady />} />
          {/* App shell routes */}
          <Route element={<AppShell />}>
            <Route path="/library" element={<Library />} />
            <Route path="/library/clips" element={<Library />} />
            <Route path="/runs/new" element={<NewRun />} />
            <Route path="/runs/:id" element={<RunOverview />} />
            <Route path="/runs/:id/timeline" element={<RunTimeline />} />
            <Route path="/runs/:id/graph" element={<RunGraph />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
