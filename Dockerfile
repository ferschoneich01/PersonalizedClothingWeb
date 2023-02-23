FROM alpine:3.10

RUN apk add --no-cache python3-dev \
    && pip3 install --upgrade pip

WORKDIR /app

COPY . /app

ARG DATABASE_URL=postgresql+psycopg2://root:root@postgres:5432/PCdb

RUN pip3 --no-cache-dir install -r requirements.txt

CMD [ "python3", "src/application.py" ]