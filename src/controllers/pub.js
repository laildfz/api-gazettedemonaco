const jwt = require('jsonwebtoken')
const {Env} = require("../env/env");
const fs = require('fs')
const {
    ResponseType,
    PermissionType
} = require("../utils/type")

exports.Pub = class Pub {
    constructor(db, mail) {
        this.users = db.collection('users')
        this.pub = db.collection('pub')
        this.mail = mail
        this.env = new Env()
    }

    async create(req, res) {
        const {
            token,
            name,
            type,
            link, 
            content, 
            content_tab,
            content_mobile,
            category, 
            date_start, 
            date_fin 
        } = req.body

        const image = req.raw.files.image

        if (!date_fin) { 
            return {
                status: "error", 
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!date_start) {
            return {
                status: "error", 
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!category) {
            return {
                status: "error", 
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!content_mobile) {
            return {
                status: "error", 
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!content_tab) {
            return {
                status: "error", 
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!content) {
            return {
                status: "error", 
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!type) {
            return {
                status: "error", 
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!token) {
            return {
                status: "error", 
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!name) {
            return {
                status: "error", 
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!link) {
            return {
                status: "error", 
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!image) {
            return {
                status: "error", 
                type: ResponseType.MISMATCH_FIELD
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            const me = await this.users.findOne({email: decoded.email})

            for (const p of me.permissions) {
                if (p === PermissionType.CREATE_PUB) {

                    Promise.all([
                        this.pub.insertOne({
                            author: decoded.email,
                            name,
                            type,
                            link, 
                            content, 
                            content_tab,
                            content_mobile,
                            category, 
                            date_start, 
                            date_fin,
                            image: image.name
                        }),
                        this.mail.send(decoded.email, "Création d'une pub", "<h1> Publicité crée </h1>"),
                        fs.writeFile(`${__dirname}/../uploads/${image.name}`, image.data, (e) => {
                            console.log(e)
                        })
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
            name
        } = req.body

        if (!token) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        if (!name) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            const me = await this.users.findOne({email: decoded.email})

            for (const p of me.permissions) {
                if (p === PermissionType.DELETE_PUB) {
                    Promise.all([
                        this.mail.send(decoded.email, "Suppresion d'une pub", "<h1> Publicité supprimé </h1>"),
                        this.pub.deleteOne({
                            name
                        })
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
            token
        } = req.body

        if (!token) {
            return {
                status: "error",
                type: ResponseType.MISMATCH_FIELD
            }
        }

        try {
            const decoded = await jwt.verify(token, (await this.env.get("SECRET")))

            const me = await this.users.findOne({email: decoded.email})

            for (const p of me.permissions) {
                if (p === PermissionType.GET_PUB) {
                    const pub = await this.pub.find({}).toArray()
                    return {
                        status: "success",
                        type: ResponseType.SUCCESS, 
                        data: {
                            pub
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