# Docs

![](https://github.com/merov-escrow/merov-backend-service/blob/feat/merov-2765-documentation/docs/Merov%20Diagram.jpg)

1. [Guards](./guards/README.md)
2. [Organization](./organizations/README.md)
3. [Modules](#modules)
4. [Deploys](#deploys)

# Modules

We use modules to group functionality related to business entities. Almost always, there's a controller and/or a DB table behind each module.

To simplify some interactions and endpoints, some modules contain controllers divided into different files, prefixed with `me` or `admin`. For example:

* accounts.controller.ts
* accounts.me.controller.ts
* accounts.admin.controller.ts

"default" (not prefixed) controllers, contain mostly endpoints related to public interactions, like getting someone's reviews or listed products.

"me" controllers are a shorthand for `/entity/{my-entity-id}/action`. Used for example to create wallets or products under your account, or to modify your organization.

"admin" controllers are used only by special users with the `MerovAdmin` Auth0 role. This API is mainly consumed by the backoffice application to perform maintenance or administrator related activities, like resolving disputes or blocking accounts.

<!-- #TODO dependencies hierarchy -->
Some modules depend on other modules (TODO)

[accounts](#accounts)
[admin](#admin)
[auth](#auth)
[blog](#blog)
[chats](#chats)
[config](#config)
[contact-form](#contact-form)
[currencies](#currencies)
[escrow](#escrow)
[images](#images)
[middesk](#middesk)
[notifications](#notifications)
[offer](#offer)
[orders](#orders)
[organizations](#organizations)
[prisma](#prisma)
[products](#products)
[prove](#prove)
[sardine](#sardine)
[server-events](#server-events)
[shared](#shared)
[subscription-email](#subscription-email)
[task](#task)
[transaction](#transaction)
[user](#user)
[verifications](#verifications)
[webhooks](#webhooks)


### accounts

The accounts module holds all functionality related to account management. `default` controller only returns public information.

On the other hand, `me` contains all the endpoints related to creating, editing, showing and deleting addresses and wallets in addition to editing it's own account.

### admin

### auth

This module contains the classes that implement [Nestsjs' authentication passport strategy](https://docs.nestjs.com/security/authentication#implementing-passport-jwt), here the jwt token is validated and parsed. Special attributes or claims added to the token from the Auth0 side need to be extracted and mapped here in the `JwtStrategy#validate` method.

The `RoleGuard` decorator is used to validate users access depending on their role, generally used in conjunction with the `MerovAdmin` role.

### blog
### chats
### config
### contact-form
### currencies
### escrow
### images
### middesk
### notifications
### offer
### orders
### organizations

[See](./organizations/README.md)

### prisma

This is not a module, [`Prisma` is our ORM](https://docs.nestjs.com/recipes/prisma). The file `schema.prisma` contains all the table abstractions and definitions which then are transpiled into SQL statements. Prisma also produces native types based on the model schema with `prisma generate`.

This folder also contains a seed file, which is a script used to initialize fake data into a fresh db running `prisma db seed`.

[Simplified Merov tables and their relations](./Merov_Simplified_ERD.pdf)

### products

The products endpoint contains everything related to listing, creating and editing products, catagories, brands and models. The admin controller is mostly concerned with the creation and maintenance of categories, brands and models. The `me` controller actually represents the `/accounts/me/products` route.

### prove
### sardine
### server-events
### shared
### subscription-email
### task
### transaction
### user
### verifications
### webhooks

# Deploys

The infrastructure of the backend resides mostly in AWS. The application itself lives as a Fargate task in a ECS cluster. The task boots up a docker container whose image is stored in AWS ECR. The database is a PostgresSQL instance that lives in the AWS RDS service. All three environments have their own cluster, task, database and ecr repo.

A typical deploy consists of building an image from the code state and updating the Fargate task.

The branching strategy of the project is to have three eternal branches, `develop`, `staging` and `production` each corresponding to a different environment. Features branches are branched from `develop` and squash-merged back in when done. To prepare a release candidate, `develop` is squash merged into `staging`. A similar process occurs when preparing a release, from `staging` to `production`. This means all three branches should have a single non-connected history as there are no real merges, just squashes. Achieving this setup requires some care when creating the deploy PRs to avoid raising spurious conflicts.

To ease the developing cycle, we have a few Github Actions [set in place](../.github/workflows/) to automate a couple of these processes:

* [Node.js CI](../.github/workflows/ci.yml): builds a new image whenever a PR is opened or a new commit is pushed to an open PR. This is used mostly for checking if the application actually builds.
* [Deploy to Amazon ECS](../.github/workflows/deploy.yml): this flow triggers after a new commit is created on one of the main branches, it builds the new image and deploys it to the correct environment.
* [Update staging weekly](../.github/workflows/scheduled_staging_merge.yml): this flow runs once a week (Friday's afternoon). It proceeds to merge all `develop` new commits into `staging`, version tag and deploy a new image to `staging`.

### Merging: deploying to production

The deploy to production is not automated `:(`. We manually reproduce most of the code that runs in the `Update staging weekly` action, but with `staging` and `production` as the acting branches:

```bash
LAST_PROD_TS=$(git log -n 1 --pretty=format:"%h%x09%ct%x09%s" origin/production | awk '{print $2}')
COMMITS="$(git log --pretty=format:'%h%x09%cI%x09%s%n%b' --since=format:ct:$(( $LAST_PROD_TS + 1 )) origin/staging)"

echo "prepare merge"
git checkout production
git branch merge/production
git checkout staging
git merge -m "Merge branch 'merge/production' into staging" -s ours merge/production
git checkout merge/production
git merge --no-ff staging
```

After this lines are ran, we push the new `merge/production` branch and open a new PR to `production`. The `COMMITS` variable should contain a detailed list of all the commits that entered the `staging` environment previous to this new merge. Right now we do nothing with it, we could use it in the PR, or use it in a release manifest, or something. After the PR is approved and squash-merged the `Deploy to Amazon ECS` action should trigger and generate the new build and deploy.
