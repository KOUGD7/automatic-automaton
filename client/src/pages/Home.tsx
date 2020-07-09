import React, { useState } from 'react';
import {
	IonContent,
	IonHeader,
	IonPage,
	IonTitle,
	IonToolbar,
	IonImg,
	IonCard,
	IonCardHeader,
	IonButton,
	IonCardContent,
	IonCardTitle,
	IonFab,
	IonFabButton,
	IonIcon,
	IonLabel,
} from '@ionic/react';

import { RouteComponentProps } from 'react-router';

import { camera, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { useCameraPhoto } from '../hooks/useCameraPhoto';
import useFileUpload from '../hooks/useFileUpload';

import './Home.css';

const Home: React.FC<RouteComponentProps> = props => {
	const [filePhoto, FileUpload] = useFileUpload();
	const { photo, takePhoto } = useCameraPhoto();
	const [tips, setTips] = useState<boolean>(true);
	const [content, setContent] = useState<boolean>(false);

	let hide_cam = false;
	let hide = true;

	if (photo || filePhoto) {
		hide_cam = true;
		hide = false;
		// setTips(false);
		// setContent(true);
	}

	const sendPhoto = () => {
		if (photo) {
			props.history.push('/alphabet', { photo: photo });
		} else {
			props.history.push('/alphabet', { photo: filePhoto });
		}
	};

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
						<IonCardTitle>
							Take a picture of your Deterministic Finite Automaton.
						</IonCardTitle>
						<IonCardContent>
							Ensure that you write the symbols of the alphabet in the bottom
							right corner of the drawing.
						</IonCardContent>
					</IonCardHeader>
				</IonCard>
				<IonCard>
					<IonCardHeader>
						<IonCardTitle>
							Image Capture Tips
							{/* <IonIcon className="ion-padding-start" icon={bulb} /> */}
							<IonIcon
								className="ion-padding-start ion-margin-start"
								icon={content ? chevronDownOutline : chevronUpOutline}
								hidden={tips}
								onClick={() => {
									if (content === true) setContent(false);
									else setContent(true);
								}}
								onTouchStartCapture={() => {
									if (content === true) setContent(false);
									else setContent(true);
								}}
							></IonIcon>
						</IonCardTitle>
					</IonCardHeader>
					<IonCardContent hidden={content}>
						Ensure image is focused and the lighting is good. <br />
						<br />
						Ensure states are as close to well formed circles as possible.{' '}
						<br />
						<br />
						Ensure the labels on transtion lines are clear and readable.
					</IonCardContent>
				</IonCard>
				<IonCard>
					{photo && <IonImg src={photo.base64 ?? photo.webviewPath} />}
					{filePhoto && <IonImg src={filePhoto.webviewPath} />}
				</IonCard>
				<FileUpload />
				<IonFab
					hidden={hide_cam}
					vertical="bottom"
					horizontal="center"
					slot="fixed"
				>
					<IonFabButton
						onClick={() => {
							takePhoto();
							setContent(true);
							setTips(false);
						}}
					>
						<IonIcon icon={camera} />
					</IonFabButton>
				</IonFab>

				<IonFab hidden={hide} vertical="bottom" horizontal="start" slot="fixed">
					<IonButton onClick={() => takePhoto()}>Retake</IonButton>
				</IonFab>

				<IonFab hidden={hide} vertical="bottom" horizontal="end" slot="fixed">
					<IonButton onClick={sendPhoto}>Continue</IonButton>
				</IonFab>
			</IonContent>
		</IonPage>
	);
};

export default Home;
