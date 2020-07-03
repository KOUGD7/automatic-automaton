from abc import ABC, abstractmethod


class Associator(ABC):
    """Abstract class for associator components"""

    @staticmethod
    @abstractmethod
    def associate(arg1, arg2):
        pass
