import React from 'react';
import { IonPage, IonContent, IonButton, IonIcon, IonText } from '@ionic/react';
import { refreshOutline, bugOutline } from 'ionicons/icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <IonPage>
          <IonContent className="ion-padding" style={{ 
            textAlign: 'center', 
            paddingTop: '50px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 25%, #ffffff 50%, #f1f3f4 75%, #ffffff 100%)'
          }}>
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <IonIcon 
                icon={bugOutline} 
                style={{ 
                  fontSize: '4rem', 
                  color: 'var(--ion-color-danger)',
                  marginBottom: '20px'
                }} 
              />
              
              <h2 style={{ color: 'var(--ion-color-primary)' }}>
                Oops! Something went wrong
              </h2>
              
              <IonText color="medium">
                <p>The application encountered an unexpected error. Please try reloading the page.</p>
              </IonText>
              
              <IonButton 
                expand="block" 
                onClick={this.handleReload}
                style={{ marginTop: '20px' }}
              >
                <IonIcon icon={refreshOutline} slot="start" />
                Reload Application
              </IonButton>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details style={{ 
                  marginTop: '20px', 
                  textAlign: 'left',
                  background: '#f5f5f5',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}>
                  <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                    Error Details (Development Mode)
                  </summary>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {this.state.error && this.state.error.toString()}
                    <br />
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </IonContent>
        </IonPage>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
