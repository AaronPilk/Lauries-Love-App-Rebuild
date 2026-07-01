---
title: Deploy to Development
---
<SwmSnippet path="/.github/workflows/development.yml" line="1">

---

Deploy to Dev

```yaml
name: Deploy to Development

on:
  push:
    branches: [development]

jobs:
  build:
    name: Build Image
    runs-on: ubuntu-latest

    steps:
      - name: Check out code
        uses: actions/checkout@v2

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.DEVELOPMENT_AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.DEVELOPMENT_AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: laurieslove-api
          IMAGE_TAG: latest
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .

      - name: Tag image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: laurieslove-api
          IMAGE_TAG: latest
        run: |
          CURRENT_SHA=${GITHUB_SHA::8}
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:${CURRENT_SHA}

      - name: Push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: laurieslove-api
          IMAGE_TAG: latest
        run: |
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Restart ECS Cluster
        env:
          CLUSTER_NAME: laurieslove-api
          SERVICE_NAME: laurieslove-api-service-development
        run: |
          aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --force-new-deployment
  sentry:
    name: Deploy to Sentry
    runs-on: ubuntu-latest

    steps:
      - name: Check out code
        uses: actions/checkout@v2

      - name: Install Node.js
        uses: actions/setup-node@v1
        with:
          node-version: '20'
      
      - name: Build and Install Dependencies
        run: npm install && npm run build

      - name: Install Sentry CLI
        run: npm install -g @sentry/cli

      - name: Inject and Upload Sentry Source Maps
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: oneseventech
          SENTRY_PROJECT: laurieslove-api
        run: |
          sentry-cli sourcemaps inject --org $SENTRY_ORG --project $SENTRY_PROJECT ./dist
          sentry-cli sourcemaps upload --org $SENTRY_ORG --project $SENTRY_PROJECT ./dist

      - name: Set up Sentry Release
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: oneseventech
          SENTRY_PROJECT: laurieslove-api
        run: |
          sentry-cli releases new "$GITHUB_SHA"
          sentry-cli releases set-commits --auto "$GITHUB_SHA"
  
      - name: Notify Sentry Deployment
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: oneseventech
          SENTRY_PROJECT: laurieslove-api
        run: |
          sentry-cli releases deploys "$GITHUB_SHA" new -e development
```

---

</SwmSnippet>

<SwmSnippet path="/.github/workflows/production.yml" line="1">

---

Deploy to PROD

```yaml
name: Deploy to Production

on:
  push:
    branches: [production]

jobs:
  build:
    name: Build Image
    runs-on: ubuntu-latest

    steps:
      - name: Check out code
        uses: actions/checkout@v2

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.PRODUCTION_AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.PRODUCTION_AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: laurieslove-api
          IMAGE_TAG: latest
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .

      - name: Tag image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: laurieslove-api
          IMAGE_TAG: latest
        run: |
          CURRENT_SHA=${GITHUB_SHA::8}
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:${CURRENT_SHA}

      - name: Push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: laurieslove-api
          IMAGE_TAG: latest
        run: |
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Restart ECS Cluster
        env:
          CLUSTER_NAME: laurieslove-api
          SERVICE_NAME: laurieslove-api-service-production
        run: |
          aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --force-new-deployment
  sentry:
    name: Deploy to Sentry
    runs-on: ubuntu-latest

    steps:
      - name: Check out code
        uses: actions/checkout@v2

      - name: Install Node.js
        uses: actions/setup-node@v1
        with:
          node-version: '20'
      
      - name: Build and Install Dependencies
        run: npm install && npm run build

      - name: Install Sentry CLI
        run: npm install -g @sentry/cli

      - name: Inject and Upload Sentry Source Maps
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: oneseventech
          SENTRY_PROJECT: laurieslove-api
        run: |
          sentry-cli sourcemaps inject --org $SENTRY_ORG --project $SENTRY_PROJECT ./dist
          sentry-cli sourcemaps upload --org $SENTRY_ORG --project $SENTRY_PROJECT ./dist

      - name: Set up Sentry Release
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: oneseventech
          SENTRY_PROJECT: laurieslove-api
        run: |
          sentry-cli releases new "$GITHUB_SHA"
          sentry-cli releases set-commits --auto "$GITHUB_SHA"
  
      - name: Notify Sentry Deployment
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: oneseventech
          SENTRY_PROJECT: laurieslove-api
        run: |
          sentry-cli releases deploys "$GITHUB_SHA" new -e production
```

---

</SwmSnippet>

<SwmSnippet path="/Dockerfile" line="1">

---

DockerFile\
The file is used to build the Docker image for the application. It sets up the Node.js environment, installs dependencies, builds the application, and prepares it for production.

```
FROM node:20-alpine AS builder
WORKDIR "/app"
COPY . .
RUN npm install && npm run build && npm prune --production
FROM node:20-alpine AS production
WORKDIR "/app"
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/firebase.json ./firebase.json

EXPOSE 3000
CMD ["sh", "-c", "npm run start:prod"]
```

---

</SwmSnippet>

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBbGF1cmllc2xvdmUtYXBpJTNBJTNBTGF1cmllLXMtTG92ZQ==" repo-name="laurieslove-api"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
