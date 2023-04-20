FROM python:3.7.3-alpine

RUN apk add python-dev && \
    apk add postgresql-dev 

RUN pip3 install --upgrade pip 


WORKDIR /app

COPY . /app

RUN pip3 install psycopg2-binary

RUN pip3 --no-cache-dir install -r requirements.txt

CMD [ "python3", "src/application.py" ]