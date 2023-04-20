FROM python:3-alpine

WORKDIR /app

COPY . /app

RUN apk update \
    && apk add --virtual build-deps gcc python3-dev musl-dev \
    && apk add postgresql-dev \
    && pip install psycopg2 \
    && apk del build-deps

RUN pip3 install pip install --upgrade pip
RUN pip3 --no-cache-dir install -r requirements.txt

CMD [ "python3", "src/application.py" ]