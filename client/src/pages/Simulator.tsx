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
	IonItem,
	IonTextarea,
} from '@ionic/react';
import { GraphResponse, State, SimulationResponse } from '../models';
import API from '../api';
import data from '../assets/response.json';
import { close } from 'ionicons/icons';
import Sketch from 'react-p5';

interface SimulatorPage {
	photoName: string;
	closeModal(): void;
}

const stringsToTest = ['000000', '111111', '111101', '1111010', '010100'];

const Simulator: React.FC<SimulatorPage> = ({ photoName, closeModal }) => {
	const [root, setRoot] = useState<State>();
	const [stateList, setStateList] = useState<State[]>([]);
	const [strInput, setStrInput] = useState<string>('');
	const [testStrings, setTestStrings] = useState<string[]>(stringsToTest);
	const [simResponses, setSimResponses] = useState<SimulationResponse[]>([]);
	const [drawnStates, setDrawnStates] = useState<any[]>([]);

	useEffect(() => {
		// send api call
		(async () => {
			// const resp = await API.get('/associate-features/' + photoName);
			// const graph: GraphResponse = resp.data;

			const graph: GraphResponse = data;

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

	const setup = async (p5: any, canvasParentRef: any) => {
		let width = window.innerWidth;
		let height = Math.round(window.innerHeight / 2);
		const labelOffset: number = 9;

		p5.createCanvas(width, height).parent(canvasParentRef);

		// stateList.forEach(state => {
		// 	state.draw();
		// });

		let newArr: P5State[] = stateList.map(s => {
			const { label, centre, is_accepting, radius } = s;
			const isStartState = root?.label === label;
			return new P5State(
				p5,
				label,
				centre[0],
				centre[1],
				radius,
				isStartState,
				is_accepting
			);
		});
		setDrawnStates(newArr);
		newArr.forEach(s => s.draw());

		class P5State {
			isAccepting: boolean = false;
			isStartState: boolean = false;
			label: string = '';
			x: number = 0;
			y: number = 0;
			radius: number = 0;
			center: any = null;
			p5: any = null;

			constructor(
				p5: any,
				label: any,
				x: any,
				y: any,
				radius: any,
				isStartState: any,
				isAccepting: any
			) {
				this.isAccepting = isAccepting;
				this.isStartState = isStartState;
				this.label = label;
				this.center = p5.createVector(x, y);
				this.radius = radius;
				this.p5 = p5;
			}

			draw() {
				// draws the arrow
				const { x, y } = this.center;
				const arrowWidth = 7;
				if (this.isStartState) {
					this.p5.push();
					this.p5.fill(51);
					let start = x - this.radius;
					this.p5.line(x - this.radius * 2, y, start, y);
					this.p5.triangle(
						start,
						y,
						start - arrowWidth,
						y - arrowWidth,
						start - arrowWidth,
						y + arrowWidth
					);
					this.p5.pop();
				}
				this.p5.circle(x, y, this.radius * 2);

				if (this.isAccepting) {
					// draw inner circle
					this.p5.circle(x, y, (this.radius - 5) * 2);
				}

				this.p5.text(this.label, x - labelOffset, y + labelOffset);
			}
		}
	};

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

	const addTestStrings = () => {
		console.log(strInput?.split('\n'));

		setTestStrings(old => old.concat(strInput.split('\n')));
		setStrInput('');
	};

	const onDeleteString = (index: number) => {
		let remaining = [...testStrings];
		remaining.splice(index, 1);
		setTestStrings(remaining);
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
			<IonContent className="ion-padding">
				<section>
					<h2>sketch</h2>
					<Sketch setup={setup} />
				</section>
				<section>
					<h2>Results</h2>
					<ul>
						{simResponses.map((sr, index) => (
							<li key={index}>
								{index}: {sr.was_accepted ? 'Passed!' : 'Failed'}{' '}
								{!sr.was_accepted ? `at state ${sr.stop_state}` : ''}
							</li>
						))}
					</ul>
				</section>
				<section>
					<h2>Inputs</h2>
					<ul>
						{testStrings.map((ts, index) => (
							<li key={index}>
								{index}: {ts}{' '}
								<button onClick={() => onDeleteString(index)}>x</button>
							</li>
						))}
					</ul>
					<IonItem>
						<IonTextarea
							placeholder="Enter more information here..."
							rows={5}
							value={strInput}
							onIonChange={e => setStrInput(e.detail.value!)}
						></IonTextarea>
					</IonItem>
					<IonButton expand="block" onClick={addTestStrings}>
						Add list
					</IonButton>
					<IonButton expand="block" onClick={() => setTestStrings([])}>
						Clear All
					</IonButton>
				</section>
				<IonButton expand="block" fill="outline" onClick={runSimulation}>
					Run SImulation
				</IonButton>
			</IonContent>
		</IonPage>
	);
};

export default Simulator;
