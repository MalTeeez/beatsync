FROM oven/bun:1.2-debian

COPY . ./

RUN bun install

ENV PORT_WEB=3650
ENV PORT_API=3651
ENV BASE_URL_API="http://localhost:3651"

COPY ./docker/entrypoint.sh /
RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]