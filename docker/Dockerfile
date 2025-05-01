FROM oven/bun:1.2-debian

COPY . ./

RUN bun install

ENV API_PORT=3651
ENV WEB_PORT=3650
ENV BASE_URL=localhost


COPY ./docker/entrypoint.sh /
RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]