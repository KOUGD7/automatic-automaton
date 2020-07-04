class State:
    def __init__(self, r, c):
        self.radius = r
        self.centre = c
        self.label = None
        self.transitions = {}
        self.is_accept_state = False

    def add_transition(self, input, next_state):
        self.transitions[input] = next_state

    def set_accepting(self):
        self.is_accept_state = True

    def add_label(self, label):
        self.label = label
