const dotenv = require("dotenv")

exports.Env = class Env {
    constructor() {
        dotenv.config()
    }

    get(name) {
        return new Promise((resolve, reject) => {
            const env = process.env[name] || ""

            if (!env) {
                return reject(name + " env not exist")
            }

            return resolve(env)
        })
    }
}