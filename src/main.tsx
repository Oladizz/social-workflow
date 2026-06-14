import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App.tsx';
import DashboardLayout from './layouts/DashboardLayout.tsx';
import WorkflowsPage from './pages/WorkflowsPage.tsx';
import RunsPage from './pages/RunsPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import ErrorFallback from './components/ErrorFallback.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
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
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>,
);
