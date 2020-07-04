from aautomata.utils import midpoint


class Label:
    def __init__(self, v, r):
        self.value = v
        self.rec = r

    def get_centre(self):
        start, end = self.rec
        return midpoint(start, end)

    def min_circle(self):
        centre, radius = cv.minEnclosingCircle(np.float32(self.rec))
