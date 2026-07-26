import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PrivateRoute } from '@/features/auth/PrivateRoute';

// Lazy-loaded route components — each becomes its own chunk
const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((module) => ({ default: module.LoginPage }))
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage }))
);
const Layout = lazy(() =>
  import('@/components/Layout').then((module) => ({ default: module.Layout }))
);

// Simple fallback — keep this lightweight, it renders before any CSS/JS for the route loads
const PageLoader = () => (
  <div className="page-loader" style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
    <span>Loading...</span>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;