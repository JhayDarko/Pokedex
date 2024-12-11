function searchPokemon() {
  const searchTerm = document.getElementById('search').value.toLowerCase();
  const pokemonCards = document.querySelectorAll('.pokemon-card');
  const generations = document.querySelectorAll('.generation');

  generations.forEach(section => {
    section.classList.remove('collapsed');
  });

  let hasResults = false;
  pokemonCards.forEach(card => {
    const pokemonName = card.querySelector('.pokemon-name').textContent.toLowerCase();
    if (pokemonName.includes(searchTerm)) {
      card.style.display = 'block';
      hasResults = true;
    } else {
      card.style.display = 'none';
    }
  });

  generations.forEach(section => {
    const visibleCards = section.querySelectorAll('.pokemon-card:not([style*="display: none"])');
    if (visibleCards.length === 0) {
      section.style.display = 'none';
    } else {
      section.style.display = 'block';
    }
  });
}

function toggleGeneration(generation) {
  const section = document.querySelector(`[data-generation="${generation}"]`);
  section.classList.toggle('collapsed');
}
