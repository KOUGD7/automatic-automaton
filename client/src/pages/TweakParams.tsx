import React, { useEffect, useState } from 'react';
import useSliders from '../hooks/useSliders';
import API from '../api';
import { Photo, RectCoords } from '../models';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import {
	IonItem,
	IonRange,
	IonLabel,
	IonCard,
	IonButton,
	IonPage,
	IonHeader,
	IonToolbar,
	IonButtons,
	IonBackButton,
	IonTitle,
	IonContent,
	IonFooter,
	IonList,
	IonListHeader,
} from '@ionic/react';
import { send } from 'ionicons/icons';

interface TweakParamsProps {
	photo: Photo;
	rectCoords: RectCoords;
}

const TweakParams: React.FC<TweakParamsProps> = ({ photo, rectCoords }) => {
	const [maxArea, minArea, AreaSliders] = useSliders('Area');
	const [maxRadius, minRadius, RadiusSliders] = useSliders('Radius');
	const [quality, setQuality] = useState(0);
	const [maxAlpha, setMaxAlpha] = useState(0);

	const { startUpload } = usePhotoUpload();

	const sendPhoto = () => {
		startUpload(
			photo,
			rectCoords,
			minRadius,
			maxRadius,
			minArea,
			maxArea,
			quality,
			maxAlpha
		);
	};

	useEffect(() => {
		console.log('created tweak params');
	}, []);
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton />
					</IonButtons>
					<IonTitle>Select Alphabet</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding">
				<IonCard>
					<img
						src={photo.base64 ?? photo.webviewPath}
						alt="Image to be processed"
					/>
				</IonCard>
				<AreaSliders />
				<RadiusSliders />
				<IonList>
					<IonListHeader>Quality</IonListHeader>
					<IonItem>
						<IonRange
							min={0}
							max={1}
							step={0.1}
							pin={true}
							value={quality}
							onIonChange={e => setQuality(e.detail.value as number)}
						>
							<IonLabel slot="start">Quality</IonLabel>
							<IonLabel slot="end">{quality}</IonLabel>
						</IonRange>
					</IonItem>
				</IonList>
				<IonList>
					<IonListHeader>Max Alpha</IonListHeader>
					<IonItem>
						<IonRange
							min={0}
							max={1000}
							step={1}
							pin={true}
							value={maxAlpha}
							onIonChange={e => setMaxAlpha(e.detail.value as number)}
						>
							<IonLabel slot="start">Max Alpha</IonLabel>
							<IonLabel slot="end">{maxAlpha}</IonLabel>
						</IonRange>
					</IonItem>
				</IonList>
			</IonContent>
			<IonFooter>
				<IonButton expand="full" onClick={sendPhoto}>
					Send Image
				</IonButton>
			</IonFooter>
		</IonPage>
	);
};

export default TweakParams;
