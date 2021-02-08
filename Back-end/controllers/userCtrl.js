const bcrypt = require('bcrypt');
const jwbtk = require('jsonwebtoken');
const User = require('../models/userMdl');
const schema = require('../models/password');
exports.signUp = (req, res, next) => { // Inscription \\
    if (schema.validate(req.body.password)) {
        bcrypt.hash(req.body.password, 10) // Hash du mot de passe avec salage \\ 
            .then(hash => {
                const user = new User({
                    email: req.body.email,
                    password: hash
                });
                user.save() // Ajout dans la base de donnée \\ 
                    .then(() => res.status(201).json({ message: 'Success users create' }))
                    .catch(error => res.status(400).json({ error }))
            })
            .catch(error => res.status(500).json({ error }))
    } else {
        return res.status(400).json({ message: 'Erreur' })
    }
}

exports.login = (req, res, next) => { // Connexion \\ 
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'User or password not correct!' })
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'User or password not correct' })
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwbtk.sign({ userId: user._id }, 'RANDOM_TOKEN_SECRET', { expiresIn: '24h' }) // Token assigné pendant 24h \\
                    })
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
}