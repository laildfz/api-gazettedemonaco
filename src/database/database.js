const {
    MongoClient
} = require('mongodb')
const {
    Env
} = require('../env/env')

exports.MongoDB = class MongoDB {
    constructor() {
        this.env = new Env()
    }

    config() {
        return new Promise(async (resolve, reject) => {
            try {
                const URL = await this.env.get("URL")

                const client = await (new MongoClient(URL, { useUnifiedTopology: true })).connect()

                return resolve(client)
            } catch (e) {
                return reject(e)
            }
        })
    }
}