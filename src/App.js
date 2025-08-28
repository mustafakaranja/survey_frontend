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
import './App.css';

// Initialize Ionic
setupIonicReact();

function AppRouter() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth state from localStorage on app start
    dispatch(initializeAuth());
  }, [dispatch]);

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

function App() {
  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  );
}

export default App;
