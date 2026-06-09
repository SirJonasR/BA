# TecRadar

[![CI](https://github.com/DE-AMS-AD-TECUNIVERS/tecradar/actions/workflows/continuous-integration.yml/badge.svg)](https://github.com/DE-AMS-AD-TECUNIVERS/tecradar/actions/workflows/mavenbuild.yml)

## Requirements

## Windows

- Java
- Maven
- Docker in der wsl (Anleitung: https://dev.to/bowmanjd/install-docker-on-windows-wsl-without-docker-desktop-34m9)
- Node.js

## Ubuntu

```
sudo apt update && sudo apt install maven docker docker-compose nodejs npm openjdk-17-jdk && sudo dockerd
```

## Running the project locally

1. Run `docker-compose up` to start the database and the keycloak instance
2. Run `cd backend && mvn package && mvn quarkus:dev` to start the backend
3. Run `cd frontend && npm install && npm run start` to start the frontend

Open [http://localhost:4200](http://localhost:4200) and login with one of the following users:

| Username | Password | Role  |
|----------|----------| ----- |
| luke     | test     | admin |
| leia     | test     | user  |
| yoda     | test     | tecswap|

## Working with Keycloak

The realm configuration is taken from this repository: https://github.com/mauriciovigolo/keycloak-angular/blob/master/example/config/realm-keycloak-angular-width: 200px;
height: 100px;
background-color: red;andbox.json

Keycloak does not support exporting a realm with users in the Admin UI so this task needs to be done via terminal and cli.

Run `docker-compose up -d` and then simply execute:

```
docker exec -it tecradar_keycloak_1 ./opt/keycloak/bin/kc.sh export --dir ./tmp/export --realm keycloak-angular-sandbox --users realm_file
```

After that you will find a `keycloak-angular-sandbox-realm.json` in the `./docker` directory.

## Crafting a new release

1. Create a release branch with following naming schema: `release/*.*.*` ([SemVer](https://semver.org/))
2. Adjust version numbers in following files:
   1. `frontend/package.json`
   2. `backend/pom.xml`
   3. `kubernetes/backend/backend-deployment.yaml`
   4. `kubernetes/frontend/frontend-deployment.yaml`
3. Open pull request against the `dev` and `main` branch:
   1. `[dev] release/*.*.*`
   2. `[main] release/*.*.*`
4. Merge both pull requests as soon as all GitHub Actions succeed 🚀

Note: If a new env variables is added, adjust kubernetes configuration (tec-radar-cm.yaml)!