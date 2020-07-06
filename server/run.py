import cv2 as cv
import numpy as np

from aautomata.utils import resize

from aautomata.plugins.preprocessor import BasePreprocessor
from aautomata.plugins.detector import BaseStateDetector, BaseTransitionDetector, BaseLabelDetector, BaseAlphabetDetector
from aautomata.plugins.associator import BaseAssociator


# if __name__ == '__main__':
#     panel_name = 'Control Panel'
#     cv.namedWindow(panel_name)
#     cv.namedWindow('Connect0')
#     cv.namedWindow()

#     src = cv.imread('aautomata/uploads/t1.jpg')

#     MAX_IMAGE_SIZE = 1000
#     img = resize(src, MAX_IMAGE_SIZE)

#     thresh = BasePreprocessor.preprocess(img)

#     quality = 0.7
#     min_radius = 50
#     max_radius = 1000
#     min_area = 500
#     max_area = 1000
#     max_alpha = 1000

#     pre_labels = BaseLabelDetector.detect(thresh, min_area, max_area, img)
#     labels = BaseAlphabetDetector.detect(pre_labels, thresh, max_alpha)

#     states = BaseStateDetector.detect(
#         thresh, min_radius, max_radius, quality, img)

#     no_labels = pre_labels[2]

#     mask = np.ones(img.shape[:2], dtype='uint8') * 255
#     state_contours = states[2]

#     for contour in state_contours:
#         # change thickness based on the width of lines in the image
#         cv.drawContours(mask, [contour], -1, 0, 5)

#     # combine mask with binary image
#     thresh = cv.bitwise_and(thresh, thresh, mask=mask)

#     transitions = BaseTransitionDetector.detect(thresh, img)

#     root = BaseAssociator.associated(states, transitions, labels)

#     # print(root['transitions']['-1']['transitions'])

#     cv.imshow(panel_name, thresh)
#     cv.waitKey(0)
#     cv.destroyAllWindows()

def nothing(x):
    pass


if __name__ == "__main__":

    cv.namedWindow('Connect')
    cv.namedWindow('Connect0')
    cv.namedWindow('Control Panel')
    cv.resizeWindow('Control Panel', 600, 400)
    cv.createTrackbar('Max Radius', 'Control Panel', 0, 1000, nothing)
    cv.createTrackbar('Min Radius', 'Control Panel', 0, 1000, nothing)
    cv.createTrackbar('Max Area', 'Control Panel', 0, 1000, nothing)
    cv.createTrackbar('Min Area', 'Control Panel', 0, 1000, nothing)
    cv.createTrackbar('Alphabet', 'Control Panel', 0, 10000, nothing)
    cv.createTrackbar('Image', 'Control Panel', 0, 10, nothing)
    cv.createTrackbar('Graph', 'Control Panel', 0, 1, nothing)

    while (1):

        maxA = cv.getTrackbarPos('Max Area', 'Control Panel')
        minA = cv.getTrackbarPos('Min Area', 'Control Panel')
        maxR = cv.getTrackbarPos('Max Radius', 'Control Panel')
        minR = cv.getTrackbarPos('Min Radius', 'Control Panel')
        maxAlpha = cv.getTrackbarPos('Alphabet', 'Control Panel')
        select = cv.getTrackbarPos('Image', 'Control Panel')

        state_mask_w = 5

        if select == 0:
            img = cv.imread("aautomata/uploads/t1.jpg")
            alphaimg = cv.imread('aautomata/uploads/alphabett1.jpg')
            eff = 0.78
        else:
            img = cv.imread('aautomata/uploads/t1.jpg')
            alphaimg = cv.imread('aautomata/uploads/alphabett1.jpg')
            eff = 0.78

        # create different copy to use to labels from the circles
        cimg = img.copy()

        # return binary for both image
        thresh, alphathresh = BasePreprocessor.preprocess(img, alphaimg)

        labels = BaseLabelDetector.detect(thresh, minA, maxA, cimg)
        newLabels = BaseAlphabetDetector.detect(
            labels, alphathresh, maxAlpha, cimg)

        cIthresh = thresh.copy()
        shapes = BaseStateDetector.detect(cIthresh, minR, maxR, eff, cimg)

        # REMOVING CIRCLES AND LABELS
        # retrieves binary img with removed labels
        Ithresh = labels[2]

        # draw mask with contour for circles on binary image
        mask = np.ones(cimg.shape[:2], dtype="uint8") * 255
        state_Contour = shapes[2]
        for c in state_Contour:
            # change thickness based on the width of lines in the image
            cv.drawContours(mask, [c], -1, 0, state_mask_w)

        # Combine mask with binary image
        Ithresh = cv.bitwise_and(Ithresh, Ithresh, mask=mask)

        Ithresh, arrows = BaseTransitionDetector.detect(Ithresh, cimg)

        cv.imshow('ConnectArrow', Ithresh)

        graph_check = cv.getTrackbarPos('Graph', 'Control Panel')
        if graph_check > 0:
            root, graph = BaseAssociator.associated(shapes, arrows, newLabels)

            print(root, graph)

            break

            # UPDATE IMAGE WITH NEW INFO
            cv.imshow('Connect', img)

            # test graph
            # traverse(newLabels, graph)

        cv.imshow('Connect', img)
        cv.imshow('Connect0', cimg)

        k = cv.waitKey(1) & 0xFF
        if k == 27:
            break
