const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const pokemonData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'pokemon.json'), 'utf8'));

function groupByGeneration(pokemonData) {
  const generations = {};

  Object.keys(pokemonData).forEach((pokemonKey) => {
    const pokemon = pokemonData[pokemonKey];
    const gen = pokemon.generation;

    if (!generations.hasOwnProperty(gen)) {
      generations[gen] = [];
    }
    if (!generations[gen].some(p => p.key === pokemonKey)) {
      generations[gen].push({ key: pokemonKey, ...pokemon });
    }
  });

  return generations;
}

const groupedPokemons = groupByGeneration(pokemonData);

router.get('/', (req, res) => {
  res.render('index', { generations: groupedPokemons });
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