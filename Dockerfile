FROM mikefarah/yq:4.35.2 AS yq
FROM docker:24.0.6-cli AS docker

FROM node:20.10.0-bookworm AS ide

# install dependencies
ARG TOOLS=
RUN set -eux; \
        apt-get update && \
        apt-get install -y --no-install-recommends \
                ${TOOLS} && \
        curl -sSL https://raw.githubusercontent.com/microsoft/vscode-dev-containers/master/script-library/common-debian.sh -o /tmp/common-setup.sh && \
                # common-setup.sh INSTALL_ZSH USERNAME UID GID UPGRADE_PKGS \
                /bin/bash /tmp/common-setup.sh true vscode 2000 2000 false && \
         apt-get clean -y && \
         rm -rf /tmp/common-setup.sh /var/lib/apt/lists/*

COPY --from=yq /usr/bin/yq /usr/local/bin/yq
COPY --from=docker /usr/local/bin/docker /usr/local/bin/docker

# install node tools
ARG NODE_TOOLS=
RUN echo "${NODE_TOOLS}" | xargs -n 1 --no-run-if-empty npm install -g

# install custom packages
ARG CUSTOM_TOOLS=
RUN set -eux; \
    if [ ! -z "${CUSTOM_TOOLS}" ]; then \
      apt-get update && \
      apt-get install -y --no-install-recommends ${CUSTOM_TOOLS} && \
      apt-get clean -y && \
      rm -rf /var/lib/apt/lists/*; \
    fi

ARG CUSTOM_NODE_TOOLS=
RUN echo "${CUSTOM_NODE_TOOLS}" | xargs -n 1 --no-run-if-empty npm install -g

USER vscode

RUN mkdir -p -m 0700 ~/.ssh && \
    ssh-keyscan bitbucket.org >> ~/.ssh/known_hosts

FROM ide AS build

WORKDIR /src

USER root

# copy package.json and package-lock.json
COPY package*.json ./
# install dependencies
RUN npm install

# copy in the rest of the source
COPY Makefile .
COPY tsconfig.json .
COPY build-aux build-aux
COPY src src
RUN make build

FROM node:20.10.0-bookworm

LABEL com.hiddenlayer.vendor HiddenLayer
LABEL org.opencontainers.image.source https://github.com/hiddenlayer-engineering/github-automation-app
LABEL org.opencontainers.image.description GitHub Automation App

WORKDIR /src

COPY --from=build /src/dist dist
COPY --from=build /src/package.json .
COPY --from=build /src/node_modules node_modules

ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]
