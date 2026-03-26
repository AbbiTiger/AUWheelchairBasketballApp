import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import LiveGame from '@/pages/LiveGame';
import Dashboard from '@/pages/Dashboard';
import BoxScore from '@/pages/BoxScore';
import SeasonAverages from '@/pages/SeasonAverages';
import Players from '@/pages/Players';
import Games from '@/pages/Games';
import GameDetail from '@/pages/GameDetail';
import PlayerDetail from '@/pages/PlayerDetail';
import { Navigate } from 'react-router-dom';
import RecruitingProfile from '@/pages/RecruitingProfile';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/Games" replace />} />
              <Route path="/LiveGame" element={<LiveGame />} />
              <Route path="/Dashboard" element={<Dashboard />} />
              <Route path="/BoxScore" element={<BoxScore />} />
              <Route path="/SeasonAverages" element={<SeasonAverages />} />
              <Route path="/Players" element={<Players />} />
              <Route path="/Games" element={<Games />} />
              <Route path="/GameDetail" element={<GameDetail />} />
              <Route path="/PlayerDetail" element={<PlayerDetail />} />
              <Route path="/RecruitingProfile" element={<RecruitingProfile />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
