# source: https://github.com/lipanski/docker-static-website

ARG ALPINE_VERSION=3.18.4

FROM alpine:${ALPINE_VERSION} AS builder

ARG BUSYBOX_VERSION=1.36.1

# Install all dependencies required for compiling busybox
RUN apk add gcc musl-dev make perl

# Download busybox sources
RUN wget https://busybox.net/downloads/busybox-${BUSYBOX_VERSION}.tar.bz2 \
  && tar xf busybox-${BUSYBOX_VERSION}.tar.bz2 \
  && mv /busybox-${BUSYBOX_VERSION} /busybox

WORKDIR /busybox

# Copy the busybox build config (limited to httpd)
COPY ./busybox/.config .

# Compile
RUN make && ./make_single_applets.sh

# Create a non-root user to own the files and run our server
RUN adduser -D static

# Switch to the scratch image
FROM scratch

EXPOSE 80

# Copy over the user
COPY --from=builder /etc/passwd /etc/passwd

# Copy the static binary
COPY --from=builder /busybox/busybox_HTTPD /busybox-httpd

# Use our non-root user
USER static
WORKDIR /home/static

COPY ./dist .

# Run busybox httpd
CMD ["/busybox-httpd", "-f", "-v", "-p", "80", "-c", "httpd.conf"]