import React, { useEffect, useState } from 'react';
import {
	IonPage,
	IonHeader,
	IonToolbar,
	IonTitle,
	IonContent,
} from '@ionic/react';
import { GraphResponse, State, SimulationResponse } from '../models';
import API from '../api';

interface SimulatorPage {
	photoName: string;
}

const Simulator: React.FC<SimulatorPage> = ({ photoName }) => {
	const [root, setRoot] = useState<State>();
	const [stateList, setStateList] = useState<State[]>([]);
	const [testStrings, setTestStrings] = useState<string[]>([]);
	const [simResponses, setSimResponses] = useState<SimulationResponse[]>([]);

	useEffect(() => {
		// send api call
		(async () => {
			const resp = await API.get('/associate-features/' + photoName);
			const graph: GraphResponse = resp.data;

			// convert resp into stateList
			let stateArr: State[] = graph.graph.map(g => {
				const { label, centre, radius, is_accepting, transitions } = g;
				return new State(label, centre, radius, is_accepting, transitions);
			});
			const rt = stateArr.find(st => st.is_root);
			// setRoot(rt);
			setStateList(stateArr);

			// draw states and transitions
		})();
	}, []);

	const runSimulation = () => {
		testStrings.forEach(ts => {
			let simResp: SimulationResponse = simulateString(ts);
			setSimResponses([...simResponses, simResp]);
		});
	};

	const simulateString = (testString: string): SimulationResponse => {
		const length = testString.length;
		/* possible outcomes
    string ends in an accept state -
    string ends in a non-accept state
    string doesn't end but no transitions to make */

		let currentState: any = root; // used any instead of state to silence typescript
		let nextStateLabel: number;
		for (let index = 0; index < testString.length; index++) {
			let transitionBit = testString[index];
			let next = currentState.next(transitionBit, stateList);
			if (next === -1) {
				// end in state
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
				// have more states to traverse
				currentState = stateList.find(s => s.label === next);
			}
		}
		return { was_accepted: false, stop_state: currentState };
	};

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
