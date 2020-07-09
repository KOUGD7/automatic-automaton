import React, { useState } from 'react';
import { IonButton, IonLabel } from '@ionic/react';
import { Photo } from '../models';
import { usePhotoUpload } from './usePhotoUpload';

export function useFileUpload(): [Photo | null, React.FC] {
	const [photo, setPhoto] = useState<Photo | null>(null);
	const { fileToBase64, fileToBlob } = usePhotoUpload();

	const FileUpload = () => {
		const loadFromDevice = async (e: any) => {
			try {
				const file = e.target.files[0];
				let blobURL = await fileToBlob(file);
				let base64 = await fileToBase64(file);

				const fileName = new Date().getTime() + '.jpeg';
				let fPhoto: Photo = {
					webviewPath: blobURL as string,
					filepath: fileName,
					base64: base64 as string,
				};
				setPhoto(fPhoto);
			} catch (error) {}
		};
		return (
			<IonButton>
				<IonLabel slot="end">Upload Image</IonLabel>
				<input
					type="file"
					onChange={e => loadFromDevice(e)}
					id="file-input"
					accept="image/jpeg, image/png"
				/>
			</IonButton>
		);
	};

	return [photo, FileUpload];
}
export default useFileUpload;
