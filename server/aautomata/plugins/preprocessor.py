import cv2 as cv
import numpy as np
from numpy import ndarray

from aautomata.core.model.preprocessor import Preprocessor


class BasePreprocessor(Preprocessor):

    @staticmethod
    def smooth(img, d: int = 7, sigma_color: int = 100, sigma_space: int = 100):
        """Use a bilateral filter to smooth the image while keeping edges sharp"""

        try:
            smooth_img = cv.bilateralFilter(img, d, sigma_color, sigma_space)
            return smooth_img
        except Exception as e:
            raise(e)

    @staticmethod
    def convert_to_grayscale(img):
        try:
            grayscale_image = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
            return grayscale_image
        except Exception as e:
            raise(e)

    @staticmethod
    def binarize(img, max_value: int = 255, block_size: int = 11, C: int = 3):
        """Convert a grayscale image to black and white using adaptive thresholding"""

        try:
            binary_image = cv.adaptiveThreshold(
                img,
                max_value,
                cv.ADAPTIVE_THRESH_GAUSSIAN_C,
                # Use THRESH_BINARY_INV so the foreground is white and the
                # background is black. Necessary for applying morphological
                # transformations like erosion and dilating
                cv.THRESH_BINARY_INV,
                block_size,
                C)
            return binary_image
        except Exception as e:
            raise(e)

    @staticmethod
    def close(img,
              kernel: ndarray = np.ones((2, 2), np.uint8),
              iterations: int = 1):
        """Perform a closing morphological transformation on the input image"""

        try:
            dilated_img = cv.dilate(img, kernel, iterations)
            eroded_img = cv.erode(dilated_img, kernel, iterations)
            return eroded_img
        except Exception as e:
            raise(e)

    @staticmethod
    def preprocess(img, alphaimg):
        """Run the preprocessing pipeline by smoothing, grayscaling then binarizing the input image in that order"""
        smoothed_img = BasePreprocessor.smooth(img)
        grayscale_img = BasePreprocessor.convert_to_grayscale(smoothed_img)
        binary_img = BasePreprocessor.binarize(grayscale_img)

        smoothed_alpha = BasePreprocessor.smooth(alphaimg)
        grayscale_img = BasePreprocessor.convert_to_grayscale(smoothed_alpha)
        binary_alpha = BasePreprocessor.binarize(grayscale_img)
        return binary_img, binary_alpha
