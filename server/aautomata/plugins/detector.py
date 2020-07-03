import cv2 as cv
import numpy as np
from scipy.spatial import distance as dist
from imutils import perspective

from aautomata.plugins.preprocessor import BasePreprocessor
from aautomata.core.model.detector import Detector


def midpoint(a, b):
    """Calculate the midpoint between two points a and b."""
    return ((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5)


class BaseStateDetector(Detector):

    @staticmethod
    def detect(img,
               # original_img,
               min_radius: int,
               max_radius: int,
               quality: int):
        """Detect states in an input image

        :param: img is a preprocessed image
        """

        contours, hierarchy = cv.findContours(
            img, cv.RETR_TREE, cv.CHAIN_APPROX_NONE)

        centres = []
        radii = []
        contours1 = []

        for contour in contours:
            epsilon = 0.0001 * cv.arcLength(contour, True)
            approx = cv.approxPolyDP(contour, epsilon, True)

            # cv.drawContours(original_img, [approx], 0, (0, 255, 0), 1)

            x, y, w, h = cv.boundingRect(approx)
            aspectRatio = float(w) / h

            if aspectRatio >= 0.60 and aspectRatio <= 1.40 and len(approx) > 20:
                (x, y), radius = cv.minEnclosingCircle(contour)

                center = (int(x), int(y))
                radius = int(radius)

                areaCon = cv.contourArea(contour)
                areaCir = np.pi * (radius ** 2)

                eff = areaCon / areaCir

                if min_radius <= radius <= max_radius and eff > quality:
                    centres.append(center)
                    radii.append(radius)
                    contours1.append(contour)

        circles = list(zip(radii, centres, contours1))
        circles.sort(key=lambda x: 10 * (x[1][1] + x[1][0] + x[0]))

        prev = [0, (0, 0)]

        # for radius, centre, contour in circles:
        #     x, y = centre

        #     px, py = prev[1]
        #     pr = prev[0]

        #     cv.circle(original_img, centre, radius, (255, 0, 0), 2)
        #     cv.circle(original_img, centre, 2, (0, 0, 255), 1)

        return circles


class BaseTransitionDetector(Detector):

    @staticmethod
    def detect(img, original_img):
        """Detect transitions in an input image

        :param: img is a preprocessed image
        """
        num_components, output, stats, centroids = cv.connectedComponentsWithStats(
            img)

        sizes = stats[1:, -1]
        num_components = num_components - 1
        img2 = np.zeros((output.shape))

        for i in range(0, num_components):
            if not (sizes[i] <= 50):
                img2[output == i + 1] = 255

        thresh = np.uint8(img2)
        kernel = np.uint8(img2)
        thresh = cv.morphologyEx(thresh, cv.MORPH_CLOSE, kernel)

        thresh = np.float(thresh)

        kernel = np.ones((2, 2), np.uint8)
        thresh = cv.morphologyEx(thresh, cv.MORPH_OPEN, kernel)

        contours, _ = cv.findContours(
            thresh, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
        i = 0
        for contour in contours:
            approx = cv.approxPolyDP(
                contour, 0.02 * cv.arcLength(contour, True), True)

            M = cv.moments(approx)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
            else:
                cx, cy = 0, 0

            rect = cv.minAreaRect(contour)
            box = cv.boxPoints(rect)
            box = np.array(box, dtype="int")

            box = perspective.order_points(box)

            tl, tr, br, bl = box
            if dist.euclidean(tl, tr) < dist.euclidean(tl, bl):
                # midpoint of narrow end
                (topX, topY) = midpoint(br, bl)
                (bottomX, bottomY) = midpoint(tr, tl)
                # midpoint of long end
                (tlblX, tlblY) = midpoint(tl, bl)
                (trbrX, trbrY) = midpoint(tr, br)
            else:
                # midpoint of narrow end
                (topX, topY) = midpoint(tl, bl)
                (bottomX, bottomY) = midpoint(tr, br)
                # midpoint of long end
                (tlblX, tlblY) = midpoint(br, bl)
                (trbrX, trbrY) = midpoint(tr, tl)

            if dist.euclidean((cx, cy), (topX, topY)) < dist.euclidean((cx, cy), (bottomX, bottomY)):
                start_point = (bottomX, bottomY)
                end_point = (topX, topY)
                pass
            else:
                start_point = (topX, topY)
                end_point = (bottomX, bottomY)

            # convert elements to int
            start_point = tuple(int(t) for t in start_point)
            end_point = tuple(int(t) for t in end_point)

            cv.arrowedLine(img, start_point, end_point, (0, 0, 255), 3, 5)
            cv.circle(img, (cx, cy), 3, (200, 10, 200), -1)
        return thresh


class BaseLabelDetector(Detector):

    @staticmethod
    def detect(img, min_area: int, max_area: int):
        """Detect labels in an input image

        :param: img is a preprocessed image
        """

        num_labels, labels, stats, centroids = cv.connectedComponentsWithStats(
            img)

        label_areas = stats[:, 4]
        rects = []
        stats2 = []
        centroids2 = []

        for i in range(1, len(centroids)):
            x0 = stats[i][0]
            y0 = stats[i][1]

            w = stats[i][2]
            h = stats[i][3]

            r = [(0, 0), (0, 0)]
            if min_area <= label_areas[i] <= max_area:
                r = [(x0, y0), (x0 + w, y0 + h)]
                rects.append(r)

        centroids_ = np.ndarray((centroids.shape[0] - 1, centroids.shape[1]))
        for i in range(1, len(centroids)):
            centroids_[i - 1] = centroids[i]

        for point in centroids:
            x = point[0]
            y = point[1]
            center = (int(x), int(y))

        for point in rects:
            start = point[0]
            end = point[1]
            cv.rectangle(img, start, end, (250, 255, 2))

        sizes = stats[1:, -1]
        num_components = num_labels - 1
        output = labels
        img2 = np.zeros((output.shape))

        for i in range(0, num_components):
            if not min_area <= sizes[i] <= max_area:
                img2[output == i + 1] = 255

        return rects, centroids, img2
