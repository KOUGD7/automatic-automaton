import cv2 as cv
import numpy as np

from aautomata.utils import resize

from aautomata.plugins.preprocessor import BasePreprocessor
from aautomata.plugins.detector import BaseStateDetector, BaseTransitionDetector, BaseLabelDetector, BaseAlphabetDetector
from aautomata.plugins.associator import BaseAssociator


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
    max_alpha = 1000
    states = BaseStateDetector.detect(
        res, min_radius, max_radius, quality, img)
    transitions = BaseTransitionDetector.detect(res, img)
    pre_labels = BaseLabelDetector.detect(res, min_area, max_area, img)
    labels = BaseAlphabetDetector.detect(pre_labels, res, max_alpha)

    root = BaseAssociator.associate(states, transitions, labels)

    cv.imshow(panel_name, img)
    cv.waitKey(0)
    cv.destroyAllWindows()
