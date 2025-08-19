import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import FriendsPage from './pages/FriendsPage.jsx';
import CallPage from './pages/CallPage.jsx';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import { Toaster } from 'react-hot-toast';
import PageLoader from './components/PageLoader.jsx';
import useAuthUser from './hooks/useAuthUser.js';
import Layout from './components/Layout.jsx';
import { useThemeStore } from './store/useThemeStore.js';
import { useStreamClient } from './hooks/useStreamClient.js';


const App = () => {

  //transtack query
  //axios

  const { isLoading, authUser } = useAuthUser();
  const { theme, initializeTheme } = useThemeStore();
  // initialize Stream client and global unread listeners
  useStreamClient();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  // Initialize theme on app startup
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  if (isLoading) return <PageLoader />;
  return (
    <div className='h-screen' data-theme={theme} >
      <Routes>
        <Route path="/" element={isAuthenticated && isOnboarded ? (
          <Layout showSidebar={true} >
            <HomePage/>
          </Layout>
        ) : (
          <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
        )} />
        <Route path="/signup" element={!isAuthenticated ? <SignUpPage /> :  <Navigate to={isOnboarded ? "/" : "/onboarding"} />
      } 
      />
        <Route path="/login" element={
          !isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
        }
        />
        <Route path="/reset-password" element={
          !isAuthenticated ? <ResetPassword /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
        }
        />
        <Route path="/settings" 
        element={isAuthenticated && isOnboarded ? (
          <Layout showSidebar={true} >
            <SettingsPage />
          </Layout>
        ) : (
          <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
        )
      }
        />
        <Route path="/notification" 
        element={isAuthenticated && isOnboarded ? (
          <Layout showSidebar={true} >
            <NotificationsPage />
          </Layout>
        ) : (
          <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
        )
      }
        />
        <Route path="/friends" 
        element={isAuthenticated && isOnboarded ? (
          <Layout showSidebar={true} >
            <FriendsPage />
          </Layout>
        ) : (
          <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
        )
      }
        />
        <Route path="/call/:id" element={
          isAuthenticated && isOnboarded ? (
            <CallPage />
          ): (
            <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
          )
        } />
        <Route 
        path="/chat/:id" 
        element={
          isAuthenticated && isOnboarded ? (
            <Layout showSidebar={false} >
              <ChatPage />
            </Layout>
          ) : (
            <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
          )
        } 
        />
        <Route path="/onboarding" element={isAuthenticated ? (
          !isOnboarded ? (
            <OnboardingPage />
          ) : (
            <Navigate to="/" />
          )
        ) : (
          <Navigate to="/login" />
        )} />
      </Routes>
      <Toaster />
    </div>
  )
};

export default App