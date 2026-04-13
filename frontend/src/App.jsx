import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LawyerDirectoryPage from './pages/LawyerDirectoryPage';
import LawyerProfilePage from './pages/LawyerProfilePage';
import LawExplorerPage from './pages/LawExplorerPage';
import ArticlesPage from './pages/ArticlesPage';
import LegalUpdatesPage from './pages/LegalUpdatesPage';
import ClientDashboard from './pages/ClientDashboard';
import LawyerDashboard from './pages/LawyerDashboard';
import ChatPage from './pages/ChatPage';
import NotFoundPage from './pages/NotFoundPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/lawyers" element={<LawyerDirectoryPage />} />
          <Route path="/lawyers/:id" element={<LawyerProfilePage />} />
          <Route path="/law-explorer" element={<LawExplorerPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/legal-updates" element={
            <ProtectedRoute><LegalUpdatesPage /></ProtectedRoute>
          } />
          <Route path="/client/dashboard" element={
            <ProtectedRoute roles={['client']}><ClientDashboard /></ProtectedRoute>
          } />
          <Route path="/lawyer/dashboard" element={
            <ProtectedRoute roles={['lawyer']}><LawyerDashboard /></ProtectedRoute>
          } />
          <Route path="/chat/:sessionId" element={
            <ProtectedRoute><ChatPage /></ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
