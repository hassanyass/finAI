import { createBrowserRouter } from 'react-router-dom'
import { AppLayout }      from './layouts/AppLayout'
import { WelcomePage }    from './pages/WelcomePage'
import { OnboardingPage } from './pages/OnboardingPage'
import { DashboardPage }  from './pages/DashboardPage'
import { SimulatorPage }  from './pages/SimulatorPage'
import { GamePage }       from './pages/GamePage'
import { ResultsPage }    from './pages/ResultsPage'
import { CoachPage }      from './pages/CoachPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,          element: <WelcomePage />    },
      { path: 'onboarding',   element: <OnboardingPage /> },
      { path: 'dashboard',    element: <DashboardPage />  },
      { path: 'simulate',     element: <SimulatorPage />  },
      { path: 'game',         element: <GamePage />       },
      { path: 'game/results', element: <ResultsPage />    },
      { path: 'coach',        element: <CoachPage />      },
    ],
  },
])
