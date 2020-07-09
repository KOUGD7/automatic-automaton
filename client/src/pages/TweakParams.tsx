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
	IonModal,
} from '@ionic/react';
import './TweakParams.css';
import Simulator from './Simulator';

interface TweakParamsProps {
	photo: Photo;
	rectCoords: RectCoords;
}

const TweakParams: React.FC<TweakParamsProps> = ({ photo, rectCoords }) => {
	const [img, setImg] = useState(photo.base64 ?? photo.webviewPath);
	const [sentFirstPic, setSentFirstPic] = useState(false);
	// const [maxArea, minArea, AreaSliders] = useSliders('Area');
	// const [maxRadius, minRadius, RadiusSliders] = useSliders('Radius');
	const [quality, setQuality] = useState(0);
	const [maxAlpha, setMaxAlpha] = useState(0);

	const [minArea, setMinArea] = useState(0);
	const [maxArea, setMaxArea] = useState(0);

	const [minRadius, setMinRadius] = useState(0);
	const [maxRadius, setMaxRadius] = useState(0);

	const [showModal, setShowModal] = useState(false);

	const { prepareForm } = usePhotoUpload();

	const sendPhoto = async () => {
		const formData: FormData = await prepareForm(
			photo,
			rectCoords,
			minRadius,
			maxRadius,
			minArea,
			maxArea,
			quality,
			maxAlpha
		);

		let resp = await API.post('/process-image', formData, {
			responseType: 'blob',
		});

		let blob: Blob = resp.data;

		let urlCreator = window.URL || window.webkitURL;
		let imgUrl = urlCreator.createObjectURL(blob);
		setImg(imgUrl);
		setSentFirstPic(true);
	};

	const closeModal = () => {
		setShowModal(false);
	};

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton />
					</IonButtons>
					<IonTitle>Tweak Parameter</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding">
				<IonCard>
					<img src={img} alt="Image to be processed" />
				</IonCard>
				{/* <AreaSliders />
				<RadiusSliders /> */}

				<IonList>
					<IonListHeader>Area</IonListHeader>
					<IonItem>
						<IonRange
							min={0}
							step={1}
							max={1000}
							value={maxArea}
							onIonChange={e => setMaxArea(e.detail.value as number)}
						>
							<IonLabel slot="start">Max:</IonLabel>
							<IonLabel slot="end">{maxArea}</IonLabel>
						</IonRange>
					</IonItem>
					<IonItem>
						<IonRange
							min={0}
							step={1}
							max={300}
							value={minArea}
							onIonChange={e => setMinArea(e.detail.value as number)}
						>
							<IonLabel slot="start">Min:</IonLabel>
							<IonLabel slot="end">{minArea}</IonLabel>
						</IonRange>
					</IonItem>
				</IonList>

				<IonList>
					<IonListHeader>Radius</IonListHeader>
					<IonItem>
						<IonRange
							min={0}
							step={1}
							max={1000}
							value={maxRadius}
							onIonChange={e => setMaxRadius(e.detail.value as number)}
						>
							<IonLabel slot="start">Max:</IonLabel>
							<IonLabel slot="end">{maxRadius}</IonLabel>
						</IonRange>
					</IonItem>
					<IonItem>
						<IonRange
							min={0}
							step={1}
							max={300}
							value={minRadius}
							onIonChange={e => setMinRadius(e.detail.value as number)}
						>
							<IonLabel slot="start">Min:</IonLabel>
							<IonLabel slot="end">{minRadius}</IonLabel>
						</IonRange>
					</IonItem>
				</IonList>

				<IonList>
					<IonListHeader>Other</IonListHeader>
					<IonItem>
						<IonRange
							min={0}
							max={1}
							step={0.01}
							value={quality}
							onIonChange={e => setQuality(e.detail.value as number)}
						>
							<IonLabel slot="start">Quality</IonLabel>
							<IonLabel slot="end">{quality}</IonLabel>
						</IonRange>
					</IonItem>

					<IonItem>
						<IonRange
							min={0}
							max={1000}
							step={1}
							value={maxAlpha}
							onIonChange={e => setMaxAlpha(e.detail.value as number)}
						>
							<IonLabel slot="start">Max Alpha</IonLabel>
							<IonLabel slot="end">{maxAlpha}</IonLabel>
						</IonRange>
					</IonItem>
				</IonList>
				<IonModal isOpen={showModal}>
					<Simulator closeModal={closeModal} photoName={photo.filepath} />
				</IonModal>
			</IonContent>
			<IonFooter>
				<IonButton
					expand="block"
					fill={sentFirstPic ? 'outline' : 'solid'}
					onClick={sendPhoto}
				>
					{sentFirstPic ? 'Tweak Image' : 'Send Photo'}
				</IonButton>
				<IonButton
					expand="block"
					fill="solid"
					onClick={() => setShowModal(true)}
				>
					Ready to Get Graph
				</IonButton>
			</IonFooter>
		</IonPage>
	);
};

export default TweakParams;
