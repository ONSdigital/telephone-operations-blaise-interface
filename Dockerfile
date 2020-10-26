FROM node:14

RUN apt-get --yes update && apt-get --yes upgrade

COPY . .

RUN yarn
RUN yarn test

EXPOSE 8080
CMD ["yarn", "start"]
