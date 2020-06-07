import cv2 as cv
import numpy as np

from .preprocessor import BasePreprocessor
from core.model.detector import Detector


class BaseStateDetector(Detector):

    @staticmethod
    def detect(img, original_img):
        """Detect states in an input image

        :param: img is a preprocessed image
        """
        pass


class BaseTransitionDetector(Detector):

    @staticmethod
    def detect(img):
        """Detect transitions in an input image

        :param: img is a preprocessed image
        """
        pass


class BaseLabelDetector(Detector):

    @staticmethod
    def detect(img):
        """Detect labels in an input image

        :param: img is a preprocessed image
        """
        pass
