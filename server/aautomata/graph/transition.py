from aautomata.utils import midpoint


class Transition:
    def __init__(self, tail, head):
        self.tail = tail
        self.head = head
        self.label = None
        self.next = None

    def get_mid(self):
        return midpoint(self.tail, self.head)

    def add_next(self, state):
        self.next = state

    def add_label(self, label):
        self.label = label
