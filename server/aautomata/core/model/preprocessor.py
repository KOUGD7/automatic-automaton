from abc import ABC, abstractmethod
from numpy import ndarray


class Preprocessor(ABC):
    """Abstract class for preprocessor components"""

    @staticmethod
    @abstractmethod
    def smooth(img):
        pass

    @staticmethod
    @abstractmethod
    def convert_to_grayscale(img):
        pass

    @staticmethod
    @abstractmethod
    def binarize(img):
        pass

    @staticmethod
    @abstractmethod
    def close(self, img, kernel: ndarray, iterations: int):
        pass
