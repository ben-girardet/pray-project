# https://github.com/mhart/alpine-node
# FROM mhart/alpine-node:14.15.1
FROM node:14.15.1

RUN apt update \
	&& apt install vim git bash -y --no-install-recommends

ARG SEED

ENV NODE_ENV=development
ENV SESSION_SECRET = fjsdh8472938
ENV SERVER_PORT=3000
ENV MONGOHOST=praymongo
ENV MONGOPORT=27017
ENV DBNAME=prayproject
ENV REDIS_PORT = 6379
ENV REDIS_HOST = redis
ENV JWT_SECRET_OR_KEY = fhdf78973423
ENV JWT_REFRESH_TOKEN_SECRET_OR_KEY = 8239jjjjjfsd
ENV JWT_TOKEN_EXPIRATION = 15 minutes
ENV JWT_REFRESH_TOKEN_EXPIRATION = 30

WORKDIR /home
RUN git clone https://github.com/ben-girardet/pray-project.git
WORKDIR /home/pray-project/server
RUN npm install
RUN if [ "$SEED" = "1" ] ; then npm run seed ; fi
# CMD npm start
EXPOSE 3000
COPY ./update-and-run.sh /home/pray-project/server/update-and-run.sh
CMD sh update-and-run.sh
