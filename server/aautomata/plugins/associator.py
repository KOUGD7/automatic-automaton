import cv2 as cv

from aautomata.core.model.associator import Associator
from aautomata.graph.state import State
from aautomata.graph.transition import Transition
from aautomata.graph.label import Label

from aautomata.utils import distance


class BaseAssociator(Associator):
    """Component for associating states using transitions"""

    @staticmethod
    def associate(states, transitions, labels, original_img=None):
        root = None
        # testing
        ls = len(states[0])
        la = len(transitions)
        ll = len(labels[1])

        radii, centres, contours = states
        states = zip(radii, centres)

        # set for O(1) deletion
        o_states = set()
        for s in states:
            radius, centre = s
            state = State(radius, centre)
            o_states.add(state)

        o_transitions = []
        for t in transitions:
            start, end = t
            transition = Transition(start, end)
            o_transitions.append(transition)

        o_labels = set()
        mapping, labels1 = labels
        for l in labels1:
            value, rec = l
            label = Label(value, rec)
            o_labels.add(label)

        # detecting final states
        states_to_remove = []
        for state_i in o_states:
            for state_j in o_states:
                dist = distance(state_i.centre, state_j.centre)
                if dist < (state_i.radius - state_j.radius):
                    if original_img is not None:
                        cv.circle(original_img, state_j.centre,
                                  state_j.radius, (255, 0, 255), 2)
                    states_to_remove.append(state_j)
                    state_i.set_accepting()

        for state in states_to_remove:
            if state in o_states:
                o_states.remove(state)

        # associate labels and states
        labels_to_remove = []
        for state in o_states:
            for label in o_labels:
                lcentre, lradius = label.min_circle()
                dist = distance(state.centre, lcentre)
                if dist < (state.radius - lradius):
                    # highlight removed labels
                    start, end = label.rec
                    if original_img is not None:
                        cv.rectangle(original_img, start,
                                     end, (250, 255, 2), 2)
                    labels_to_remove.append(label)
                    state.add_label(label)

            for label in labels_to_remove:
                if label in o_labels:
                    o_labels.remove(label)

        # associate labels and transitions
        for transition in o_transitions:
            min_dist = 10**10
            min_label = None
            for label in o_labels:
                dist = distance(transition.get_mid(), label.get_centre())
                if dist < min_dist and dist < distance(transition.head, transition.tail):
                    min_label = label
                    min_dist = dist
            if min_label:
                transition.add_label(min_label)
                o_labels.remove(min_label)

        # associate states and transitions
        for transition in o_transitions:
            min_head = 10**10
            min_tail = 10**10
            head_state = None
            tail_state = None
            for state in o_states:
                dist_head = distance(
                    state.centre, transition.head) - state.radius
                dist_tail = distance(
                    state.centre, transition.tail) - state.radius
                if dist_head < min_head:
                    head_state = state
                    min_head = dist_head
                if dist_tail < min_tail:
                    tail_state = state
                    min_tail = dist_tail

            transition.add_next(head_state)

            if transition.label:
                tail_state.add_transition(transition.label.value, transition)
            else:
                root = transition

        return root
