import React from 'react';
import {
	IonPage,
	IonHeader,
	IonToolbar,
	IonTitle,
	IonContent,
} from '@ionic/react';

import Sketch from 'react-p5';
// import p5 from 'p5';
// import { push, triangle } from 'ionicons/icons';
// import { Circle } from 'react-konva';

const Simulator: React.FC = () => {
	const data = {
		"root": -6090941084780165905,
		"graph":
		{
			"-8713964759037968320":
			{
				"radius": 26,
				"centre": [221,160],
				"label": [1,[[214,153],[226,168]]],
				"is_accepting": true,
				"transitions":
				{
					"1": -5161370380409571927,
					"0": 712327553065268155
				}
			},
			"4620850186559230695":
			{
				"radius": 27,
				"centre": [282,60],
				"label": [0,[[272,53],[286,68]]],
				"is_accepting": true,
				"transitions":
				{
					"1": -8713964759037968320,
					"0": 4620850186559230695
				}
			},
			"712327553065268155":
			{
				"radius": 27,
				"centre": [181,44],
				"label": [0,[[175,37],[188,56]]],
				"is_accepting": false,
				"transitions":
				{
					"1": -8713964759037968320,
					"0": 4620850186559230695
				}
			},
			"-5161370380409571927":
			{
				"radius": 26,
				"centre": [115,140],
				"label": [0,[[107,135],[120,153]]],
				"is_accepting": false,
				"transitions":
				{
					"1": -5161370380409571927,
					"0": 712327553065268155
				}
			},
			"-6090941084780165905":
			{
				"radius": 22,
				"centre": [76,38],
				"label": [0,[[69,32],[82,47]]],
				"is_accepting": false,
				"transitions":
				{
					"1": -5161370380409571927,
					"0": 712327553065268155
				}
			}
		}
	}

	const labelOffset: number = 9;
	const states: any = [];
	const transitions: any  = [];

	const isTheReverse = (a: any, b: any) => {
		return a.source === b.destination && a.destination === b.source;
	}

	const setup = async (p5: any, CanvasParentRef: any) => {
		let width = window.innerWidth;
		let height = Math.round(window.innerHeight / 2);

		p5.createCanvas(width, height).parent(CanvasParentRef);

		// console.log(data);
		// console.log(data.graph);

		let root = data.root;
		let graph = data.graph;

		// console.log(root);

		Object.entries(graph).forEach(s => {
			if (s[0] === root.toString()) {
				states.push(new State(p5, s[0], s[1].centre[0], s[1].centre[1], s[1].radius, true, s[1].is_accepting));
			}
			else {
				states.push(new State(p5, s[0], s[1].centre[0], s[1].centre[1], s[1].radius, false, s[1].is_accepting));
			}
			Object.entries(s[1].transitions).forEach(t => {
				transitions.push(new Transition(p5, t[0], s[0], t[1].toString()));
				console.log(transitions);
			})
		});

		transitions.forEach((t1: any) => {
			transitions.forEach((t2: any) => {
			  if (!t1.isReverse && isTheReverse(t1, t2)) {
				t2.isReverse = true;
			  }
			})
		});

		// draw the states and transitons
		transitions.forEach((t: Transition) => t.draw());
		states.forEach((s: State) => s.draw());
		
	};

	class State {
		isAccepting: boolean = false;
		isStartState: boolean = false;
		name: string = "";
		x: number = 0;
		y: number = 0;
		radius: number = 0;
		center: any = null;
		p5: any = null;

		constructor(p5:any, name: any, x: any, y: any, radius: any, isStartState: any, isAccepting: any) {
			this.isAccepting = isAccepting;
			this.isStartState = isStartState;
			this.name = name;
			this.center = p5.createVector(x,y);
			this.radius = radius;
			this.p5 = p5;

		}

		draw() {
			// draws the arrow
			const {x, y} = this.center;
			const arrowWidth = 7;
			if (this.isStartState) {
				this.p5.push();
				this.p5.fill(51);
				let start = x - (this.radius);
				this.p5.line(x - this.radius*2, y, start, y);
				this.p5.triangle(start, y, start-arrowWidth, y-arrowWidth, start-arrowWidth, y+arrowWidth);
				this.p5.pop();
			}
			this.p5.circle(x, y, this.radius*2);

			if (this.isAccepting) {
				// draw inner circle
				this.p5.circle(x, y, (this.radius-5)*2);
			}
			  
			this.p5.text(this.name, x-labelOffset, y+labelOffset);

		}
	}

	/* 
	take an arbitrary line p1 p2
	translate it to the origin
	figure out what rotation makes it horizontal
	draw on the arrow head
	then invert the operation
	*/

	class Transition {
		label: string = "";
		source: string = "";
		destination: string = "";
		start: any = [];
		srcVector: any = "";
		destVector: any = "";
		destRadius: any = "";
		isReverse: boolean = false;
		distanceFromCenters: any = "";
		heading: any = "";
		p5: any = null;

		constructor(p5: any, label: any, source:any, destination: any) {
			this.label = label;
			this.source = source;
			this.destination = destination;
			this.start = [0,0]
			this.srcVector = null;
			this.destVector = null;
			this.destRadius = null;
		
			this.isReverse = false;
			this.distanceFromCenters = null;
			this.heading = null;
			this.p5 = p5;
		}
	
		/**
		 * Returns the midpoint as an array of length 2 with the fist index being
		 * x coordinate and the second being the corresponding y.
		 */
		get midpoint() {
			return [(this.srcVector.x + this.destVector.x)/2, (this.srcVector.y + this.destVector.y)/2]
		}
	
		drawArrow(vec0: any, vec1: any, myColor='black') {
			this.p5.push();
			this.p5.stroke(myColor);
			this.p5.fill(myColor);
			this.p5.push();
			this.p5.translate(vec0.x, vec0.y);
			this.p5.line(0, 0, vec1.x, vec1.y);
			this.p5.rotate(vec1.heading());
			let arrowSize = 7;
			this.p5.translate(vec1.mag() - arrowSize,0);
			this.p5.triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
			this.p5.pop();
			this.p5.pop();
		}
	
		draw() {
			// loop over the states to see if we can match their names to either the
			// source or destination of the label
			states.forEach((state: any) => {
				if (state.name === this.source && state.name === this.destination) {
					// self loop
					// get a point on the circumference
					let angle1 = Math.PI/2;
					let x1 = state.center.x + (state.radius) * Math.cos(angle1);
					let y1 = state.center.y + (state.radius) * Math.sin(angle1);
			
					// get another point on the circumference
					let angle2 = Math.PI/4;
					let x2 = state.center.x + (state.radius) * Math.cos(angle2);
					let y2 = state.center.y + (state.radius) * Math.sin(angle2);
					// line(x1, y1, x2, y2);
					// line(x1, y1 + 30, x2 + 20, y2 + 25);
					// control points are used to give body to the bezier curve
					let cp1x = x1;
					let cp1y = y1 + 30;
					let cp2x = x2 + 20;
					let cp2y = y2 + 25;
			
					this.p5.bezier(x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2)
					let midx = (cp2x + cp1x) / 2
					let midy = (cp2y + cp1y) / 2
					this.p5.text(this.label, midx, midy)
				
				} else if (state.name === this.source) {
					// check if there is another arrow between the states
					// let s = states.find(s => s.name  ===  this.destination);
					// if (s) this.repeatDest = state.center;
					this.srcVector = state.center;
		
				} else if (state.name === this.destination) {
					// check if there is another arrow between the states
					/* 
						1. loop through states to find a src and destination 
						2. if you find both, check if a case exists with the reverse
						if it does store to repeat dest and src 
						4. draw the circle
					*/
					// let s = states.find(s => s.name  ===  this.source);
					// let s2 = states.find(s => s.center  ===  this.destVector);
					
					this.destVector = state.center;
					this.destRadius = state.radius;
				}
			})
		
			if (this.srcVector && this.destVector) {
				console.log(this.isReverse);
				
				/*
				take 3 - get the displacement between the two circle centers then use it
				to create the vector from the center ot the src state to the centre of
				the dest state.
				*/
				let [x,y] = [this.destVector.x - this.srcVector.x, this.destVector.y - this.srcVector.y];
				const resultantVector = this.p5.createVector(x,y);
				
				/*  
				Calculate the scale factor to reduce the vector by, so it stops on
				the circumference of the circle
				*/
				let magnitude = resultantVector.mag();
				this.distanceFromCenters = magnitude;
				this.heading = resultantVector.heading();
		
				const scaleFactor = (magnitude - this.destRadius) / magnitude;
				resultantVector.mult(scaleFactor);
				if (!this.isReverse) {
					if (this.destVector && this.srcVector) {
						this.drawArrow(this.srcVector, resultantVector);
						this.p5.text(this.label, this.midpoint[0], this.midpoint[1] - labelOffset)
						// console.log('v', v);
						
						// text(this.label, v.x, v.y)
					}
				} else {
					// draw an arc
					const [x,y] = this.midpoint;
					this.p5.push();
					this.p5.noFill();
					this.p5.arc(x, y, this.distanceFromCenters, this.distanceFromCenters, this.heading, this.heading + Math.PI, this.p5.OPEN);
					this.p5.pop();
				}
				
			} else {
				console.error('Could not find any states to join the transition to');
			}
			
			// if (this.repeatDest && this.repeatSrc) {
		
			// 	const center = [(this.repeatSrc.x + this.repeatDest.x)/2, (this.repeatSrc.y + this.repeatDest.y)/2];
			// 	this.p5.circle(center[0], center[1], this.distanceFromCenters);
			// }
		}
	}

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Simulator</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<Sketch setup={setup} />
			</IonContent>
		</IonPage>
	);
};

export default Simulator;
