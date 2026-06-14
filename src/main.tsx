import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App.tsx';
import DashboardLayout from './layouts/DashboardLayout.tsx';
import WorkflowsPage from './pages/WorkflowsPage.tsx';
import RunsPage from './pages/RunsPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import LandingPage from './pages/LandingPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import MaintenancePage from './pages/MaintenancePage.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import ErrorFallback from './components/ErrorFallback.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/maintenance',
    element: <MaintenancePage />,
    errorElement: <ErrorFallback />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorFallback />,
    children: [
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
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <ErrorFallback />,
  },
  {
    path: '/runs/:id',
    element: (
      <ProtectedRoute>
        <App isDebugMode={true} />
      </ProtectedRoute>
    ),
    errorElement: <ErrorFallback />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>,
);
