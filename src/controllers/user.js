const jwt = require('jsonwebtoken')
const {Env} = require("../env/env");
const { ResponseType, PermissionType } = require("../utils/type")

exports.User = class User {
    constructor(db, mail) {
        this.users = db.collection('users')
        this.mail = mail
        this.env = new Env()
    }

    async change(req, res) {
        const {
            token,
            email,
            firstname,
            lastname,
            address,
            zipcode
        } = req.body

        if (!token) {
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

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            if (email === decoded.email) {
                Promise.all([
                    this.users.updateOne({
                        "email": email
                    }, {
                        $set: {
                            "firstname": firstname,
                            "lastname": lastname,
                            "address": address,
                            "zipcode": zipcode
                        }
                    }, {
                        upsert: true
                    }),
                    this.mail.send(email, "Changement d'information", `Les informations de votre compte ont bien étaient mis à jour`)
                ])
                return {
                    status: "success",
                    type: ResponseType.SUCCESS
                }
            }

            const user = await this.users.findOne({ email: decoded.email })

            for (const permission of user.permissions) {
                if (permission === PermissionType.CHANGE_INFORMATION) {
                    Promise.all([
                        this.users.updateOne({
                            "email": email
                        }, {
                            $set: {
                                "firstname": firstname,
                                "lastname": lastname,
                                "address": address,
                                "zipcode": zipcode
                            }
                        }, {
                            upsert: true
                        }),
                        this.mail.send(email, "Changement d'information", `Les informations de votre compte ont bien étaient mis à jour`)
                    ])
                    return {
                        status: "success",
                        type: ResponseType.SUCCESS
                    }
                }
            }

            return {
                status: "error",
                type: ResponseType.PERMISSION_ERROR
            }
        } catch (e) {
            return {
                status: "error",
                type: ResponseType.ERROR
            }
        }
    }

    async delete(req, res) {
        const {
            token,
            email
        } = req.body

        if (!token) {
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

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            const user = await this.users.findOne({ email: decoded.email })

            for (const permission of user.permissions) {
                if (permission === PermissionType.DELETE_USER) {
                    Promise.all([
                        this.users.deleteOne({ email }),
                        this.mail.send(email, "Compte supprimé", "Votre compte à étais supprimé")
                    ])

                    return {
                        status: "success",
                        type: ResponseType.SUCCESS 
                    }
                }
            }

            return {
                status: "error",
                type: ResponseType.PERMISSION_ERROR
            }
        } catch (e) {
            return {
                status: "error",
                type: ResponseType.ERROR
            }
        }
    }

    async get(req, res) {
        const {
            token,
            email
        } = req.body

        if (!token) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            if (email === decoded.email || !email) {
                const {
                    firstname,
                    lastname,
                    email,
                    zipcode,
                    address,
                    contacts,
                    enterprise
                } = await this.users.findOne({ email: decoded.email })
                return {
                    status: "success",
                    type: ResponseType.SUCCESS, 
                    data: {
                        firstname,
                        lastname,
                        email,
                        zipcode,
                        address,
                        contacts,
                        enterprise
                    }
                }
            }

            const [user, me] = await Promise.all([
                this.users.findOne({ email }),
                this.users.findOne({ email: decoded.email })
            ])

            for (const permission of me.permissions) {
                if (permission === PermissionType.GET_USER_INFORMATION) {
                    return {
                        status: "success",
                        type: ResponseType.SUCCESS, 
                        data: {
                            firstname: user.firstname,
                            lastname: user.lastname,
                            email: user.email,
                            zipcode: user.zipcode,
                            address: user.address,
                            contacts: user.contacts,
                            enterprise: user.enterprise
                        }
                    }
                }
            }

            return {
                status: "error",
                type: ResponseType.PERMISSION_ERROR
            }
        } catch (e) {
            return {
                status: "error",
                type: ResponseType.ERROR 
            }
        }
    }
}