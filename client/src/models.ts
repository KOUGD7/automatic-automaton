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
	private _is_root: boolean = false;
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

	set is_root(bool: boolean) {
		this.is_root = bool;
	}

	get is_root() {
		return this._is_root;
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
		if (this.transitions.hasOwnProperty(transitionBit)) {
			// i can:  find whre it leads
			graphArr.forEach(state => {
				if (state.label === this.transitions[transitionBit]) {
					return this.transitions[transitionBit];
				}
			});
		}
		// i can't:  return false
		return -1;
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
