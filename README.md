# Learn and Play Go

A portfolio project introducing Go (Baduk) through an informational website and
an interactive board demo.

**Live site:** [learn-and-play-go.dev](https://learn-and-play-go.dev)

## What it includes

- A responsive landing page introducing the game and its basic concepts.
- A 19×19 interactive board for practicing moves, captures, passing, undoing,
  and restarting a game.
- A Node.js and Express server for serving the site and providing a health
  endpoint.
- Infrastructure as code for deploying the containerized app to AWS ECS
  Fargate behind an Application Load Balancer.
- Automated tests and a GitHub Actions workflow for validation.

The board is a single-player practice demo. The project does not currently
include online multiplayer, accounts, saved games, or a backend game API.

## Technology

- Node.js, Express
- HTML, CSS, browser JavaScript
- [Tenuki](https://github.com/aprescott/tenuki) Go board library
- esbuild
- Docker
- AWS CDK, ECS Fargate, Application Load Balancer
- GitHub Actions

## Project structure

```text
public/                  Website pages, styles, and images
public/demo/             Interactive Go board
src/server.js            Express static-file server and health endpoint
infra/                   AWS CDK application and stack
tests/                   Server and infrastructure tests
.github/workflows/       CI validation and optional AWS deployment
```

## Quality checks

The project includes tests for the website routes and the HTTPS/HTTP-redirect
infrastructure configuration. The GitHub Actions workflow runs tests and
synthesizes the CDK stack.
