FROM python:3.12-slim AS build

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements.txt
RUN python -m pip install --timeout 900 --no-cache-dir -r requirements.txt


FROM python:3.12-slim

RUN apt-get update && apt-get --no-install-recommends install -y \
    dumb-init

COPY --from=build /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY --from=build /usr/local/bin /usr/local/bin
COPY ./app /app
WORKDIR /app

ENTRYPOINT ["dumb-init", "--"]
CMD [ "/bin/sh", "start_server.sh" ]
