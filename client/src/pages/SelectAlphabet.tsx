import React, { useState, useEffect, useRef } from 'react';
import {
	IonContent,
	IonHeader,
	IonPage,
	IonTitle,
	IonToolbar,
	IonCard,
	IonCardHeader,
	IonButtons,
	IonBackButton,
	IonCardSubtitle,
	IonFooter,
	IonButton,
} from '@ionic/react';

import { Stage, Layer, Circle, Image } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';

import { RouteComponentProps } from 'react-router';
import { Photo } from '../models';
import './SelectAlphabet.css';
import API from '../api';

interface RouterLocationState {
	photo: Photo;
}

interface Dimensions {
	width: number;
	height: number;
}

interface Coordinates {
	x: number;
	y: number;
}

const SelectAlphabet: React.FC<RouteComponentProps> = props => {
	const { photo } = props.location.state as RouterLocationState;
	const [image, setImage] = useState(new window.Image());
	const [imgDimensions, setImgDimensions] = useState<Dimensions>();
	const [startCircleCoords, setStartCircleCoords] = useState<Coordinates>({
		x: 10,
		y: 10,
	});
	const [endCircleCoords, setEndCircleCoords] = useState<Coordinates>({
		x: 10,
		y: 40,
	});
	const radius = 10;

	const [recCoords, setRecCoords] = useState<Coordinates>({ x: 5, y: 5 });
	// const [recDimensions, setRecDimensions] = useState<Dimensions>({width: 100, height: 100});

	useEffect(() => {
		const img = new window.Image();
		if (photo) {
			img.src = photo.base64 ?? photo.webviewPath;
		} else {
			img.src = '';
		}
		img.onload = function () {
			setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
			setImage(img);
		};
	}, [photo]);

	const width = imgDimensions?.width;
	const height = imgDimensions?.height;

	const sendPhoto = async () => {
		const formData: FormData = new FormData();
		formData.append('image', photo.filepath);
		let resp = await API.post('/preprocess-image', formData);
		console.log(resp);
	};

	const handleClick = (evt: KonvaEventObject<MouseEvent>) => {
		const { clientX, clientY } = evt.evt;
		setRecCoords({ x: clientX - 45, y: clientY - 175 });
		console.log(clientX, clientY);
	};

	const handleTap = (evt: KonvaEventObject<TouchEvent>) => {
		console.log(evt.evt);
		const { clientX, clientY } = evt.evt.changedTouches[0];
		setRecCoords({ x: clientX - 45, y: clientY - 175 });
		//   console.log(clientX, clientY);
	};

	const handleDrag = (evt: any, ball: string) => {
		const { clientX, clientY } = evt.evt.changedTouches[0];
		console.log('drag stop', evt, clientX, clientY - 129);
		if (ball === 'start') {
			setStartCircleCoords({ x: clientX, y: clientY - 129 });
		} else {
			setEndCircleCoords({ x: clientX, y: clientY - 129 });
		}
	};

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
			<IonContent>
				<IonCard>
					<IonCardHeader>
						<IonCardSubtitle>
							Place the green dot at the top left corner of the list of symbols
							in your alphabet, and the red cirle at the bottom right corner.
						</IonCardSubtitle>
					</IonCardHeader>
				</IonCard>
				<div className="container flex">
					<Stage width={width} height={height}>
						{/* { photo && <img className="img" src={photo.base64 ?? photo.webviewPath} alt="deterministic finite automaton" height={`${height}`} width={`${width}`} />} */}
						<Layer>
							<Image
								image={image}
								// onClick={handleClick}
								// onTap={handleTap}
							/>
							<Circle
								x={startCircleCoords.x}
								y={startCircleCoords.y}
								radius={radius}
								fill="green"
								draggable
								onDragEnd={e => handleDrag(e, 'start')}
							/>
							<Circle
								x={endCircleCoords.x}
								y={endCircleCoords.y}
								radius={radius}
								fill="red"
								draggable
								onDragEnd={e => handleDrag(e, 'end')}
							/>
						</Layer>
					</Stage>
				</div>
			</IonContent>
			<IonFooter>
				<IonButton onClick={sendPhoto}>Send Photo</IonButton>
			</IonFooter>
		</IonPage>
	);
};

export default SelectAlphabet;
