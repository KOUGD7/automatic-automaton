import cv2 as cv
import numpy as np
from numpy import ndarray

from core.model.preprocessor import Preprocessor


class BasePreprocessor(Preprocessor):

    @staticmethod
    def smooth(img):
        """Use a bilateral filter to smooth the image while keeping edges sharp"""

        d, sigma_color, sigma_space = 7, 100, 100
        smooth = cv.bilateralFilter(img, d, sigma_color, sigma_space)
        return smooth

    @staticmethod
    def convert_to_grayscale(img):
        return cv.cvtColor(img, cv.COLOR_BGR2GRAY)

    @staticmethod
    def binarize(img):
        """Convert a grayscale image to black and white using adaptive thresholding"""

        max_value, block_size, C = 255, 11, 3
        return cv.adaptiveThreshold(
            img,
            max_value,
            cv.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv.THRESH_BINARY_INV,
            block_size,
            C)

    @staticmethod
    def close(img,
              kernel: ndarray = np.ones((2, 2), np.uint8),
              iterations: int = 1):
        """Perform a closing morphological transformation on the input image"""

        tmp = cv.dilate(img, kernel, iterations)
        return cv.erode(tmp, kernel, iterations)

    @staticmethod
    def preprocess(img):
        tmp = BasePreprocessor.smooth(img)
        tmp2 = BasePreprocessor.convert_to_grayscale(tmp)
        return BasePreprocessor.binarize(tmp2)
