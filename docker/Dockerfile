FROM oven/bun:1.2-debian

COPY . ./

RUN bun install

COPY ./docker/entrypoint.sh /
RUN chmod +x /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]