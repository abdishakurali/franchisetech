# Shared EC2 Docker deployment

This app runs as a standalone Next.js container. A shared Caddy Docker proxy
receives ports 80 and 443 and routes each hostname to the matching container.
Projects do not publish their own host ports.

This release uses `new.franchisetech.ro` as an isolated hostname. It must not
replace `franchisetech.ro`, point at Dolcenera, or reuse a production database
without an explicit migration and approval.

Use a dedicated EC2 instance in `eu-north-1`; do not install this workload on
the unrelated `Garaad` instance in `us-east-1`. Attach only the
`franchise-web` security group: TCP 80/443 are public for HTTPS, while SSH is
limited to the administrator workstation.

## One-time host setup

Install Docker Engine and the Compose plugin on the EC2 host. Create a
non-root deployment user with Docker access and `/srv/franchise` owned by that
user. Start the shared proxy once:

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

## GitHub Actions

CI runs lint, unit tests, TypeScript, and a production build on every pull
request and push to `main`. CD is intentionally manual (`Actions → Deploy new.franchisetech.ro`) so a merge cannot publish unexpectedly.

Before allowing a manual deploy, add these **GitHub environment secrets** to
the `production-new` environment (not repository variables):

- `DEPLOY_HOST` — the EC2 public IPv4 or hostname
- `DEPLOY_USER` — the non-root deployment user
- `DEPLOY_SSH_KEY` — private key restricted to that deployment user
- `DEPLOY_KNOWN_HOSTS` — the server SSH host key from `ssh-keyscan`
- `DEPLOY_PATH` — `/srv/franchise`

The server's `.env.production` is created once from
`server-config-template.txt` and is never uploaded by Actions. Use the
workflow's required `DEPLOY` confirmation input only after DNS points
`new.franchisetech.ro` to this host and the Supabase redirect URLs include it.

## Cost and capacity

A public IPv4 address costs $0.005/hour, about $3.65 in a 30-day month.
Instance, EBS, data transfer, snapshots and optional Route 53 are extra. A
`t2.micro` has 1 GiB RAM: build images off-host or add swap before running
several builds. Monitor capacity with `docker stats`.
