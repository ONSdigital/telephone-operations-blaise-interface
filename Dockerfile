FROM node:15

RUN apt-get --yes update && apt-get --yes upgrade

COPY . .

RUN yarn
RUN yarn test
RUN yarn run build-react

EXPOSE 5000
CMD ["yarn", "run", "start-server"]
