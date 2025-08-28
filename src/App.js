import React, { useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { setupIonicReact } from '@ionic/react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { store } from './store/store';
import { initializeAuth, logout } from './store/authSlice';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import AdminScreen from './components/AdminScreen';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Initialize Ionic with production-friendly settings
setupIonicReact({
  mode: 'ios', // Force iOS mode for consistency
  swipeBackEnabled: false,
  rippleEffect: false
});

// App Router Component
function AppRouter() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth state from localStorage on app start
    dispatch(initializeAuth());
  }, [dispatch]);

  // Fix for production aria-hidden issue
  useEffect(() => {
    const fixAriaHidden = () => {
      const routerOutlets = document.querySelectorAll('ion-router-outlet[aria-hidden="true"]');
      routerOutlets.forEach(outlet => {
        outlet.removeAttribute('aria-hidden');
      });
    };

    // Run immediately and also after navigation
    fixAriaHidden();
    const interval = setInterval(fixAriaHidden, 1000);

    return () => clearInterval(interval);
  }, []);

  // Debug: Log authentication state changes
  useEffect(() => {
    console.log('Authentication state changed:', { isAuthenticated, user: user?.username });
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    dispatch(logout());
    console.log('User logged out and tokens cleared');
  };

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet id="main">
          <Route 
            exact 
            path="/login" 
            render={() => 
              !isAuthenticated ? 
              <LoginScreen /> : 
              <Redirect to={user?.role === 'admin' ? "/admin" : "/home"} />
            } 
          />
          <Route 
            exact 
            path="/home" 
            render={() => 
              isAuthenticated ? 
              <HomeScreen user={user} onLogout={handleLogout} /> : 
              <Redirect to="/login" />
            } 
          />
          <Route 
            exact 
            path="/admin" 
            render={() => 
              isAuthenticated && user?.role === 'admin' ? 
              <AdminScreen user={user} onLogout={handleLogout} /> : 
              <Redirect to="/login" />
            } 
          />
          <Route 
            exact 
            path="/" 
            render={() => <Redirect to={isAuthenticated ? (user?.role === 'admin' ? "/admin" : "/home") : "/login"} />} 
          />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

// Main App Component with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
