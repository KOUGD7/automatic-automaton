import React, { useState, useEffect } from 'react';
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

import { Stage, Layer, Rect, Image } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';

import { RouteComponentProps } from 'react-router';
import { Photo } from '../models';
import './SelectAlphabet.css';
import Konva from 'konva';
import { usePhotoUpload } from '../hooks/usePhotoUpload';

interface RouterLocationState {
	photo: Photo;
}

interface Dimensions {
	width: number;
	height: number;
}

interface RecAttributes {
	x: number;
	y: number;
	width: number;
	height: number;
	stroke: string;
}

interface RectCoords {
	topR: {x: Number, y: Number};
	topL: {x: Number, y: Number};
	bottomR: {x: Number, y: Number};
	bottomL: {x: Number, y: Number};
}

const SelectAlphabet: React.FC<RouteComponentProps> = props => {
	const { photo } = props.location.state as RouterLocationState;
	const [image, setImage] = useState(new window.Image());
	const [imgDimensions, setImgDimensions] = useState<Dimensions>();
	const [rec, setRec] = useState<RecAttributes>({
		x: 5,
		y: 5,
		width: 100,
		height: 100,
		stroke: 'red',
	});
	const [recCoords, setCoords] = useState<RectCoords>({
		topR: {x: rec.x, y: rec.y},
		topL: {x: rec.x+rec.width, y: rec.y},
		bottomR: {x: rec.x, y: rec.y+rec.height},
		bottomL: {x: rec.x+rec.width, y: rec.y+rec.height}
	});

	const { startUpload } = usePhotoUpload();

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

	// const startUpload = () => {
	// 	file.resolveLocalFilesystemUrl(photo.filepath).then((entry: FileEntry) => {
	// 		entry.file(file => readFile(file));
	// 	}, console.error);
	// };

	// const readFile = (file: any) => {
	// 	const reader = new FileReader();
	// 	reader.onload = () => {
	// 		const formData = new FormData();
	// 		const imgBlob = new Blob([reader.result], {
	// 			type: file.type,
	// 		});
	// 		formData.append('image', imgBlob, file.name);
	// 		sendPhoto(formData);
	// 	};
	// };

	// const sendPhoto = async (formData: FormData) => {
	// 	let resp = await API.post('/preprocess-image', formData);
	// 	console.log(resp);
	// };

	const handleRecClick = (evt: KonvaEventObject<MouseEvent>) => {
		console.log('rectangle selected');

		let rect = evt.currentTarget;
		let layer = evt.target.getLayer();
		let tr = new Konva.Transformer();

		layer.add(tr);
		tr.nodes([rect]);

		layer.draw();

		rect.on('transformstart', function () {
			console.log('transform start');
		});

		rect.on('dragmove', function () {
			updateRect();
		});

		rect.on('transform', function () {
			updateRect();
			console.log('transform');
		});

		rect.on('transformend', function () {
			console.log('transform end');
		});

		// Deselects the rectangle by removing the rectangle from the transformer
		let stage = layer.getStage();

		stage.on('dblclick', function () {
			tr.nodes([]);
			layer.draw();
		});

		function updateRect() {
			let x = rect.x();
			let y = rect.y();
			let rw = Math.round(Math.max(5, rect.width() * rect.scaleX()));
			let rh = Math.round(Math.max(rect.height() * rect.scaleY()));
			setRec({ x: x, y: y, width: rw, height: rh, stroke: 'red' });
			setCoords({
				topR: {x: x, y: y},
				topL: {x: x+rw, y: y},
				bottomR: {x: x, y: y+rh},
				bottomL: {x: x+rw, y: y+rh}
			});

			layer.batchDraw();
		}
	};

	const handleRecTap = (evt: KonvaEventObject<TouchEvent>) => {
		console.log('rectangle selected');

		let rect = evt.currentTarget;
		let layer = evt.target.getLayer();
		let tr = new Konva.Transformer();

		layer.add(tr);
		tr.nodes([rect]);

		layer.draw();

		rect.on('transformstart', function () {
			console.log('transform start');
		});

		rect.on('dragmove', function () {
			updateRect();
		});

		rect.on('transform', function () {
			updateRect();
			console.log('transform');
		});

		rect.on('transformend', function () {
			console.log('transform end');
		});

		// Deselects the rectangle by removing the rectangle from the transformer
		let stage = layer.getStage();

		stage.on('dbltap', function () {
			tr.nodes([]);
			layer.draw();
		});

		function updateRect() {
			let x = rect.x();
			let y = rect.y();
			let rw = Math.round(Math.max(5, rect.width() * rect.scaleX()));
			let rh = Math.round(Math.max(rect.height() * rect.scaleY()));
			setRec({ x: x, y: y, width: rw, height: rh, stroke: 'red' });
			setCoords({
				topR: {x: x, y: y},
				topL: {x: x+rw, y: y},
				bottomR: {x: x, y: y+rh},
				bottomL: {x: x+rw, y: y+rh}
			});

			layer.batchDraw();
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
							Draw a box around the alphabet in the image
						</IonCardSubtitle>
					</IonCardHeader>
				</IonCard>
				<div className="container">
					<Stage width={width} height={height}>
						<Layer>
							<Image image={image} />
							<Rect
								name="rect"
								x={rec.x}
								y={rec.y}
								width={rec.width}
								height={rec.height}
								stroke="red"
								draggable={true}
								onClick={handleRecClick}
								onTap={handleRecTap}
							/>
						</Layer>
					</Stage>
				</div>
			</IonContent>
			<IonFooter>
				<IonButton onClick={() => startUpload(photo)}>Send Photo</IonButton>
			</IonFooter>
		</IonPage>
	);
};

export default SelectAlphabet;
