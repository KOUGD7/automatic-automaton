# the structure of a state is as follows:
# {
#   radius,
#   centre,
#   label,
#   is_accepting
#   transitions
# }


def create_state(radius, centre):
    return {'radius': int(radius),
            'centre': list(map(int, centre)),
            'label': None,
            'is_accepting': False,
            'transitions': {}
            }


def get_radius(state):
    return state['radius']


def get_centre(state):
    return state['centre']


def get_label(state):
    return state['label']


def set_label(state, label):
    label[0] = int(label[0])
    label[1] = [list(map(int, corner)) for corner in label[1]]
    state['label'] = label


def is_accepting(state):
    return state['is_accepting']


def set_accepting(state):
    state['is_accepting'] = True


def add_transition(state, transition_on, next_state):
    state['transitions'][str(transition_on[0])] = next_state


def create_transition(tail, end):
    return [list(map(int, tail)), list(map(int, end)), None]


def get_tail(transition):
    return transition[0]


def get_head(transition):
    return transition[1]


def set_input(transition, label):
    label[0] = int(label[0])
    label[1] = [list(map(int, corner)) for corner in label[1]]
    transition[2] = label


def get_input(transition):
    return transition[2]


def create_label(value, rect):
    rect = [list(map(int, corner)) for corner in rect]
    return [int(value), rect]


def get_text(label):
    return label[0]


def get_rect(label):
    return label[1]
