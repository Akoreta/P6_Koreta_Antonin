const passwordValidator = require('password-validator');

const schema = new passwordValidator();

schema
    .is().min(8) // Minimum 8 caractères 
    .is().max(100) // Maximum 100 caractères
    .has().uppercase() // Au moins une majuscule 
    .has().lowercase()
    .has().digits(2) // Au moins 2 chiffres
    .has().not().spaces() // Pas d'espaces
    .is().not().oneOf(['Passw0rd', 'Password123', 'password', 'Password', 'motdepasse', 'Motdepasse', 'azertyui']); // Blacklist

module.exports = schema;