FROM tiangolo/uvicorn-gunicorn-fastapi:python3.7

WORKDIR /

COPY requirements.txt .
RUN python3.7 -m pip install -r requirements.txt --no-cache-dir

COPY aautomata /aautomata
COPY main.py ./
