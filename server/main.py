import os
import cv2 as cv
from fastapi import FastAPI, File, UploadFile

from utils import save_file, delete_file

app = FastAPI()


@app.post('/process-image')
async def process_image(image: UploadFile = File(...)):
    """Accept an image and return a graph data structure"""

    try:
        mime_type = image.content_type.split('/')[1]
        if not mime_type == 'jpeg' and not mime_type == 'png':
            raise(Exception('Uploaded file is not a JPEG or PNG.'))

        path_to_img = os.path.join('uploads', image.filename)

        save_file(path_to_img, image.file)

        # TODO: image processing

        # delete the file from the server after processing
        # to save space
        delete_file(path_to_img)

        return {'filename': image.filename, 'msg': {'type': 'error', 'feedback': 'Successfully uploaded the image.'}}
    except Exception as e:
        return {'msg': {'type': 'error', 'feedback': str(e)}}
