FROM python:3.9.5-slim
ENV PYTHONUNBUFFERED 1
EXPOSE 8000
RUN apt-get update -y
RUN apt-get install -y netcat

RUN mkdir /code
COPY code/ /code/
COPY ./entrypoint.sh /code/entrypoint.sh
RUN chmod +x /code/entrypoint.sh
WORKDIR /code
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
WORKDIR /code/backend
RUN pip install -r requirements.txt
WORKDIR /code
EXPOSE 8000