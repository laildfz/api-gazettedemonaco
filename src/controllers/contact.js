const {Env} = require("../env/env");
const jwt = require('jsonwebtoken') 
const { ResponseType, PermissionType } = require("../utils/type")

exports.Contact = class Contact {
    constructor(db, mail) {
        this.users = db.collection('users')
        this.mail = mail
        this.env = new Env()
    }

    async add(req, res) {
        const {
            token,
            email,
            contactmail,
            firstname,
            lastname,
            role,
            tel
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

        if (!contactmail) {
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

        if (!role) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!tel) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            if (decoded.email === email || !email) {
                const user = await this.users.findOne({email: decoded.email})

                for (const p of user.permissions) {
                    if (p === PermissionType.ADD_CONTACT) {
                        user.contacts.push({contactmail, firstname, lastname, role, tel})

                        Promise.all([
                            this.users.updateOne({
                                "email": decoded.email
                            }, {
                                $set: {
                                    "contacts": user.contacts
                                }
                            }, {
                                upsert: true
                            }),
                            this.mail.send(decoded.email, "Ajout de contact", `<h1> Un contact vous a été ajouter </p>`)
                        ])
                        return {
                            status: "success",
                            type: ResponseType.SUCCESS
                        }
                    }
                }
            } else {
                const [
                    me,
                    user
                ] = await Promise.all([
                    this.users.findOne({email: decoded.email}),
                    this.users.findOne({email})
                ])

                for (const p of me.permissions) {
                    if (p === PermissionType.ADD_CONTACT) {
                        user.contacts.push({contactmail, firstname, lastname, role, tel})

                        Promise.all([
                            this.users.updateOne({
                                "email": email
                            }, {
                                $set: {
                                    "contacts": user.contacts
                                }
                            }, {
                                upsert: true
                            }),
                            this.mail.send(email, "Ajout de contact", `<h1> Un contact vous a été ajouter </p>`)
                        ])
                        return {
                            status: "success",
                            type: ResponseType.SUCCESS
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

    async delete(req, res) {
        const {
            token,
            email,
            contact
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

        if (!contact) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            if (decoded.email === email || !email) {
                const user = await this.users.findOne({email: decoded.email})

                for (const p of user.permissions) {
                    if (p === PermissionType.DELETE_CONTACT) {
                        user.contacts = user.contacts.filter(e => e.tel !== contact[0].tel)
                        Promise.all([
                            this.users.updateOne({
                                "email": decoded.email
                            }, {
                                $set: {
                                    "contacts": user.contacts
                                }
                            }, {
                                upsert: true
                            }),
                            this.mail.send(decoded.email, "Suppresion de contact", `<h1> Un contact vous a été ajouter </p>`)
                        ])
                        return {
                            status: "success",
                            type: ResponseType.SUCCESS
                        }
                    }
                }
            } else {
                const [
                    me,
                    user
                ] = await Promise.all([
                    this.users.findOne({email: decoded.email}),
                    this.users.findOne({email})
                ])

                for (const p of me.permissions) {
                    if (p === PermissionType.DELETE_CONTACT) {
                        user.contacts = user.contacts.filter(e => e.tel !== contact[0].tel)
                        Promise.all([
                            this.users.updateOne({
                                "email": email
                            }, {
                                $set: {
                                    "contacts": user.contacts
                                }
                            }, {
                                upsert: true
                            }),
                            this.mail.send(email, "Suppresion de contact", `<h1> Un contact vous a été ajouter </p>`)
                        ])
                        return {
                            status: "success",
                            type: ResponseType.SUCCESS
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
                message: ResponseType.ERROR
            }
        }
    }

    async get(req, res) {
        const {
            token,
            email,
        } = req.body

        if (!token) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            if (decoded.email === email || !email) {
                const user = await this.users.findOne({email: decoded.email})

                for (const p of user.permissions) {
                    if (p === PermissionType.GET_CONTACT) {
                        return {
                            status: "success",
                            type: ResponseType.SUCCESS, 
                            data: {
                                contacts: user.contacts
                            }
                        }
                    }
                }
            } else {
                const [
                    me,
                    user
                ] = await Promise.all([
                    this.users.findOne({email: decoded.email}),
                    this.users.findOne({email})
                ])

                for (const p of me.permissions) {
                    if (p === PermissionType.SUCCESS) {
                        return {
                            status: "success",
                            type: ResponseType.SUCCESS,
                            data: {
                                contacts: user.contacts
                            }
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

