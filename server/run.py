import cv2 as cv
import numpy as np

from utils import resize

from plugins.preprocessor import BasePreprocessor
from plugins.detector import BaseStateDetector, BaseTransitionDetector, BaseLabelDetector
from plugins.associator import BaseStateAssociator, BaseLabelAssociator


if __name__ == '__main__':
    src = cv.imread('uploads/t1.jpg')

    MAX_IMAGE_SIZE = 1000
    img = resize(src, MAX_IMAGE_SIZE)

    res = BasePreprocessor.preprocess(img)
    # states = BaseStateDetector.detect(res, img)

    cv.imshow('image', res)
    cv.waitKey(0)
    cv.destroyAllWindows()
