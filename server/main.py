import os
import io
import pandas as pd
import cv2 as cv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse
from typing import Optional

from aautomata.utils import save_file, delete_file, resize

from aautomata.plugins.preprocessor import BasePreprocessor
from aautomata.plugins.detector import BaseStateDetector, BaseTransitionDetector, BaseLabelDetector

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

working_img_tbl = {}


@app.post('/preprocess-image')
async def preprocess_image(image: UploadFile = File(...)):
    """Accept an image and return a preprocessed version"""

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

        preprocessed_img = BasePreprocessor.preprocess(resized_img)
        _, img_encoding = cv.imencode(f'.{mime_type}', preprocessed_img)

        if image.filename in working_img_tbl:
            raise(Exception("DuplicateNameError: Image name already exists."))

        working_img_tbl[image.filename] = preprocessed_img

        return StreamingResponse(io.BytesIO(img_encoding.tobytes()), media_type=f'image/{mime_type}')
    except Exception as e:
        return {'error':  str(e)}


@app.post('/detect-states/{image_filename}')
async def detect_states(image_filename: str, quality: float = 0, min_radius: int = 0, max_radius=1000):
    """Detect the states in an image"""

    try:
        if image_filename not in working_img_tbl:
            raise(Exception("KeyError: No image with this filename exists."))

        img = working_img_tbl[image_filename]
        states = BaseStateDetector.detect(
            img, min_radius, max_radius, quality)

        return {'states': pd.Series(states).to_json(orient='values')}

    except Exception as e:
        return {'error': str(e)}


@app.post('/detect-transitions/{image_filename}')
async def detect_transitions(image_filename: str):
    """Detect the transition arrows in an image"""

    try:
        if image_filename not in working_img_tbl:
            raise(Exception("KeyError: No image with this filename exists."))

        img = working_img_tbl[image_filename]
        transitions = BaseTransitionDetector.detect(img)

        return {'transitions': transitions}

    except Exception as e:
        return {'error': str(e)}


@app.post('/detect-labels/{image_filename}')
async def detect_labels(image_filename: str, parameterForm):
    """Detect the state labels in an image"""

    try:
        if image_filename not in working_img_tbl:
            raise(Exception("KeyError: No image with this filename exists."))

        img = working_img_tbl[image_filename]

        min_area = parameterForm.min_area
        max_area = parameterForm.max_area

        labels = BaseLabelDetector.detect(img, min_area, max_area)

        return {'labels': labels}

    except Exception as e:
        return {'error': str(e)}


@app.post('/detect-all-features/{image_filename}')
async def detect_all_features(image_filename: str, parameterForm):
    """Detect the states, transitions and labels in an image"""

    try:
        if image_filename not in working_img_tbl:
            raise(Exception("KeyError: No image with this filename exists."))

        img = working_img_tbl[image_filename]

        quality = parameterForm.quality
        min_radius = parameterForm.min_radius
        max_radius = parameterForm.max_radius
        min_area = parameterForm.min_area
        max_area = parameterForm.max_area

        states = BaseStateDetector.detect(img, min_radius, max_radius, quality)
        transitions = BaseTransitionDetector.detect(img)
        labels = BaseLabelDetector.detect(img, min_area, max_area)

        # return either the coordinates of everything or just the image itself
        return {'states': states, 'transitions': transitions, 'labels': labels}

        # return StreamingResponse(io.BytesIO(img_encoding.tobytes()), media_type=f'image/jpeg')
    except Exception as e:
        return {'error': str(e)}
