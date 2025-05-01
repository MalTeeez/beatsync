FROM oven/bun:1.2-debian

COPY . ./

RUN bun install

ENV API_PORT=3651
ENV WEB_PORT=3650
ENV BASE_URL=localhost
ENV NEXT_PUBLIC_API_URL=http://${BASE_URL}:${API_PORT}
ENV NEXT_PUBLIC_WS_URL=ws://${BASE_URL}:${API_PORT}/ws


COPY ./docker/entrypoint.sh /
RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]