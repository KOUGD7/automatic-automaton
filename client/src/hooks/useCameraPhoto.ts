import { useState, useEffect } from 'react';
import { useCamera } from '@ionic/react-hooks/camera';
import { useFilesystem, base64FromPath } from '@ionic/react-hooks/filesystem';
import { useStorage } from '@ionic/react-hooks/storage';
import { isPlatform } from '@ionic/react';
import {
	CameraResultType,
	CameraSource,
	CameraPhoto,
	Capacitor,
	FilesystemDirectory,
} from '@capacitor/core';
import { Photo } from '../models';

const PHOTO_STORAGE = 'photos';

export function useCameraPhoto() {
	const { getPhoto } = useCamera();
	const { deleteFile, getUri, readFile, writeFile } = useFilesystem();
	const { get, set } = useStorage();

	const [photo, setPhoto] = useState<Photo>();

	useEffect(() => {
		const loadSaved = async () => {
			const photoString = await get('photo');
			const photoInStorage = (photoString
				? JSON.parse(photoString)
				: []) as Photo;
			// If running on the web...
			if (!isPlatform('hybrid')) {
				const file = await readFile({
					path: photoInStorage.filepath,
					directory: FilesystemDirectory.Data,
				});
				// Web platform only: Save the photoInStorage into the base64 field
				photoInStorage.base64 = `data:image/jpeg;base64,${file.data}`;
			}
			setPhoto(photoInStorage);
		};
	}, [photo, get, readFile]);

	const takePhoto = async () => {
		try {
			const cameraPhoto = await getPhoto({
				resultType: CameraResultType.Uri,
				source: CameraSource.Prompt,
				quality: 100,
				height: 480,
				width: 600,
			});

			const fileName = new Date().getTime() + '.jpeg';
			const savedFileImage = await savePicture(cameraPhoto, fileName);
			setPhoto(savedFileImage);

			if (isPlatform('hybrid')) {
				set(PHOTO_STORAGE, JSON.stringify(savedFileImage));
			} else {
				const photoCopy = { ...savedFileImage };
				delete photoCopy.base64;
				set(PHOTO_STORAGE, JSON.stringify(photoCopy));
			}

			// set(PHOTO_STORAGE,
			//   isPlatform('hybrid')
			//     ? JSON.stringify(newPhotos)
			//     : JSON.stringify(newPhotos.map(p => {
			//       // Don't save the base64 representation of the photo data,
			//       // since it's already saved on the Filesystem
			//       const photoCopy = { ...p };
			//       delete photoCopy.base64;
			//       return photoCopy;
			//   }))
			// );
		} catch (error) {
			console.log(error);
		}
	};

	const savePicture = async (
		photo: CameraPhoto,
		fileName: string
	): Promise<Photo> => {
		let base64Data: string;
		// "hybrid" will detect Cordova or Capacitor;
		if (isPlatform('hybrid')) {
			const file = await readFile({
				path: photo.path!,
			});
			base64Data = file.data;
		} else {
			base64Data = await base64FromPath(photo.webPath!);
		}
		const savedFile = await writeFile({
			path: fileName,
			data: base64Data,
			directory: FilesystemDirectory.Data,
		});

		if (isPlatform('hybrid')) {
			// Display the new image by rewriting the 'file://' path to HTTP
			// Details: https://ionicframework.com/docs/building/webview#file-protocol
			return {
				filepath: savedFile.uri,
				base64: base64Data,
				webviewPath: Capacitor.convertFileSrc(savedFile.uri),
			};
		} else {
			// Use webPath to display the new image instead of base64 since it's
			// already loaded into memory
			return {
				filepath: fileName,
				base64: base64Data,
				webviewPath: photo.webPath,
			};
		}
	};

	return {
		photo,
		takePhoto,
	};
}
