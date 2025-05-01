FROM oven/bun:1.2-debian

COPY . ./

RUN bun install

ENV API_PORT=3651
ENV WEB_PORT=3650
ENV NEXT_PUBLIC_API_URL=http://localhost:${API_PORT}
ENV NEXT_PUBLIC_WS_URL=ws://localhost:${API_PORT}/ws


COPY ./docker/entrypoint.sh /
RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]