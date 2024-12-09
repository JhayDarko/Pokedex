const fs = require('fs');
const path = require('path');
const axios = require('axios');

const SPRITES_DIR = path.join(__dirname, 'public', 'sprites');

if (!fs.existsSync(SPRITES_DIR)) {
    fs.mkdirSync(SPRITES_DIR, { recursive: true });
}

async function fetchPokemonData() {
    const pokemons = {};

    for (let id = 1; id <= 1025; id++) {
        try {
            const { data: pokemonData } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const { data: speciesData } = await axios.get(pokemonData.species.url);

            const spanishName = speciesData.names.find(name => name.language.name === 'es')?.name || pokemonData.name;
            const color = speciesData.color.name;
            const generation = parseInt(speciesData.generation.url.split('/').slice(-2, -1)[0].replace('generation-', ''));
            const regionMap = {
                1: 'Kanto',
                2: 'Johto',
                3: 'Hoenn',
                4: 'Sinnoh',
                5: 'Unova',
                6: 'Kalos',
                7: 'Alola',
                8: 'Galar',
                9: 'Paldea',
            };
            const region = regionMap[generation] || 'Desconocida';

            const evolutionChainUrl = speciesData.evolution_chain?.url || null;
            let evolutionChain = [];

            if (evolutionChainUrl) {
                const { data: evolutionData } = await axios.get(evolutionChainUrl);
                let current = evolutionData.chain;

                while (current) {
                    evolutionChain.push(current.species.name);
                    current = current.evolves_to[0] || null;
                }
            } else {
                evolutionChain = [pokemonData.name];
            }

            const spriteUrl = pokemonData.sprites.other['official-artwork'].front_default;
            const spritePath = path.join(SPRITES_DIR, `${pokemonData.name}.png`);
            const spriteResponse = await axios.get(spriteUrl, { responseType: 'stream' });

            await new Promise((resolve, reject) => {
                const writeStream = fs.createWriteStream(spritePath);
                spriteResponse.data.pipe(writeStream);
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });

            pokemons[pokemonData.name] = {
                id: id,
                spanishName: spanishName,
                generation: generation,
                region: region,
                types: pokemonData.types.map(type => type.type.name),
                color: color,
                stats: {
                    hp: pokemonData.stats.find(stat => stat.stat.name === 'hp').base_stat,
                    attack: pokemonData.stats.find(stat => stat.stat.name === 'attack').base_stat,
                    defense: pokemonData.stats.find(stat => stat.stat.name === 'defense').base_stat,
                    'special-attack': pokemonData.stats.find(stat => stat.stat.name === 'special-attack').base_stat,
                    'special-defense': pokemonData.stats.find(stat => stat.stat.name === 'special-defense').base_stat,
                    speed: pokemonData.stats.find(stat => stat.stat.name === 'speed').base_stat,
                },
                height: pokemonData.height / 10,
                weight: pokemonData.weight / 10,
                evolutionChain: evolutionChain,
                sprite: `/sprites/${pokemonData.name}.png`,
            };

            console.log(`Datos del Pokémon ${pokemonData.name} generados correctamente.`);
        } catch (error) {
            console.error(`Error al procesar el Pokémon con ID ${id}:`, error.message);
        }
    }

    return pokemons;
}

(async function generatePokemonJson() {
    console.log('Generando archivo JSON de Pokémon...');

    const pokemons = await fetchPokemonData();
    const outputPath = path.join(__dirname, 'data', 'pokemons.json');

    fs.writeFileSync(outputPath, JSON.stringify(pokemons, null, 2));
    console.log(`Archivo JSON generado correctamente en: ${outputPath}`);
})();
