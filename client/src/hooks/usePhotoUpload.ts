import { Photo, RectCoords, Coords } from '../models';
import API from '../api.js';

export function usePhotoUpload(): {
	prepareForm(
		photo: Photo,
		coords: RectCoords,
		min_radius: number,
		max_radius: number,
		min_area: number,
		max_area: number,
		quality: number,
		max_alpha: number
	): Promise<FormData>;
} {
	const prepareForm = async (
		photo: Photo,
		coords: any,
		min_radius: number,
		max_radius: number,
		min_area: number,
		max_area: number,
		quality: number,
		max_alpha: number
	) => {
		const formData = new FormData();
		const imgBlob = await convertToBlob(photo);

		formData.append('image', imgBlob, photo.filepath);
		const coordList: Coords[] = Object.keys(coords).map(coord => coords[coord]);
		formData.append('alphabet', JSON.stringify(coordList));
		formData.append('min_radius', min_radius.toString());
		formData.append('max_radius', max_radius.toString());
		formData.append('min_area', min_area.toString());
		formData.append('max_area', max_area.toString());
		formData.append('quality', quality.toString());
		formData.append('max_alpha', max_alpha.toString());
		// const data = await sendPhoto(formData);
		// return data.data;

		return formData;
	};

	const convertToBlob = async (photo: any) => {
		const blob = await fetch(photo.webviewPath).then(r => r.blob());
		return blob;
	};

	return {
		prepareForm,
	};
}
