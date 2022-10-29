const {
    Env
} = require("../env/env")

const nodemailer = require("nodemailer")

exports.Mail = class Mail {
    constructor() {
        this.env = new Env()
    }

    async init() {
        this.mail = nodemailer.createTransport({
            host: await this.env.get("HOST_MAIL"),
            port: 25,
            auth: {
                user: await this.env.get("USER_MAIL"),
                pass: await this.env.get("PASS_MAIL")
            }
        })
    }

    async send(to, subject, html) {
        await this.mail.sendMail({
            from: await this.env.get("USER_MAIL"),
            to,
            subject,
            html
        })
    }
}