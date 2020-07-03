import React from 'react';
import {
	IonPage,
	IonHeader,
	IonToolbar,
	IonTitle,
	IonContent,
} from '@ionic/react';

const Simulator = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Simulator</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<h1>simulator</h1>
			</IonContent>
		</IonPage>
	);
};

export default Simulator;
