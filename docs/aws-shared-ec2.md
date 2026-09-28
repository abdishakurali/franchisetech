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
- `NEXT_PUBLIC_SUPABASE_URL` — the chosen isolated project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — its publishable key

The server's `.env.production` is created once from
`server-config-template.txt` and is never uploaded by Actions. Use the
workflow's required `DEPLOY` confirmation input only after DNS points
`new.franchisetech.ro` to this host and the Supabase redirect URLs include it.

`Publish container image` is a separate manual workflow. It sends the supplied
public Supabase configuration into the build, authenticates to ECR with GitHub
OIDC (no AWS access key), and publishes an immutable commit-SHA tag to
`841125194442.dkr.ecr.eu-north-1.amazonaws.com/franchisetech-new`.

## Cost and capacity

The monthly infrastructure ceiling for this host is **€20**. Use exactly one
`t4g.small` (2 GiB ARM) with a 20 GB gp3 EBS volume and one public IPv4. At
730 hours this is about $12.56 for compute, $3.65 for IPv4, and $1.67 for EBS
(about $17.88 total before bandwidth). Build images in GitHub Actions; do not
build on the host. Do not add a NAT gateway, load balancer, RDS instance,
Elastic IP, extra volumes, or a second instance under this budget.

This is a spending target, not an absolute AWS billing cap: transfer, snapshots
and ECR storage can add charges. Tag the instance `Project=FranchiseTechNew`
at launch and create a tag-filtered AWS Budget alert at $18 and $20. Monitor
capacity with `docker stats`.
