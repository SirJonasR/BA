# Using [Liquibase](https://www.liquibase.org) for database migration

_**Hint:**_ The folder for the changelogs is now `src/main/resources/db`, which allows running the migration scripts during application startup.

## How to use it

- Create a copy of the liquibase.properties file with the settings for the database connection you want to use
  (or set all the needed configuration properties in your command line)
- Goto the backend folder
- Call
  `mvn liquibase:update -D liquibase.changeLogFile=src/main/ressources/db/changelog.json -D liquibase.propertyFile=<path to your properties file> -D liquibase.password=<db user password>`
  to update the configured database to the actual version described by the changelog file in the db folder
- Call
  `mvn liquibase:help`
  to get information of all available commands

## How to create a Changeset

- Necessary Database Changes should be clarified in the Task Description
- Create Changeset as new changelog file in Folder "changelogs".
  - JSON-Format
  - Name should be the name of the Task (Ticket number for reference)
- Changelog Header:

```
{
  "databaseChangeLog": [
    {

    }
  ]
}
```

- The individual unit of change will be added in this changelog as a changeset. Example:

```
"changeSet": {
        "id": "123-AddColumn",
        "author": "Erik",
        "changes": [
          {
            "addColumn": {
              "column": {
                "name": "description",
                "type": "VARCHAR(1000)"
              },
              "schemaName": "public",
              "tableName": "Test"
            }
          }
        ]
      }
```

- Include new Changelog file to changelog.json:

```
{
  "include": {
    "file": "changelogs/169-kurzbeschreibung.json",
    "relativeToChangelogFile": true
  }
}
```

Overview of all the different Change-Types with examples:

- https://docs.liquibase.com/change-types/home.html#entities

More Information:

- https://docs.liquibase.com/concepts/changelogs/home.html
- https://docs.liquibase.com/concepts/changelogs/changeset.html
