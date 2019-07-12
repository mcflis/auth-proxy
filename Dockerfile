FROM node:10.16.0

MAINTAINER Maximilian Flis <maximilian.flis@tum.de>

ARG BUILD_AUTH_PROXY_PORT=8080
ENV AUTH_PROXY_PORT=$BUILD_AUTH_PROXY_PORT
EXPOSE ${AUTH_PROXY_PORT}
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD . /usr/src/app
RUN npm install --production
RUN mkdir -p /srv/app
RUN cp *.js /srv/app
RUN cp -r node_modules /srv/app
WORKDIR /srv/app
RUN rm -rf /usr/src/app

CMD ["node", "server.js"]
