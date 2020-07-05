import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
      IonImg, IonCard, IonCardHeader, IonButton,
      IonCardSubtitle, IonCardTitle ,IonFab, IonFabButton, IonIcon } from '@ionic/react';

import { RouteComponentProps } from 'react-router';

import { camera } from 'ionicons/icons';
import { useCameraPhoto } from '../hooks/useCameraPhoto';

import './Home.css';

const Home: React.FC<RouteComponentProps> = (props) => {
  const { photo, takePhoto } = useCameraPhoto();
  let hide_cam = false ;
  let hide = true;

  if (photo) {
    hide_cam = true;
    hide = false;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Automatic Automaton</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">A A</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Take a picture of your Deterministic Finite Automaton.</IonCardTitle>
            <IonCardSubtitle>
              Ensure that you write the symbols of the alphabet in the
              bottom right corner of the drawing.
            </IonCardSubtitle>
          </IonCardHeader>
        </IonCard>
        <IonCard>
          
          { photo && <IonImg src={photo.base64 ?? photo.webviewPath} />}
        
        </IonCard>
          
        <IonFab hidden={hide_cam} vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => takePhoto() }>
            <IonIcon icon={camera} />
          </IonFabButton>
        </IonFab>

        <IonFab hidden={hide} vertical="bottom" horizontal="start" slot="fixed">
          <IonButton onClick={() => takePhoto() }>
            Retake
          </IonButton>
        </IonFab>

        <IonFab hidden={hide} vertical="bottom" horizontal="end" slot="fixed">
          <IonButton onClick={() => props.history.push('/alphabet', {photo: photo}) }>
            Continue
          </IonButton>
        </IonFab>
        
      </IonContent>
    </IonPage>
  );
};

export default Home;
