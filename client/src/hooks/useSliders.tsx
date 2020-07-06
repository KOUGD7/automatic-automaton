import React, { useState } from 'react';
import {
	IonList,
	IonItem,
	IonRange,
	IonLabel,
	IonListHeader,
} from '@ionic/react';

const useSliders = (title: string): [number, number, React.FC] => {
	const [minValue, setMinValue] = useState(0);
	const [maxValue, setMaxValue] = useState(0);

	const SliderGroup = () => {
		return (
			<IonList>
				<IonListHeader>{title}</IonListHeader>
				<IonItem>
					<IonRange
						min={0}
						step={1}
						max={300}
						pin={true}
						value={maxValue}
						onIonChange={e => setMaxValue(e.detail.value as number)}
					>
						<IonLabel slot="start">Max:</IonLabel>
						<IonLabel slot="end">{maxValue}</IonLabel>
					</IonRange>
				</IonItem>
				<IonItem>
					<IonRange
						min={0}
						step={1}
						max={300}
						pin={true}
						value={minValue}
						onIonChange={e => setMinValue(e.detail.value as number)}
					>
						<IonLabel slot="start">Min:</IonLabel>
						<IonLabel slot="end">{minValue}</IonLabel>
					</IonRange>
				</IonItem>
			</IonList>
		);
	};

	return [maxValue, minValue, SliderGroup];
};

export default useSliders;
