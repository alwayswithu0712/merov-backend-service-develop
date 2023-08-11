###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18 As development

# Create app directory
WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

RUN yarn ci

# Bundle app source
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:18 As build

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN yarn prisma:generate
RUN yarn build

RUN yarn ci

USER node

###################
# PRODUCTION
###################

FROM node:18 As production

RUN apt-get update && apt-get install -y openssl

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/ .

EXPOSE 3001

ENV PORT 3001

# Start the server using the production build
CMD [ "yarn", "start:prod" ]
