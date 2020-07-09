import React, { useEffect, useState } from 'react';
import {
	IonPage,
	IonHeader,
	IonToolbar,
	IonTitle,
	IonContent,
	IonButton,
	IonButtons,
	IonIcon,
} from '@ionic/react';
import { GraphResponse, State, SimulationResponse } from '../models';
import API from '../api';
import data from '../assets/response.json';
import { close } from 'ionicons/icons';

interface SimulatorPage {
	photoName: string;
	closeModal(): void;
}

const stringsToTest = ['000000', '111111', '111101', '1111010', '010100'];

const Simulator: React.FC<SimulatorPage> = ({ photoName, closeModal }) => {
	const [root, setRoot] = useState<State>();
	const [stateList, setStateList] = useState<State[]>([]);
	const [testStrings, setTestStrings] = useState<string[]>(stringsToTest);
	const [simResponses, setSimResponses] = useState<SimulationResponse[]>([]);

	useEffect(() => {
		// send api call
		(async () => {
			const resp = await API.get('/associate-features/' + photoName);
			const graph: GraphResponse = resp.data;

			// const graph: GraphResponse = data;

			// convert resp into stateList
			let stateArr: State[] = graph.graph.map(g => {
				const { label, centre, radius, is_accepting, transitions } = g;
				return new State(label, centre, radius, is_accepting, transitions);
			});
			const rt = stateArr.find(st => st.label === graph.root);
			setRoot(rt);
			setStateList(stateArr);

			// draw states and transitions
		})();
	}, []);

	const runSimulation = () => {
		setSimResponses([]);
		let responses: SimulationResponse[] = [];
		testStrings.forEach(ts => {
			let simResp: SimulationResponse = simulateString(ts);
			responses.push(simResp);
		});
		setSimResponses(responses);
	};

	const simulateString = (testString: string): SimulationResponse => {
		const length = testString.length;
		/* possible outcomes
    string ends in an accept state -
    string ends in a non-accept state
    no more transitions and string didn't finish
    no more transitions and string finished in accept
    no more transitions and string didn't finish in accept state*/

		let currentState: any = root; // used any instead of state to silence typescript
		console.log('We start at: ', currentState.label);
		for (let index = 0; index < testString.length; index++) {
			let transitionBit = testString[index];
			console.log('Next bit: ', transitionBit);
			let next = currentState.next(transitionBit, stateList);
			console.log('New state: ', next);

			if (next === -1) {
				// no transitions
				if (length - (index + 1) > 0) {
					// check if there are more bits to process, therefore fail
					return { was_accepted: false, stop_state: currentState.label };
				} else if (!currentState.is_accepting) {
					// no more bits to process
					return { was_accepted: false, stop_state: currentState.label };
				} else {
					return { was_accepted: true };
				}
			} else {
				currentState = stateList.find(s => s.label === next);
				// have more states to traverse
				// check if string is finished
				if (length - (index + 1) > 0) {
					console.log('more bits to go!');
					//have string left
				} else if (currentState.is_accepting) {
					// no string left
					return { was_accepted: true };
				} else {
					return { was_accepted: false, stop_state: currentState.label };
				}
			}
		}
		return { was_accepted: false, stop_state: currentState.label };
	};

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Simulator</IonTitle>
					<IonButtons slot="primary">
						<IonButton onClick={closeModal}>
							<IonIcon slot="icon-only" icon={close}></IonIcon>
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<div>
					<h2>Results</h2>
					<ul>
						{simResponses.map((sr, index) => (
							<li key={index}>
								{index}: {sr.was_accepted ? 'Passed!' : 'Failed'}{' '}
								{!sr.was_accepted ? `at state ${sr.stop_state}` : ''}
							</li>
						))}
					</ul>
				</div>
				<IonButton onClick={runSimulation}>Run SImulation</IonButton>
			</IonContent>
		</IonPage>
	);
};

export default Simulator;
