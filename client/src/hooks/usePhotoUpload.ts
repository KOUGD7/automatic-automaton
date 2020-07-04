import { Photo } from '../models';
import API from '../api.js';

export function usePhotoUpload(): { startUpload(photo: Photo): void } {
	const startUpload = async (photo: Photo) => {
		const formData = new FormData();
		const imgBlob = await convertToBlob(photo);

		formData.append('image', imgBlob, photo.filepath);
		sendPhoto(formData);
	};

	const convertToBlob = async (photo: any) => {
		const blob = await fetch(photo.webviewPath).then(r => r.blob());
		return blob;
	};

	const sendPhoto = async (formData: FormData) => {
		let resp = await API.post('/preprocess-image', formData);
		console.log(resp);
	};

	return {
		startUpload,
	};
}
