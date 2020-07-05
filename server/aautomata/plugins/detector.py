import cv2 as cv
import numpy as np
from scipy.spatial import distance as dist
from imutils import perspective

from aautomata.plugins.preprocessor import BasePreprocessor
from aautomata.core.model.detector import Detector
from aautomata.utils import midpoint


class BaseStateDetector(Detector):

    @staticmethod
    def detect(img,
               min_radius: int,
               max_radius: int,
               quality: int,
               original_img=None):
        """Detect states in an input image

        :param: img is a preprocessed image
        """

        contours, hierarchy = cv.findContours(
            img, cv.RETR_TREE, cv.CHAIN_APPROX_NONE)

        radii = []
        centres = []
        contours1 = []
        # Find all the contours in the iamge
        for contour in contours:
            approx = cv.approxPolyDP(
                contour, 0.0001 * cv.arcLength(contour, True), True)
            if original_img is not None:
                cv.drawContours(original_img, [approx], 0, (0, 255, 0), 1)
            x = approx.ravel()[0]
            y = approx.ravel()[1]

            x, y, w, h = cv.boundingRect(approx)
            aspectRatio = float(w) / h

            # ratio of the states high to width
            if aspectRatio >= 0.60 and aspectRatio <= 1.40 and len(approx) > 20:

                # finally, get the min enclosing circle
                (x, y), radius = cv.minEnclosingCircle(contour)
                # convert all values to int
                center = (int(x), int(y))
                radius = int(radius)

                areaCon = cv.contourArea(contour)
                areaCir = np.pi * (radius ** 2)

                eff = areaCon / areaCir

                # and draw the circle in blue
                if min_radius <= radius <= max_radius and eff > quality:
                    centres.append(center)
                    radii.append(radius)
                    contours1.append(contour)

        # draw circle
        circles = list(zip(radii, centres, contours1))
        prev = [0, (0, 0)]
        state = 1

        # capture circles after filtering unwanted circles
        radii2 = []
        centres2 = []
        contours2 = []
        for radius, centre, contour in circles:
            x, y = centre
            # print (prev)
            px = prev[1][0]
            py = prev[1][1]
            pr = prev[0]

            if original_img is not None:
                # remove circle that that are close has off
                cv.circle(original_img, centre, radius, (255, 0, 0), 2)
                cv.circle(original_img, centre, 2, (0, 0, 255), 1)
                #cv.putText(I, "S " + str(state), centre, cv.FONT_HERSHEY_COMPLEX, 0.4, (0, 0, 0))
            state += 1
            centres2.append(centre)
            radii2.append(radius)
            contours2.append(contour)
            prev = radius, centre

        return radii2, centres2, contours2


class BaseTransitionDetector(Detector):

    @staticmethod
    def detect(img, original_img=None):
        """Detect transitions in an input image

        :param: img is a preprocessed image
        """
        thresh = np.uint8(img)

        nb_components, output, stats, centroids = cv.connectedComponentsWithStats(
            thresh)

        sizes = stats[1:, -1]
        nb_components = nb_components - 1
        img2 = np.zeros((output.shape))

        # remove component less than 50
        for i in range(0, nb_components):
            if not (50 >= sizes[i]):
                img2[output == i + 1] = 255

        contours, _ = cv.findContours(
            thresh, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)

        i = 0
        arrows = []
        for contour in contours:
            approx = cv.approxPolyDP(
                contour, 0.02 * cv.arcLength(contour, True), True)

            # center of mass
            M = cv.moments(approx)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
            else:
                cx, cy = 0, 0
            if original_img is not None:
                cv.circle(original_img, (cx, cy), 3, (200, 10, 200), -1)

            # compute the rotated bounding box of the contour
            rect = cv.minAreaRect(contour)
            box = cv.boxPoints(rect)
            box = np.array(box, dtype="int")
            # box = np.int0(box)
            # draw a red 'nghien' rectangle
            # .drawContours(img, [box], 0, (0, 0, 255))

            # www.pyimagesearch.com/2016/04/04/measuring-distance-between-objects-in-an-image-with-opencv
            # order the points in the contour such that they appear
            # in top-left, top-right, bottom-right, and bottom-left
            # order, then draw the outline of the rotated bounding
            # box
            box = perspective.order_points(box)

            # unpack the ordered bounding box, then compute the
            # midpoint between the top-left and top-right points,
            # followed by the midpoint between the top-right and
            # bottom-right

            (tl, tr, br, bl) = box
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

            if original_img is not None:
                cv.arrowedLine(original_img, start_point, end_point,
                               (0, 0, 255), 3, 5, tipLength=0.2)
                cv.circle(original_img, (cx, cy), 3, (200, 10, 200), -1)

            arrows.append((start_point, end_point))

        return thresh, arrows


class BaseLabelDetector(Detector):

    @staticmethod
    def detect(img, min_area: int, max_area: int, original_img=None):
        """Detect labels in an input image

        :param: img is a preprocessed image
        """

        # Keep only small components but not to small
        output = cv.connectedComponentsWithStats(img)

        num_labels = output[0]
        labels = output[1]
        stats = output[2]
        centroids = output[3]

        labelStats = output[2]
        labelAreas = labelStats[:, 4]

        rects = []  # List, its length is the number of CCs
        num_labels2 = num_labels
        labels2 = labels
        stats2 = []
        centroids2 = []

        for i in range(1, len(centroids)):

            x0 = stats[i][0]
            y0 = stats[i][1]

            w = stats[i][2]
            h = stats[i][3]

            r = [(0, 0), (0, 0)]
            if min_area <= labelAreas[i] <= max_area:
                # r = Rectangle(x0, y0, x0 + w, y0 + h)
                r = [(x0, y0), (x0 + w, y0 + h)]
                rects.append(r)

        # A numpy array of size (n, 2) where n is the number of CCs
        centroids_ = np.ndarray((centroids.shape[0] - 1, centroids.shape[1]))
        for i in range(1, len(centroids)):
            centroids_[i - 1] = centroids[i]

        # get center from centroid
        for point in centroids_:
            x = point[0]
            y = point[1]
            center = (int(x), int(y))
            # cv.circle(img, center, 2, (0, 0, 255), 3)

        # get rectangle from array
        for point in rects:
            start = point[0]
            end = point[1]
            #cv.rectangle(img, start, end, (250, 255, 2), 2)

        # remove all labels
        sizes = stats[1:, -1]
        nb_components = num_labels - 1
        output = labels
        img2 = np.zeros((output.shape))

        img3 = img2.copy()
        # for every component in the image, you keep it only if it's above min_size
        for i in range(0, nb_components):
            if not (min_area <= sizes[i] <= max_area):
                # IMAGE WITHOUT LABELS
                img2[output == i + 1] = 255
            else:
                # IMAGE WITH ONLY LABELS
                img3[output == i + 1] = 255

        return rects, centroids2, img2, img3  # , num_labels2, labels2, stats2


def compare_labels(alpha1, label1):

    alpha, a_rect = alpha1
    label, l_rect = label1

    a_upper_corner, a_lower_corner = a_rect
    x_a, y_a = a_upper_corner
    xw_a, yh_a = a_lower_corner

    l_upper_corner, l_lower_corner = l_rect
    x_l, y_l = l_upper_corner
    xw_l, yh_l = l_lower_corner

    x_scale = (xw_l - x_l) / (xw_a - x_a)
    y_scale = (yh_l - y_l) / (yh_a - y_a)

    alpha = alpha.copy()
    alpha = cv.resize(alpha, (0, 0), fx=x_scale, fy=y_scale)

    intersect = cv.bitwise_and(alpha, label)
    intersect = np.uint8(intersect)

    output = cv.connectedComponentsWithStats(intersect)

    num_labels = output[0]
    labels = output[1]
    stats = output[2]
    centroids = output[3]

    label_stats = output[2]
    label_areas = label_stats[:, 4]

    height, width = intersect.shape

    similarity_idx = sum(label_areas[1:])/(height * width)

    return similarity_idx


class BaseAlphabetDetector(Detector):

    @staticmethod
    def detect(labels, alphabet, alpharange, original_img=None):
        """Detects the alphabet"""

        l_rects, l_centroids, _, l_img = labels
        l_img = np.array(l_img, dtype=np.uint8)

        a_rects, a_centroids, _, a_img = BaseLabelDetector.detect(
            alphabet, 0, alpharange)
        a_img = np.array(a_img, dtype=np.uint8)

        templates = []
        sub_images = []
        for rect in a_rects:
            upper_corner, lower_corner = rect
            x, y = upper_corner
            xw, yh = lower_corner
            templates.append((a_img[y:yh, x:xw], rect))

        for rect in l_rects:
            upper_corner, lower_corner = rect
            x, y = upper_corner
            xw, yh = lower_corner
            sub_images.append((l_img[y:yh, x:xw], rect))

        # sort templates by the x coordinate of the first point in the rec
        templates.sort(key=lambda x: x[1][0][0])

        mapping = {}
        new_rects = []
        count_sub_images = 0
        for s in sub_images:
            count_templates = 0
            max_index = 0
            alpha_index = -1
            for t in templates:
                mapping[count_templates] = t

                s_index = compare_labels(t, s)

                if s_index > max_index:
                    max_index = s_index
                    alpha_index = count_templates
                count_templates += 1

            sub_s, rect_s = s
            upper_corner, lower_corner = rect_s
            if original_img is not None:
                cv.putText(original_img, str(alpha_index), upper_corner,
                           cv.FONT_HERSHEY_COMPLEX, 0.6, (0, 0, 0), thickness=2)

            new_rects.append((alpha_index, rect_s))
            count_sub_images += 1

        cv.imshow('ConnectLabels', l_img)
        cv.imshow('ConnectAlphabet', a_img)
        return mapping, new_rects
