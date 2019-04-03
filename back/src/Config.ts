export const EXPRESS = {
    IP: process.env.IP || "0.0.0.0",
    PORT: process.env.PORT || "3000"
}

export const CONNECTION = {
    TYPE: process.env.CONNECTION_TYPE || "sqlite",
    HOST: process.env.CONNECTION_HOST || "0.0.0.0",
    PORT: process.env.CONNECTION_PORT || "5432",
    USERNAME: process.env.CONNECTION_USERNAME || "root",
    PASSWORD: process.env.CONNECTION_PASSWORD || "",
    DATABASE: process.env.CONNECTION_DATABASE || "storage/database/database.sql",
}

export const TEAM = {
    LAP_DELAY: "15"
}