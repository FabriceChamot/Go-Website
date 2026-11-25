# Baduk Web

A portfolio project introducing the game of Go (Baduk). It includes an
informational website and a browser-based board demo. Express serves the static
site, and AWS CDK deploys it as a container to ECS Fargate behind an
Application Load Balancer.

The demo is for single-player, two-sided practice. The project does not currently have
online multiplayer, user accounts, saved games, or a backend game API.

## Run locally

Requirements: Node.js 22.9 or newer and npm.

```sh
npm ci
npm run dev
```

The development command builds the Go demo bundle automatically. Open
[http://localhost:3000](http://localhost:3000) to view the site, or
[http://localhost:3000/demo/](http://localhost:3000/demo/) to open the board.
The `/healthz` endpoint is used by the load balancer and can be checked at
[http://localhost:3000/healthz](http://localhost:3000/healthz).

Copy `.env.example` to `.env` for local settings. `.env` is intentionally
ignored by Git; do not put secrets in source control. Dependencies,
`node_modules/`, the generated `public/demo/demo.bundle.js`, and `cdk.out/` are
generated locally and are also ignored.

## Run in Docker

```sh
npm run build:demo
docker build -t baduk-web .
docker run --rm -p 3000:3000 baduk-web
```

The checked-in demo source is `public/demo/demo.js`; the build command bundles
it for browser use. Run the command again after changing the demo source. The
development, test, and CDK deploy commands build the bundle automatically.

## Deploy to AWS manually

The CDK stack creates an ECS cluster, a Fargate service, and a public
Application Load Balancer. CDK builds the Docker image and publishes it to the
CDK bootstrap ECR repository. The task runs in public subnets without a NAT
Gateway to keep this starter's baseline AWS costs lower; its security group
allows inbound application traffic only from the load balancer. The load
balancer currently serves HTTP. Add a domain and TLS certificate before using
this for a production site.

AWS resources incur charges, including the load balancer and running Fargate
task. Review current AWS pricing and delete the stack when it is no longer
needed.

### One-time setup

1. Install the AWS CLI and Docker Desktop. Start Docker Desktop before
   deploying.
2. Configure AWS CLI credentials for the account and region where you intend
   to deploy. Verify the account before continuing:

   ```sh
   aws sts get-caller-identity
   ```

3. Install dependencies and run the tests:

   ```sh
   npm ci
   npm test
   ```

4. Bootstrap CDK once in that account and region:

   ```sh
   npx cdk bootstrap aws://ACCOUNT_ID/REGION
   ```

5. Synthesize and deploy the stack:

   ```sh
   npm run cdk:synth
   npm run cdk:deploy
   ```

   The deployment output includes the website URL.

### Optional: deploy from GitHub Actions

The included workflow validates pull requests and can deploy when code is
pushed to `main`. To enable deployment, configure GitHub OIDC with an IAM role
whose trust policy restricts access to your repository and `main` branch.
Grant it the permissions required to deploy the CDK stack, then add repository
Actions variables named `AWS_ROLE_ARN` and `AWS_REGION`. Do not store long-lived
AWS access keys in GitHub. GitHub Actions setup is not required for local
deployment.

To remove the stack and its resources:

```sh
npx cdk destroy
```

This removes the website stack, but CDK bootstrap resources are separate and
remain in the account. Review AWS resources and charges after destroying the
stack.

## Project layout

- `public/` — website HTML, CSS, illustrations, and Go demo
- `src/` — Node.js server and future API/WebSocket handlers
- `infra/` — AWS CDK application and stack
- `.github/workflows/` — CI/CD workflow
