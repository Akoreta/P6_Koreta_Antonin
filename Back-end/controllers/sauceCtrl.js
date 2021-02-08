const Sauce = require('../models/sauceMdl');
const fs = require('fs'); // File system \\
const sauceReg = new RegExp(/^[a-z,-,é,è,.'-\s]+$/i);

exports.getSauce = (req, res, next) => { // Toutes les sauces \\ 
    Sauce.find()
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }))
}

exports.getOne = (req, res, next) => { // Une seule sauce avec id_ dans les paramètres \\ 
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }))
}

exports.create = (req, res, next) => { // Création \\
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    if (sauceReg.test(sauce.name) === true && sauceReg.test(sauce.description) === true && sauceReg.test(sauce.manufacturer) === true && sauceReg.test(sauce.mainPepper) === true) {
        sauce.save()
            .then(() => res.status(201).json({ message: 'Success create sauce' }))
            .catch(error => res.status(404).json({ error }));
    } else {
        res.status(400).json({ message: 'Only characters' })
    }
}

exports.editSauce = (req, res, next) => { // Modification de la sauce :id\\
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body };
    if (sauceReg.test(sauceObject.name) === true && sauceReg.test(sauceObject.description) === true && sauceReg.test(sauceObject.manufacturer) === true && sauceReg.test(sauceObject.mainPepper) === true) {
        Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Success edit sauce' }))
            .catch(error => res.status(404).json({ error }))
    } else {
        res.status(400).json({ message: 'Only characters' })
    }
}

exports.deleteSauce = (req, res, next) => { // Supprimer sauce :id \\ 
    Sauce.findOne({ _id: req.params.id })
        .then(Sauce => {
            const fileName = Sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${fileName}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Success delete sauce' }))
                    .catch(error => res.status(400).json({ error }))
            })
        })
}

exports.likeSauce = (req, res, next) => { // Like sauce :id \\
    let likeUser = req.body.like;
    switch (likeUser) {
        case 1: // Like \\ 
            Sauce.updateOne({ _id: req.params.id }, {
                    $push: { usersLiked: req.body.userId },
                    $inc: { likes: +1 }
                })
                .then(() => res.status(200).json({ message: 'Like' }))
                .catch(error => res.status(400).json({ error }))
            break

        case 0: // Annule like ou dislike \\ 
            Sauce.findOne({ _id: req.params.id })
                .then(sauce => {
                    if (sauce.usersLiked.includes(req.body.userId)) {
                        Sauce.updateOne({ _id: req.params.id }, {
                                $pull: { usersLiked: req.body.userId },
                                $inc: { likes: -1 }
                            })
                            .then(() => res.status(200).json({ message: 'Like cancel' }))
                            .catch(error => res.status(400).json({ error }))

                    } else if (sauce.usersDisliked.includes(req.body.userId)) {
                        Sauce.updateOne({ _id: req.params.id }, {
                                $pull: { usersDisliked: req.body.userId },
                                $inc: { dislikes: -1 }
                            })
                            .then(() => res.status(200).json({ message: 'Dislike cancel' }))
                            .catch(error => res.status(400).json({ error }))
                    } else {
                        res.status(400).json({ message: 'Error' })
                    }

                })
            break

        case -1: // Dislike \\ 
            Sauce.updateOne({ _id: req.params.id }, {
                    $push: { usersDisliked: req.body.userId },
                    $inc: { dislikes: +1 }
                })
                .then(() => res.status(200).json({ message: 'Dislike' }))
                .catch(error => res.status(400).json({ error }))
            break
    }

}