const jwt = require('jsonwebtoken')
const argon2 = require('argon2')
const {
    Env
} = require("../env/env");
const {
    ResponseType
} = require("../utils/type")

exports.Auth = class Auth {
    constructor(db, mail) {
        this.users = db.collection('users')
        this.mail = mail
        this.env = new Env()
    }

    async register(req, res) {
        const {
            email,
            firstname,
            lastname,
            password,
            enterprise,
            contacts,
            address,
            zipcode
        } = req.body

        const permissions = []
        const active = true
        const tmp = "626265115151747841511"

        if (!email) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!firstname) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!lastname) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!password) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!enterprise) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!contacts) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!address) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!zipcode) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        const userExist = await this.users.findOne({
            email
        })

        if (userExist) {
            return {
                status: "error",
                type: ResponseType.USER_EXIST
            }
        }

        Promise.all([
            this.users.insertOne({
                email,
                firstname,
                lastname,
                password: (await argon2.hash(password)),
                enterprise,
                contacts,
                address,
                zipcode,
                permissions,
                active,
                tmp
            }),
            this.mail.send(email, "Inscription réussis !", "<h1> Vous venez de vous inscrires ! </h1>")
        ])

        return {
            status: "success",
            type: ResponseType.SUCCESS
        }
    }

    async verify(req, res) {
        const {
            token
        } = req.body

        if (!token) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        try {
            await jwt.verify(token, (await this.env.get("SECRET")))

            return {
                status: "success",
                type: ResponseType.SUCCESS
            }
        } catch (e) {
            return {
                status: "error",
                type: ResponseType.ERROR
            }
        }
    }

    async login(req, res) {
        const {
            email,
            password
        } = req.body

        if (!email) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!password) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        const user = await this.users.findOne({
            email
        })

        if (!user) {
            return {
                status: "error",
                type: ResponseType.USER_NOT_EXIST
            }
        }

        const match = await argon2.verify(user.password, password)

        if (!match) {
            return {
                status: "error",
                type: ResponseType.PASSWORD_ERROR
            }
        }

        const token = await jwt.sign({
            email: user.email
        }, (await this.env.get("SECRET")))

        return {
            status: "success",
            type: ResponseType.SUCCESS,
            token
        }
    }

    async forgot(req, res) {
        const {
            email
        } = req.body

        if (!email) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        const user = await this.users.findOne({
            email
        })

        if (!user) {
            return {
                status: "error",
                type: ResponseType.USER_NOT_EXIST
            }
        }

        const tmp = Math.floor(Math.random() * (500 - 10 + 1)) + 10;

        Promise.all([
            this.users.updateOne({
                "email": email
            }, {
                $set: {
                    "tmp": tmp
                }
            }, {
                upsert: true
            }),
            this.mail.send(email, "Mot de passe oublié", `<h1> Mot de passe oubliée </h1> <br> <p> ${tmp} </p>`)
        ])

        return {
            status: "success",
            type: ResponseType.SUCCESS
        }
    }

    async recovery(req, res) {
        const {
            tmp,
            email,
            password
        } = req.body

        if (!tmp) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!email) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!password) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        const user = await this.users.findOne({
            email
        })

        if (tmp != user.tmp) {
            return {
                status: "error",
                type: ResponseType.TMP_ERROR
            }
        }

        Promise.all([
            this.users.updateOne({
                "email": email
            }, {
                $set: {
                    "tmp": "",
                    "password": (await argon2.hash(password))
                }
            }, {
                upsert: true
            }),
            this.mail.send(email, "Changement de mot de passe", "Vous venez de faire un changement de mot de passe, si ce n'est pas vous, signalez le au superadmin !")
        ])

        return {
            status: "success",
            type: ResponseType.SUCCESS
        }
    }
}