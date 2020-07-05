import os
import io
import pandas as pd
import cv2 as cv
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse
from typing import Optional

from aautomata.utils import save_file, delete_file, resize

from aautomata.plugins.preprocessor import BasePreprocessor
from aautomata.plugins.detector import BaseStateDetector, BaseTransitionDetector, BaseLabelDetector, BaseAlphabetDetector

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)


@app.post('/process-image')
async def preprocess_image(image: UploadFile = File(...),
                           min_radius: int = Form(...),
                           max_radius: int = Form(...),
                           quality: float = Form(...),
                           min_area: int = Form(...),
                           max_area: int = Form(...),
                           max_alpha: int = Form(...)):
    """Accepts an image and returns a processed version"""

    try:
        mime_type = image.content_type.split('/')[1]
        if not mime_type == 'jpeg' and not mime_type == 'png':
            raise(Exception('FileFormatError: Uploaded file is not a JPEG or PNG.'))

        path_to_img = os.path.join('aautomata/uploads', image.filename)

        save_file(path_to_img, image.file)

        src_img = cv.imread(path_to_img)

        # defines the greatest dimension an image can have
        MAX_IMAGE_SIZE = 1000  # measured in pixels
        resized_img = resize(src_img, MAX_IMAGE_SIZE)

        pre = BasePreprocessor.preprocess(resized_img)
        states = BaseStateDetector.detect(
            pre, min_radius, max_radius, quality, resized_img)
        transitions = BaseTransitionDetector.detect(pre, resized_img)
        pre_labels = BaseLabelDetector.detect(
            pre, min_area, max_area, resized_img)
        labels = BaseAlphabetDetector.detect(pre_labels, pre, max_alpha)

        _, img_encoding = cv.imencode(f'.{mime_type}', resized_img)

        return StreamingResponse(io.BytesIO(img_encoding.tobytes()), media_type=f'image/{mime_type}')
    except Exception as e:
        return {'error':  str(e)}
