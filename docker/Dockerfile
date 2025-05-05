FROM oven/bun:1.2-debian

# Install bun
COPY . ./
RUN bun install

# Install nginx
RUN apt update && apt install -y --no-install-recommends nginx && rm -f /etc/nginx/sites-enabled/default
COPY ./docker/beatsync.conf.template /etc/nginx/conf.d/beatsync.conf.template
COPY ./docker/nginx.conf /etc/nginx/nginx.conf


ENV PORT_WEB=3650
ENV PORT_API=3651
ENV BASE_PATH_WEB=""
ENV BASE_URL_API="http://localhost:3651"

COPY ./docker/entrypoint.sh /
COPY ./docker/run.sh /
RUN chmod +x /*.sh

ENTRYPOINT [ "/entrypoint.sh" ]
CMD [ "/run.sh" ]