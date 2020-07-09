import { Photo, RectCoords, Coords } from '../models';
import API from '../api.js';

export function usePhotoUpload() {
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

	const fileToBlob = async (file: any) => {
		return new Promise((res, rej) => {
			let reader = new FileReader();
			reader.readAsArrayBuffer(file);
			reader.onload = () => {
				let blob: Blob = new Blob(
					[new Uint8Array(reader.result as ArrayBuffer)],
					{
						type: 'image/jpeg',
					}
				);

				res(URL.createObjectURL(blob));
			};
			reader.onerror = () => rej();
		});
	};

	const fileToBase64 = async (file: any) => {
		return new Promise((res, rej) => {
			let reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				res(reader.result as string);
			};
			reader.onerror = () => rej();
		});
	};

	const convertToBlob = async (photo: any) => {
		const blob = await fetch(photo.webviewPath);
		console.log('blob: ', blob);

		const r = await blob.blob();
		console.log('r', r);

		return r;
	};

	return {
		prepareForm,
		fileToBase64,
		fileToBlob,
	};
}
