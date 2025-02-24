import Pokemon from "../models/pokemon";
import POKEMONS from "../models/mock-pokemon";

export default class PokemonService {
  static pokemons: Pokemon[] = POKEMONS;
  static isDev = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');

  static getPokemons(): Promise<Pokemon[]> {
    if (this.isDev) {
      return fetch('http://localhost:3001/pokemons')
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          return response.json();
        })
        .catch(error => this.handleError(error));
    }
    return Promise.resolve(this.pokemons);
  }

  static getPokemon(id: number): Promise<Pokemon | null> {
    if (this.isDev) {
      return fetch(`http://localhost:3001/pokemons/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          return response.json();
        })
        .then(data => this.isEmpty(data) ? null : data)
        .catch(error => this.handleError(error));
    }
    const foundPokemon = this.pokemons.find(pokemon => pokemon.id === id);
    return Promise.resolve(foundPokemon || null);
  }

  static updatePokemon(pokemon: Pokemon): Promise<Pokemon> {
    if (this.isDev) {
      return fetch(`http://localhost:3001/pokemons/${pokemon.id}`, {
        method: 'PUT',
        body: JSON.stringify(pokemon),
        headers: { 'Content-Type': 'application/json' }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          return response.json();
        })
        .catch(error => this.handleError(error));
    }
    const index = this.pokemons.findIndex(p => p.id === pokemon.id);
    if (index === -1) {
      return Promise.reject(new Error(`Pokemon avec l'id ${pokemon.id} non trouvé`));
    }
    this.pokemons[index] = pokemon;
    return Promise.resolve(pokemon);
  }

  static deletePokemon(pokemon: Pokemon): Promise<{}> {
    if (this.isDev) {
      return fetch(`http://localhost:3001/pokemons/${pokemon.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          return response.json();
        })
        .catch(error => this.handleError(error));
    }
    this.pokemons = this.pokemons.filter(p => p.id !== pokemon.id);
    return Promise.resolve({});
  }

  static addPokemon(pokemon: Pokemon): Promise<Pokemon> {
    if (pokemon.created) {
      delete (pokemon as any).created;
    }
    if (this.isDev) {
      return fetch('http://localhost:3001/pokemons', {
        method: 'POST',
        body: JSON.stringify(pokemon),
        headers: { 'Content-Type': 'application/json' }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          return response.json();
        })
        .catch(error => this.handleError(error));
    }
    this.pokemons.push(pokemon);
    return Promise.resolve(pokemon);
  }

  static searchPokemon(term: string): Promise<Pokemon[]> {
    if (this.isDev) {
      return fetch(`http://localhost:3001/pokemons?q=${term}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          return response.json();
        })
        .catch(error => this.handleError(error));
    }
    const results = this.pokemons.filter(pokemon => pokemon.name.includes(term));
    return Promise.resolve(results);
  }

  static isEmpty(data: Object): boolean {
    return Object.keys(data).length === 0;
  }

  static handleError(error: Error): never {
    console.error(error);
    throw error;
  }
}
