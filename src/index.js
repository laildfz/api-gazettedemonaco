const {
    MongoDB
} = require("./database/database")
const {
    Env
} = require("./env/env")
const { Mail } = require("./mail/mail")
const {
    Routers
} = require("./routers/routers")

async function main() {
    try {
        const client = await (new MongoDB()).config()
        const mail = new Mail()

        await mail.init()

        const routers = new Routers()

        const DBNAME = await (new Env()).get("DBNAME")

        await routers.init(client.db(DBNAME), mail)

        routers.handle()
        routers.listen()
    } catch (e) {
        throw e
    }
}

main()