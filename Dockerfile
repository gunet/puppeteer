FROM ghcr.io/puppeteer/puppeteer:latest AS puppeteer
FROM node:20-bullseye-slim

LABEL gr.gunet.uRescom.maintainer="info@gunet.gr"
LABEL org.opencontainers.image.source="https://github.com/gunet/puppeteer"
LABEL org.opencontainers.image.description="GUNet uResCom"

USER root

ENV PUPPETEER_ROOT=/home/pptruser

# Taken from the official puppeteer Dockerfile in
# https://github.com/puppeteer/puppeteer/blob/main/docker/Dockerfile
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic \
    fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst \
    fonts-freefont-ttf libxss1 libx11-xcb1 dbus dbus-x11 \
    vim-tiny \
      --no-install-recommends \
    && service dbus start \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r pptruser && useradd -rm -g pptruser -G audio,video pptruser

USER pptruser

RUN mkdir -p ${PUPPETEER_ROOT}/scenarios

COPY --from=puppeteer ${PUPPETEER_ROOT}/ ${PUPPETEER_ROOT}/
COPY --chown=pptruser:pptruser package.json ${PUPPETEER_ROOT}/
RUN cd ${PUPPETEER_ROOT} && \
    npm install && \
    npm cache clean -f
COPY --chown=pptruser:pptruser *.js ${PUPPETEER_ROOT}/
COPY --chown=pptruser:pptruser scenarios/ ${PUPPETEER_ROOT}/scenarios/

WORKDIR ${PUPPETEER_ROOT}

ENV HEADLESS=true
ENV CAS_USER=gunetdemo
ENV CAS_PASSWORD=gunetdemo
# Can be one of
# en
# el
ENV CAS_LANG=en
# Can be one of
# gunet-cas
# simple-cas
ENV CAS_TYPE=simple-cas
ENV TZ=Europe/Athens