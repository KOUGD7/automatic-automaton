import cv2 as cv
import numpy as np

from aautomata.core.model.associator import Associator
from aautomata.graph.state import State
from aautomata.graph.transition import Transition
from aautomata.graph.label import Label

from aautomata.graph.adt import create_state, create_transition, create_label, get_radius, get_centre, get_label, is_accepting, set_accepting, get_tail, get_head, get_text, get_rect, get_input, set_label, set_input, add_transition

from aautomata.utils import distance, midpoint


class BaseAssociator(Associator):
    """Component for associating states using transitions"""
    @staticmethod
    def associated(states, transitions, labels):

        radii, centres, _ = states
        states = zip(radii, centres)

        o_states = []
        for s in states:
            radius, centre = s
            state = create_state(radius, centre)
            o_states.append(state)

        o_transitions = []
        for t in transitions:
            start, end = t
            transition = create_transition(start, end)
            o_transitions.append(transition)

        o_labels = []
        mapping, labels1 = labels
        for l in labels1:
            value, rect = l
            label = create_label(value, rect)
            o_labels.append(label)

        # detecting final states
        states_to_remove = []
        for state_i in o_states:
            for state_j in o_states:
                dist = distance(get_centre(state_i), get_centre(state_j))
                if dist < (get_radius(state_i) - get_radius(state_j)):
                    states_to_remove.append(state_j)
                    set_accepting(state_i)

        for state in states_to_remove:
            if state in o_states:
                o_states.remove(state)

        # associate labels and states
        labels_to_remove = []
        for state in o_states:
            for label in o_labels:
                lcentre, lradius = cv.minEnclosingCircle(
                    np.float32(get_rect(label)))
                dist = distance(get_centre(state), lcentre)
                if dist < (get_radius(state) - lradius):
                    # highlight removed labels
                    labels_to_remove.append(label)
                    set_label(state, label)

            for label in labels_to_remove:
                if label in o_labels:
                    o_labels.remove(label)

        # create an unconnected graph out of the labelled states
        graph = {}
        for state in o_states:
            label_hash = hash(str(get_label(state)))
            graph[label_hash] = state

        # associate labels and transitions
        for transition in o_transitions:
            min_dist = 10**10
            min_label = None
            for label in o_labels:
                transition_midpoint = midpoint(
                    get_tail(transition), get_head(transition))
                label_centre = midpoint(get_rect(label)[0], get_rect(label)[1])
                dist = distance(transition_midpoint, label_centre)
                if dist < min_dist and dist < distance(get_tail(transition), get_head(transition)):
                    min_label = label
                    min_dist = dist
            if min_label:
                set_input(transition, min_label)
                o_labels.remove(min_label)

        root = None
        # associate states and transitions
        for transition in o_transitions:
            min_head = 10**10
            min_tail = 10**10
            head_state = None
            tail_state = None
            for state in o_states:
                dist_head = distance(
                    get_centre(state), get_head(transition)) - get_radius(state)
                dist_tail = distance(
                    get_centre(state), get_tail(transition)) - get_radius(state)
                if dist_head < min_head:
                    head_state = state
                    min_head = dist_head
                if dist_tail < min_tail:
                    tail_state = state
                    min_tail = dist_tail

            if get_input(transition):
                add_transition(tail_state, get_input(
                    transition), hash(str(get_label(head_state))))
            else:
                root = hash(str(get_label(state)))

        return root, graph

    @ staticmethod
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
