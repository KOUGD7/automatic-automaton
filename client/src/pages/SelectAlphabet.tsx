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
	IonModal,
} from '@ionic/react';

import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';
import { Stage, Layer, Rect, Image } from 'react-konva';
import './SelectAlphabet.css';

import { RouteComponentProps } from 'react-router';
import { Photo, RectCoords } from '../models';

import TweakParams from './TweakParams';

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

const SelectAlphabet: React.FC<RouteComponentProps> = props => {
	const { photo } = props.location.state as RouterLocationState;
	const [image, setImage] = useState(new window.Image());
	const [imgDimensions, setImgDimensions] = useState<Dimensions>();
	const [showModal, setShowModal] = useState(false);
	const [rec, setRec] = useState<RecAttributes>({
		x: 5,
		y: 5,
		width: 100,
		height: 100,
		stroke: 'red',
	});

	const [recCoords, setRecCoords] = useState<RectCoords>({
		topR: { x: rec.x, y: rec.y },
		topL: { x: rec.x + rec.width, y: rec.y },
		bottomR: { x: rec.x, y: rec.y + rec.height },
		bottomL: { x: rec.x + rec.width, y: rec.y + rec.height },
	});

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

			let scaleX = rect.scaleX();
			let scaleY = rect.scaleY();
			rect.scaleX(1);
			rect.scaleY(1);

			let rw = Math.round(Math.max(5, rect.width() * scaleX));
			let rh = Math.round(Math.max(rect.height() * scaleY));

			if (rw < 5 || rh < 5 || rw > stage.width || rh > stage.height) {
				setRec({
					x: rec.x,
					y: rec.y,
					width: rec.width,
					height: rec.height,
					stroke: 'red',
				});
				setRecCoords({
					topR: { x: recCoords.topR.x, y: recCoords.topR.y },
					topL: { x: recCoords.topL.x, y: recCoords.topL.y },
					bottomR: { x: recCoords.bottomR.x, y: recCoords.bottomR.y },
					bottomL: { x: recCoords.bottomL.x, y: recCoords.bottomL.y },
				});
			} else {
				setRec({ x: x, y: y, width: rw, height: rh, stroke: 'red' });
				setRecCoords({
					topR: { x: x, y: y },
					topL: { x: x + rw, y: y },
					bottomR: { x: x, y: y + rh },
					bottomL: { x: x + rw, y: y + rh },
				});
			}

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

		// rect.on('dragmove', function () {
		// 	updateRect();
		// });

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

			let scaleX = rect.scaleX();
			let scaleY = rect.scaleY();
			rect.scaleX(1);
			rect.scaleY(1);

			let rw = Math.round(Math.max(5, rect.width() * scaleX));
			let rh = Math.round(Math.max(rect.height() * scaleY));

			if (rw < 5 || rh < 5 || rw > stage.width || rh > stage.height) {
				setRec({
					x: rec.x,
					y: rec.y,
					width: rec.width,
					height: rec.height,
					stroke: 'red',
				});
				setRecCoords({
					topR: { x: recCoords.topR.x, y: recCoords.topR.y },
					topL: { x: recCoords.topL.x, y: recCoords.topL.y },
					bottomR: { x: recCoords.bottomR.x, y: recCoords.bottomR.y },
					bottomL: { x: recCoords.bottomL.x, y: recCoords.bottomL.y },
				});
			} else {
				setRec({ x: x, y: y, width: rw, height: rh, stroke: 'red' });
				setRecCoords({
					topR: { x: x, y: y },
					topL: { x: x + rw, y: y },
					bottomR: { x: x, y: y + rh },
					bottomL: { x: x + rw, y: y + rh },
				});
			}

			layer.batchDraw();
		}
	};

	const handleDragMove = (evt: KonvaEventObject<DragEvent>) => {
		let rect = evt.currentTarget;
		let stage = evt.target.getLayer().getStage();

		let x = rect.x();
		let y = rect.y();

		let scaleX = rect.scaleX();
		let scaleY = rect.scaleY();
		rect.scaleX(1);
		rect.scaleY(1);

		let rw = Math.round(Math.max(5, rect.width() * scaleX));
		let rh = Math.round(Math.max(rect.height() * scaleY));

		if (rw < 5 || rh < 5 || rw > stage.width || rh > stage.height) {
			setRec({
				x: rec.x,
				y: rec.y,
				width: rec.width,
				height: rec.height,
				stroke: 'red',
			});
			setRecCoords({
				topR: { x: recCoords.topR.x, y: recCoords.topR.y },
				topL: { x: recCoords.topL.x, y: recCoords.topL.y },
				bottomR: { x: recCoords.bottomR.x, y: recCoords.bottomR.y },
				bottomL: { x: recCoords.bottomL.x, y: recCoords.bottomL.y },
			});
		} else {
			setRec({ x: x, y: y, width: rw, height: rh, stroke: 'red' });
			setRecCoords({
				topR: { x: x, y: y },
				topL: { x: x + rw, y: y },
				bottomR: { x: x, y: y + rh },
				bottomL: { x: x + rw, y: y + rh },
			});
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
								onDragMove={handleDragMove}
								onClick={handleRecClick}
								onTap={handleRecTap}
							/>
						</Layer>
					</Stage>
				</div>
				<IonModal isOpen={showModal}>
					<TweakParams photo={photo} rectCoords={recCoords} />
				</IonModal>
			</IonContent>
			<IonFooter>
				<IonButton expand="full" onClick={() => setShowModal(true)}>
					Send Photo
				</IonButton>
			</IonFooter>
		</IonPage>
	);
};

export default SelectAlphabet;
