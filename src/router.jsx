import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout/Layout.jsx'
import ProblemListPage from './pages/ProblemListPage/ProblemListPage.jsx'
import ProblemDetailPage from './pages/ProblemDetailPage/ProblemDetailPage.jsx'
import DesignWorkspacePage from './pages/DesignWorkspacePage/DesignWorkspacePage.jsx'
import EvaluationResultPage from './pages/EvaluationResultPage/EvaluationResultPage.jsx'
import AttemptHistoryPage from './pages/AttemptHistoryPage/AttemptHistoryPage.jsx'
import AttemptDetailPage from './pages/AttemptDetailPage/AttemptDetailPage.jsx'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.jsx'

// Phase 5 adds the history and attempt-detail routes as two more
// children of the same Layout route.
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <ProblemListPage /> },
      { path: 'problems/:problemId', element: <ProblemDetailPage /> },
      { path: 'problems/:problemId/attempt', element: <DesignWorkspacePage /> },
      { path: 'problems/:problemId/attempt/:attemptId/result', element: <EvaluationResultPage /> },
      { path: 'problems/:problemId/history', element: <AttemptHistoryPage /> },
      { path: 'problems/:problemId/history/:attemptId', element: <AttemptDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default router
