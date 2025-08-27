import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon
} from '@ionic/react';
import { 
  logOutOutline,
  settingsOutline
} from 'ionicons/icons';
import AdminPanelIonic from './AdminPanelIonic';

const AdminScreen = ({ user, onLogout }) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonIcon icon={settingsOutline} slot="start" style={{ marginLeft: '16px' }} />
          <IonTitle>Admin Dashboard - {user?.username}</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={onLogout}>
              <IonIcon icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <AdminPanelIonic />
      </IonContent>
    </IonPage>
  );
};

export default AdminScreen;
