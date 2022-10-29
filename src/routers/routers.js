const fastify = require('fastify')
const {Contact} = require("../controllers/contact");
const {Permission} = require("../controllers/permission");
const {Pub} = require("../controllers/pub");
const {User} = require("../controllers/user");
const { Imo } = require("../controllers/imo")
const {
    Env
} = require('../env/env')
const {
    Auth
} = require("../controllers/auth")

exports.Routers = class Routers {
    constructor() {
        this.server = fastify()
        this.env = new Env()

        this.server.register(require('fastify-cors'), {
            origin: (origin, cb) => {
                cb(null, true)
            }
        })

        this.server.register(require('fastify-file-upload'))
    }

    async init(db, mail) {
        this.auth    = new Auth(db, mail)
        this.user    = new User(db, mail)
        this.perm    = new Permission(db, mail)
        this.contact = new Contact(db, mail)
        this.pub     = new Pub(db, mail)
        this.imo     = new Imo(db, mail) 
    }

    handle() {
        this.server.post('/api/auth/register', this.auth.register.bind(this.auth))
        this.server.post('/api/auth/login', this.auth.login.bind(this.auth))
        this.server.post('/api/auth/forgot', this.auth.forgot.bind(this.auth))
        this.server.post('/api/auth/recovery', this.auth.recovery.bind(this.auth))
        this.server.post('/api/auth/verify', this.auth.verify.bind(this.auth))

        this.server.post('/api/user/change', this.user.change.bind(this.user))
        this.server.post('/api/user/delete', this.user.delete.bind(this.user))
        this.server.post('/api/user/get', this.user.get.bind(this.user))

        this.server.post('/api/perm/add', this.perm.add.bind(this.perm))
        this.server.post('/api/perm/delete', this.perm.delete.bind(this.perm))
        this.server.post('/api/perm/get', this.perm.get.bind(this.perm))

        this.server.post('/api/contact/add', this.contact.add.bind(this.contact))
        this.server.post('/api/contact/delete', this.contact.delete.bind(this.contact))
        this.server.post('/api/contact/get', this.contact.get.bind(this.contact))

        this.server.post('/api/pub/create', this.pub.create.bind(this.pub))
        this.server.post('/api/pub/delete', this.pub.delete.bind(this.pub))
        this.server.post('/api/pub/get', this.pub.get.bind(this.pub))

        this.server.post('/api/imo/create', this.imo.create.bind(this.imo))
        this.server.post('/api/imo/delete', this.imo.delete.bind(this.imo))
        this.server.post('/api/imo/get', this.imo.get.bind(this.imo))
    }

    listen() {
        this.env.get("PORT")
            .then(port => this.server.listen(port, () => console.log(`Listening on port ${port}`)))
            .catch(console.error)
    }
}
