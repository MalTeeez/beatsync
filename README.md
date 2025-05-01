# Beatsync

Beatsync is a high-precision web audio player built for multi-device playback. The official app is [beatsync.gg](https://www.beatsync.gg/).

https://github.com/user-attachments/assets/2aa385a7-2a07-4ab5-80b1-fda553efc57b

## Features

- **Millisecond-accurate synchronization**: Abstracts [NTP-inspired](https://en.wikipedia.org/wiki/Network_Time_Protocol) time synchronization primitives to achieve a high degree of accuracy
- **Cross-platform**: Works on any device with a modern browser (Chrome recommended for best performance)
- **Spatial audio:** Allows controlling device volumes through a virtual listening source for interesting sonic effects
- **Polished interface**: Smooth loading states, status indicators, and all UI elements come built-in
- **Self-hostable**: Run your own instance with a few commands


> [!NOTE]
> Beatsync is in early development. Mobile support is working, but experimental. Please consider creating an issue or contributing with a PR if you run into problems!

## Quickstart

### Manually
This project uses [Turborepo](https://turbo.build/repo).

Fill in the `.env` file in `apps/client` with the following:

```sh
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

Run the following commands to start the server and client:

```sh
bun install          # installs once for all workspaces
bun dev              # starts both client (:3000) and server (:8080)
```

| Directory         | Purpose                                                        |
| ----------------- | -------------------------------------------------------------- |
| `apps/server`     | Bun HTTP + WebSocket server                                    |
| `apps/client`     | Next.js frontend with Tailwind & Shadcn/ui                     |
| `packages/shared` | Type-safe schemas and functions shared between client & server |


### Via Docker
One line:
```
docker run -d -p 3650:3650 -p 3651:3651 --name beatsync -e BASE_URL=example.com ghcr.io/malteeez/beatsync
```

Compose:
```
services:
  beatsync:
    container_name: beatsync
    image: ghcr.io/malteeez/beatsync:latest
    environment:
      - WEB_PORT=4444
      - API_PORT=5555
      - BASE_URL=example.com
    ports:
      - 4444:4444
      - 5555:5555
```

### Via Kubernetes

```
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: beatsync
spec:
  serviceName: "beatsync"
  replicas: 1  # Doesn't scale currently
  selector:
    matchLabels:
      app: beatsync
  template:
    metadata:
      labels:
        app: beatsync
    spec:
      containers:
      - name: beatsync
        image: ghcr.io/malteeez/beatsync:latest
        env:
        - name: BASE_URL
          value: "example.com"
        ports:
        - containerPort: 3650
          name: web
        - containerPort: 3651
          name: api

---
apiVersion: v1
kind: Service
metadata:
  name: beatsync-service
spec:
  type: LoadBalancer
  ports:
  - name: web
    port: 3650
    targetPort: 3650
  - name: api
    port: 3651
    targetPort: 3651
  selector:
    app: beatsync
```