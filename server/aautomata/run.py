import cv2 as cv
import numpy as np

from utils import resize

from plugins.preprocessor import BasePreprocessor
from plugins.detector import BaseStateDetector, BaseTransitionDetector, BaseLabelDetector
from plugins.associator import BaseStateAssociator, BaseLabelAssociator


if __name__ == '__main__':
    panel_name = 'Control Panel'
    cv.namedWindow(panel_name)

    src = cv.imread('uploads/t1.jpg')

    MAX_IMAGE_SIZE = 1000
    img = resize(src, MAX_IMAGE_SIZE)

    res = BasePreprocessor.preprocess(img)

    quality = 0.7
    min_radius = 50
    max_radius = 1000
    min_area = 0
    max_area = 1000
    results = BaseLabelDetector.detect(res, min_area, max_area)
    print(results)

    cv.imshow(panel_name, img)
    cv.waitKey(0)
    cv.destroyAllWindows()
