from core.model.associator import Associator


class BaseStateAssociator(Associator):
    """Component for associating states using transitions"""

    @staticmethod
    def associate(states, transitions):
        pass


class BaseLabelAssociator(Associator):
    """Component for associating labels and transitions"""

    @staticmethod
    def associate(labels, transitions):
        pass
