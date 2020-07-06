import os
import io
import json
import pandas as pd
import numpy as np
import cv2 as cv
import uvicorn
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from starlette.responses import StreamingResponse
from typing import Optional

from aautomata.utils import save_file, delete_file, resize

from aautomata.plugins.preprocessor import BasePreprocessor
from aautomata.plugins.detector import BaseStateDetector, BaseTransitionDetector, BaseLabelDetector, BaseAlphabetDetector
from aautomata.plugins.associator import BaseAssociator

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

images = {}


@app.post('/process-image')
async def process_image(image: UploadFile = File(...),
                        min_radius: int = Form(...),
                        max_radius: int = Form(...),
                        quality: float = Form(...),
                        min_area: int = Form(...),
                        max_area: int = Form(...),
                        max_alpha: int = Form(...),
                        alphabet: str = Form(...)):
    """Accepts an image and returns a processed version"""

    try:
        mime_type = image.content_type.split('/')[1]
        if not mime_type == 'jpeg' and not mime_type == 'png':
            raise(Exception('FileFormatError: Uploaded file is not a JPEG or PNG.'))

        path_to_img = os.path.join('aautomata/uploads', image.filename)

        save_file(path_to_img, image.file)

        src_img = cv.imread(path_to_img)

        # extract the alphabet from the image using the
        # bounding box
        bounding_box = json.loads(alphabet)
        upper_corner = bounding_box[0]
        lower_corner = bounding_box[3]

        alphabet_img = src_img[int(upper_corner['x']): int(lower_corner['x']),
                               int(upper_corner['y']): int(lower_corner['y'])]

        # defines the greatest dimension an image can have
        MAX_IMAGE_SIZE = 1000  # measured in pixels
        resized_img = resize(src_img, MAX_IMAGE_SIZE)

        thresh, alpha_thresh = BasePreprocessor.preprocess(
            resized_img, alphabet_img)
        pre_labels = BaseLabelDetector.detect(
            thresh, min_area, max_area, resized_img)
        labels = BaseAlphabetDetector.detect(
            pre_labels, alpha_thresh, max_alpha, resized_img)

        thresh_copy = thresh.copy()
        states = BaseStateDetector.detect(
            thresh_copy, min_radius, max_radius, quality, resized_img)

        no_labels_img = pre_labels[2]

        mask = np.ones(thresh_copy.shape[:2], dtype='uint8') * 255
        state_contour = states[2]
        line_thickness = 5
        for contour in state_contour:
            cv.drawContours(mask, [contour], -1, 0, line_thickness)

        no_labels_img = cv.bitwise_and(no_labels_img, no_labels_img, mask=mask)

        _, transitions = BaseTransitionDetector.detect(thresh, resized_img)

        images[image.filename] = {
            'states': states,
            'transitions': transitions,
            'labels': labels
        }

        _, img_encoding = cv.imencode(f'.{mime_type}', resized_img)

        return StreamingResponse(io.BytesIO(img_encoding.tobytes()), media_type=f'image/{mime_type}')
    except Exception as e:
        print(e)
        return {'error':  str(e)}


@app.get('/associate-features/{image_filename}')
def associate_features(image_filename: str):
    """Associates the features of a given image and returns the built graph"""

    try:
        if image_filename not in images:
            raise(Exception('ImageNotFoundError: No image was found with this name.'))

        img = images[image_filename]

        root, graph = BaseAssociator.associated(
            img['states'], img['transitions'], img['labels'])

        return {'root': root, 'graph': graph}
    except Exception as e:
        return {'error': str(e)}


if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)
