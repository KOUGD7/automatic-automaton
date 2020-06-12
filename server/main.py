import os
import io
import cv2 as cv
from fastapi import FastAPI, File, UploadFile, WebSocket
from starlette.responses import StreamingResponse

from utils import save_file, delete_file, resize

from plugins.preprocessor import BasePreprocessor

app = FastAPI()

workingImgTbl = {}


@app.post('/preprocess-image')
async def preprocess_image(image: UploadFile = File(...)):
    """Accept an image and return a preprocessed version"""

    try:
        mime_type = image.content_type.split('/')[1]
        if not mime_type == 'jpeg' and not mime_type == 'png':
            raise(Exception('FileFormatError: Uploaded file is not a JPEG or PNG.'))

        path_to_img = os.path.join('uploads', image.filename)

        save_file(path_to_img, image.file)

        src_img = cv.imread(path_to_img)

        MAX_IMAGE_SIZE = 1000
        resized_img = resize(src_img, MAX_IMAGE_SIZE)

        preprocessed_img = BasePreprocessor.preprocess(resized_img)
        _, img_encoding = cv.imencode(f'.{mime_type}', preprocessed_img)

        if image.filename in workingImgTbl:
            raise(Exception("DuplicateNameError: Image name already exists."))

        workingImgTbl[image.filename] = preprocessed_img

        return StreamingResponse(io.BytesIO(img_encoding.tobytes()), media_type=f'image/{mime_type}')
    except Exception as e:
        return {'error':  str(e)}


@app.websocket('/process-image')
async def process_image_ws(websocket: WebSocket):
    """Process the image in real-time as users adjust sliders clientside"""
    pass
