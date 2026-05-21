import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App.tsx';
import DashboardLayout from './layouts/DashboardLayout.tsx';
import WorkflowsPage from './pages/WorkflowsPage.tsx';
import RunsPage from './pages/RunsPage.tsx';
import ErrorFallback from './components/ErrorFallback.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    errorElement: <ErrorFallback />,
    children: [
      {
        path: '',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <WorkflowsPage />,
      },
      {
        path: 'runs',
        element: <RunsPage />,
      },
    ],
  },
  {
    path: '/flows/:id',
    element: <App />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/runs/:id',
    element: <App isDebugMode={true} />,
    errorElement: <ErrorFallback />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>,
);
