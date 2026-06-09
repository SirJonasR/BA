# TecRadar Backend Project

This project uses Quarkus, the Supersonic Subatomic Java Framework.

If you want to learn more about Quarkus, please visit its website: https://quarkus.io/ .

## Running the application in dev mode

You can run your application in dev mode that enables live coding using:

```shell script
./mvnw quarkus:dev
```

> **_NOTE:_** Quarkus now ships with a Dev UI, which is available in dev mode only at http://localhost:8080/q/dev/.

## JavaDoc

You can generate JavaDoc by calling

```shell script
./mvnw javadoc:javadoc
```

Afterwards you can open the Documentation at `target/site/apidocs/index.html` in your Browser

## OpenAPI/Swagger

The Swagger UI is available when running in dev mode using the url http://localhost:9090/q/swagger-ui

## Code quality

To provide unified code, code format check and checkstyle checks are included in the pom file and executed during the `validate` phase.
You can prove or format code manually by calling

```shell script
# run checkstyle checks
./mvnw checkstyle:check

# check code format
./mvnw git-code-format:validate-code-format -Dgcf.globPattern=**/*

# format code
./mvnw git-code-format:format-code
```

## Packaging and running the application

The application can be packaged using:

```shell script
./mvnw package
```

It produces the `quarkus-run.jar` file in the `target/quarkus-app/` directory.
Be aware that it’s not an _über-jar_ as the dependencies are copied into the `target/quarkus-app/lib/` directory.

The application is now runnable using `java -jar target/quarkus-app/quarkus-run.jar`.

If you want to build an _über-jar_, execute the following command:

```shell script
./mvnw package -Dquarkus.package.type=uber-jar
```

The application, packaged as an _über-jar_, is now runnable using `java -jar target/*-runner.jar`.

## Creating a native executable

You can create a native executable using:

```shell script
./mvnw package -Pnative
```

Or, if you don't have GraalVM installed, you can run the native executable build in a container using:

```shell script
./mvnw package -Pnative -Dquarkus.native.container-build=true
```

You can then execute your native executable with: `./target/tecradar-1.0.0-SNAPSHOT-runner`

If you want to learn more about building native executables, please consult https://quarkus.io/guides/maven-tooling.
