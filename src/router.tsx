import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout }      from './layouts/AppLayout'
import { WelcomePage }    from './pages/WelcomePage'
import { OnboardingPage } from './pages/OnboardingPage'
import { DashboardPage }  from './pages/DashboardPage'
import { SimulatorPage }  from './pages/SimulatorPage'
import { GamePage }       from './pages/GamePage'
import { ResultsPage }    from './pages/ResultsPage'
import { CoachPage }      from './pages/CoachPage'
import { AuthPage } from './pages/AuthPage'

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = getUser()

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true,          element: <WelcomePage />    },
        { path: 'auth', element: <AuthPage /> },
        { path: 'onboarding',   element: <OnboardingPage /> },
        { path: 'dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
{ path: 'simulate',  element: <ProtectedRoute><SimulatorPage /></ProtectedRoute> },
{ path: 'game',      element: <ProtectedRoute><GamePage /></ProtectedRoute> },
{ path: 'game/results', element: <ProtectedRoute><ResultsPage /></ProtectedRoute> },
{ path: 'coach',     element: <ProtectedRoute><CoachPage /></ProtectedRoute> },
      ],
    },
  ],
  {
    basename: '/finAI',
  }
)
