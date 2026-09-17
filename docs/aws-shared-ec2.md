# Shared EC2 Docker deployment

This app runs as a standalone Next.js container. A shared Caddy Docker proxy
receives ports 80 and 443 and routes each hostname to the matching container.
Projects do not publish their own host ports.

The current AWS CLI account has one running instance: `Garaad`
(`i-0f8ca0d70abdf36c9`) in `us-east-1`, type `t2.micro`. Confirm its current
workloads before installing Docker or Caddy.

## One-time host setup

Install Docker Engine and the Compose plugin on the EC2 host. Clone this
repository to `/srv/franchise`, then start the shared proxy once:

```bash
cd /srv/franchise/infra/edge
docker compose up -d
```

Allow inbound TCP 80 and 443 in the instance security group. Point the chosen
subdomain's DNS A record at the instance public IP. Caddy obtains and renews
TLS after DNS resolves to the instance.

## App deployment

```bash
cd /srv/franchise
cp server-config-template.txt .env.production
# Fill the real values on the host.
bash scripts/docker-preflight.sh .env.production
docker compose --env-file .env.production up -d --build
docker compose ps
curl --fail https://YOUR_DOMAIN/api/health
```

Use a unique `APP_DOMAIN` for every project sharing the host. The `edge`
network and Caddy are shared; each project has its own Compose directory,
containers, and named volumes.

## Updates and rollback

```bash
git fetch origin
git checkout main
docker compose --env-file .env.production up -d --build
```

Record the current image before an update with `docker image ls`. To roll back,
check out the prior Git commit and run the same Compose command.

## Cost and capacity

A public IPv4 address costs $0.005/hour, about $3.65 in a 30-day month.
Instance, EBS, data transfer, snapshots and optional Route 53 are extra. A
`t2.micro` has 1 GiB RAM: build images off-host or add swap before running
several builds. Monitor capacity with `docker stats`.
