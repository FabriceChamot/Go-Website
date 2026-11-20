# Baduk Web

A JavaScript starter for a Baduk (Go) website. It serves static files from
`public/`, runs in Docker, and uses AWS CDK to deploy a container to ECS Fargate
behind an Application Load Balancer. The load balancer supports WebSocket
upgrades; add the application-side WebSocket handler when the game needs it.

## Run locally

Requirements: Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The `/healthz` endpoint is
used by the load balancer and can be checked at
[http://localhost:3000/healthz](http://localhost:3000/healthz).

Copy `.env.example` to `.env` for local settings. `.env` is intentionally
ignored by Git; do not put secrets in source control. Dependencies,
`node_modules/`, and `cdk.out/` are generated locally and are also ignored.

## Run in Docker

```sh
docker build -t baduk-web .
docker run --rm -p 3000:3000 baduk-web
```

## Deploy to AWS

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

### One-time AWS setup

1. Install and configure the AWS CLI and AWS CDK, and make sure your AWS
   credentials are for the account and region you intend to use.
2. Bootstrap CDK once in that account and region:

   ```sh
   npx cdk bootstrap aws://ACCOUNT_ID/REGION
   ```

3. Create an IAM role for GitHub Actions using the
   `token.actions.githubusercontent.com` OIDC provider. Its trust policy should
   require audience `sts.amazonaws.com` and restrict the subject to
   `repo:OWNER/REPOSITORY:ref:refs/heads/main` (replace the placeholders).
   Grant the role permission to assume the CDK bootstrap deployment and asset
   publishing roles in this account. Do not use long-lived AWS access keys in
   GitHub.
4. In the GitHub repository, add Actions **variables** named `AWS_ROLE_ARN`
   and `AWS_REGION`. Set them to the deployment role ARN and AWS region.
5. Push to `main`. Pull requests run tests and CDK synthesis; pushes to `main`
   also deploy the stack. The deployment output includes the website URL.

For a local deployment after bootstrapping, run:

```sh
npm run cdk:deploy
```

To remove the stack and its resources:

```sh
npx cdk destroy
```

## Project layout

- `public/` — static game frontend files
- `src/` — Node.js server and future API/WebSocket handlers
- `infra/` — AWS CDK application and stack
- `.github/workflows/` — CI/CD workflow
