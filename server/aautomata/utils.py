import os
import math
import shutil
import cv2 as cv
from fastapi import File


def save_file(file_path: str, file: File) -> None:
    """Saves a file to disk.

    :param: file_path absolute or relative filepath pointing to a file
    """

    try:
        temp_file = open(file_path, 'wb+')
        shutil.copyfileobj(file, temp_file)
        temp_file.close()
    except Exception as e:
        print('problems')
        raise(e)


def delete_file(file_path: str) -> None:
    """Deletes a file from disk.

    :param: file_path absolute or relative filepath pointing to a file
    """

    try:
        os.remove(file_path)
    except Exception as e:
        raise(e)


def resize(img, to_size: int):
    """Preserve the aspect ration and resize an image.

    :param: img 
    :param: to_size
    """

    img_width, img_height = img.shape[1], img.shape[0]
    new_dimensions = None
    if img_width > img_height:
        percentage = to_size / img_width
        new_height = int(img_height * percentage)
        new_dimensions = (to_size, new_height)
    elif img_height > img_width:
        percentage = to_size / img_height
        new_width = int(img_width * percentage)
        new_dimensions = (new_width, to_size)
    else:
        new_dimensions = (to_size, to_size)

    resized = cv.resize(img, new_dimensions, interpolation=cv.INTER_AREA)
    return resized


def midpoint(a, b):
    """Calculate the midpoint between two points a and b."""
    return ((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5)


def distance(a, b):
    """Calculate the euclidean distance between two points a and b."""

    x1, y1 = a
    x2, y2 = b
    return math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2))
