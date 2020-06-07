from abc import ABC, abstractmethod


class Detector(ABC):
    """Abstract class for detector components"""

    @staticmethod
    @abstractmethod
    def detect(img):
        pass
