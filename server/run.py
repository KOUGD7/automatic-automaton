import cv2 as cv
import numpy as np

from plugins.preprocessor import BasePreprocessor
from plugins.detector import BaseStateDetector, BaseTransitionDetector, BaseLabelDetector
from plugins.associator import BaseStateAssociator, BaseLabelAssociator


if __name__ == '__main__':
    img = cv.imread('uploads/t3.jpg')

    # base preprocessing
    res = BasePreprocessor.preprocess(img)

    cv.imshow('image', res)
    cv.waitKey(0)
    cv.destroyAllWindows()
