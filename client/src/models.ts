export interface Photo {
	filepath: string;
	webviewPath?: string;
	base64: string;
}

export interface RectCoords {
	topR: Coords;
	topL: Coords;
	bottomR: Coords;
	bottomL: Coords;
}

export interface Coords {
	x: number;
	y: number;
}

export interface SimulationResponse {
	was_accepted: boolean;
	stop_state?: number;
}

export interface GraphResponse {
	root: number;
	graph: Graph[];
}

export interface Transitions {
	[label: number]: number;
}

export interface Graph {
	label: number;
	centre: number[];
	radius: number;
	is_accepting: boolean;
	transitions: Transitions;
}

export class State {
	label: number;
	centre: number[];
	radius: number;
	is_accepting: boolean;
	transitions: Transitions;

	constructor(
		label: number,
		centre: number[],
		radius: number,
		is_accepting: boolean,
		transitions: Transitions
	) {
		this.label = label;
		this.centre = centre;
		this.radius = radius;
		this.is_accepting = is_accepting;
		this.transitions = transitions;
	}

	/**
	 * This method checks for the next state to move to and returns its
	 * corresponding label. If none is found, it returns -1.
	 * @param transitionBit the bit of the string to transition on next
	 * @param graphArr the array of states
	 */
	next(transitionBitString: string, graphArr: State[]): number {
		// check if i can transition on the bit

		let transitionBit = parseInt(transitionBitString, 10);
		let nextState = -1;
		if (this.transitions.hasOwnProperty(transitionBit)) {
			// i can:  find whre it leads
			graphArr.forEach(state => {
				if (state.label === this.transitions[transitionBit]) {
					nextState = this.transitions[transitionBit];
					// return this.transitions[transitionBit];
				}
			});
		}
		// i can't:  return false
		return nextState;
	}

	// next2(testString: string, graphArr: State[]) {
	// 	let transitionBit = parseInt(testString[0], 10);
	// 	// check if i can transition on the bit
	// 	if (this.transitions.hasOwnProperty(transitionBit)) {
	// 		// i can:  find whre it leads
	// 		graphArr.forEach(state => {
	// 			if (state.label === this.transitions[transitionBit]) {
	// 				return state.next2(testString.slice(1), graphArr);
	// 			}
	// 		});
	// 	}
	// 	// i can't:  return false
	// 	return -1;
	// }
}
