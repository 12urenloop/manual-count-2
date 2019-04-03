# Count Manuel

## Running in production

```bash
# Configure teams in seed.ts
yarn run db seed

# Build the package
yarn run build

# Start server
yarn run start
```

## Running in development

```bash
yarn run dev
```

## Note

This project makes use of [Sequelize](http://docs.sequelizejs.com/). Also check out:

- [Sequelize TypeScript](https://github.com/RobinBuschmann/sequelize-typescript)
- [Sequelize CLI](https://github.com/sequelize/cli)

Commands to run (e.q. `yarn run db db:create`):

```bash
Sequelize CLI [Node: 6.11.2, CLI: 3.0.0, ORM: 4.8.0]

Commands:
  db:migrate                        Run pending migrations
  db:migrate:schema:timestamps:add  Update migration table to have timestamps
  db:migrate:status                 List the status of all migrations
  db:migrate:undo                   Reverts a migration
  db:migrate:undo:all               Revert all migrations ran
  db:seed                           Run specified seeder
  db:seed:undo                      Deletes data from the database
  db:seed:all                       Run every seeder
  db:seed:undo:all                  Deletes data from the database
  db:create                         Create database specified by configuration
  db:drop                           Drop database specified by configuration
  init                              Initializes project
  init:config                       Initializes configuration
  init:migrations                   Initializes migrations
  init:models                       Initializes models
  init:seeders                      Initializes seeders
  migration:generate                Generates a new migration file       [aliases: migration:create]
  model:generate                    Generates a model and its migration  [aliases: model:create]
  seed:generate                     Generates a new seed file            [aliases: seed:create]

Options:
  --version  Show version number                                         [boolean]
  --help     Show help                                                   [boolean]
```