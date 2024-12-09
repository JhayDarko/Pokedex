const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const pokemonData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'pokemon.json'), 'utf8'));

router.get('/', (req, res) => {
    res.render('index', { pokemons: pokemonData });
});

router.get('/pokemon/:name', (req, res) => {
    const pokemon = pokemonData[req.params.name.toLowerCase()];
    if (pokemon) {
        res.render('pokemon', { pokemon });
    } else {
        res.status(404).send('Pokémon no encontrado');
    }
});

module.exports = router;
