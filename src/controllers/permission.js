const {Env} = require("../env/env")
const jwt = require('jsonwebtoken')
const { ResponseType, PermissionType } = require("../utils/type")

exports.Permission = class Permission {
    constructor(db, mail) {
        this.users = db.collection('users')
        this.mail = mail
        this.env = new Env()
    }

    async add(req, res) {
        const {
            token,
            email,
            permission
        } = req.body

        if (!token) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!permission) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            if (decoded.email === email || !email) {
                const me = await this.users.findOne({email: decoded.email})

                for (const p of me.permissions) {
                    if (p === PermissionType.ADD_PERMISSION) {
                        me.permissions.push(permission)

                        Promise.all([
                            this.users.updateOne({
                                "email": decoded.email
                            }, {
                                $set: {
                                    "permissions": me.permissions,
                                }
                            }, {
                                upsert: true
                            }),
                            this.mail.send(decoded.email, "Mis à jour des permissions", `Vos permissions ont étaient mis à jour !`)
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
                    if (p === PermissionType.ADD_PERMISSION) {
                        user.permissions.push(permission)
                        Promise.all([
                            this.users.updateOne({
                                "email": email
                            }, {
                                $set: {
                                    "permissions": user.permissions,
                                }
                            }, {
                                upsert: true
                            }),
                            this.mail.send(email, "Mis à jour des permissions", `Vos permissions ont étaient mis à jour !`)
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
            permission
        } = req.body

        if (!token) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!permission) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        try {
            const decoded = jwt.verify(token, (await this.env.get("SECRET")))

            if (decoded.email === email || !email) {
                let user = await this.users.findOne({email: decoded.email})
                for (const p of user.permissions) {
                    if (p === PermissionType.DELETE_PERMISSION) {
                        user.permissions = user.permissions.filter(e => e !== permission)
                        Promise.all([
                            this.users.updateOne({
                                "email": decoded.email
                            }, {
                                $set: {
                                    "permissions": user.permissions,
                                }
                            }, {
                                upsert: true
                            }),
                            this.mail.send(decoded.email, "Supression d'une permissions", `Vos permissions ont étaient mis à jour !`)
                        ])
                        return {
                            status: "success",
                            type: ResponseType.SUCCESS 
                        }
                    }
                }
            } else {
                let [
                    me,
                    user
                ] = await Promise.all([
                    this.users.findOne({email: decoded.email}),
                    this.users.findOne({email})
                ])

                for (const p of me.permissions) {
                    if (p === PermissionType.DELETE_PERMISSION) {
                        user.permissions = user.permissions.filter(e => e !== permission)
                        Promise.all([
                            this.users.updateOne({
                                "email": decoded.email
                            }, {
                                $set: {
                                    "permissions": user.permissions,
                                }
                            }, {
                                upsert: true
                            }),
                            this.mail.send(email, "Supression d'une permissions", `Vos permissions ont étaient mis à jour !`)
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

        if (!email) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            if (decoded.email === email || !email) {
                const user = await this.users.findOne({ email: decoded.email })

                for (const p of user.permissions) {
                    if (p === PermissionType.GET_PERMISSION) {
                        return {
                            status: "success",
                            type: ResponseType.SUCCESS,
                            data: {
                                permissions: user.permissions
                            }
                        }
                    }
                }
            } else {
                const [
                    me,
                    user
                ] = await Promise.all([
                    this.users.findOne({ email: decoded.email }),
                    this.users.findOne({ email })
                ])

                for (const p of me.permissions) {
                    if (p === PermissionType.GET_PERMISSION) {
                        return {
                            status: "success", 
                            type: ResponseType.SUCCESS, 
                            data: {
                                permissions: user.permissions
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