# syntax=docker/dockerfile:1
FROM ubuntu
RUN sudo apt install libpq-dev python3-dev

# syntax=docker/dockerfile:1
FROM python:3
RUN pip install psycopg2 

FROM alpine:3.10

RUN apk add --no-cache python3-dev \
    && pip3 install --upgrade pip 

WORKDIR /app

COPY . /app

RUN pip3 --no-cache-dir install -r requirements.txt

CMD [ "python3", "src/application.py" ]