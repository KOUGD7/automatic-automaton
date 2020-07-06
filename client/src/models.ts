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
