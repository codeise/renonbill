FROM python:3.9.5-slim
ENV PYTHONUNBUFFERED 1
EXPOSE 8000
RUN apt-get update -y
RUN apt-get install -y netcat

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN mkdir /code
WORKDIR /code
ENTRYPOINT ["/entrypoint.sh"]
EXPOSE 8000