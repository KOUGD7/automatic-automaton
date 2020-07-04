import cv2 as cv
import numpy as np

from aautomata.utils import resize

from aautomata.plugins.preprocessor import BasePreprocessor
from aautomata.plugins.detector import BaseStateDetector, BaseTransitionDetector, BaseLabelDetector
from aautomata.plugins.associator import BaseStateAssociator, BaseLabelAssociator


if __name__ == '__main__':
    panel_name = 'Control Panel'
    cv.namedWindow(panel_name)

    src = cv.imread('aautomata/uploads/t1.jpg')

    MAX_IMAGE_SIZE = 1000
    img = resize(src, MAX_IMAGE_SIZE)

    res = BasePreprocessor.preprocess(img)

    quality = 0.7
    min_radius = 50
    max_radius = 1000
    min_area = 500
    max_area = 1000
    state_data = BaseStateDetector.detect(
        res, min_radius, max_radius, quality, img)
    transition_data = BaseTransitionDetector.detect(res, img)
    label_data = BaseLabelDetector.detect(res, min_area, max_area, img)

    print(state_data)
    print(transition_data)
    print(label_data)

    cv.imshow(panel_name, img)
    cv.waitKey(0)
    cv.destroyAllWindows()
