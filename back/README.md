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
# Configure teams in seed.ts
yarn run db seed

# Start dev server
yarn run dev
```

## Usage

* Restarting manual count
This will save a backup of the current database, seed a new one, and restart the server
```sh
curl -X POST "http://localhost:3000/reset-db"
```

## Note

This project makes use of [Sequelize](http://docs.sequelizejs.com/). Also check out:

- [Sequelize TypeScript](https://github.com/RobinBuschmann/sequelize-typescript)
