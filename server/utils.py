import os
import shutil
from fastapi import File


def save_file(file_path: str, file: File) -> None:
    """Saves a file to disk"""

    try:
        temp_file = open(file_path, 'wb+')
        shutil.copyfileobj(file, temp_file)
        temp_file.close()
    except Exception as e:
        raise(e)


def delete_file(file_path: str) -> None:
    """Deletes a file from disk"""

    try:
        os.remove(file_path)
    except Exception as e:
        raise(e)
