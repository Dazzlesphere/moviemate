const axios = require("axios");
require("dotenv").config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/**
 * Fetch movie recommendations based on genre(s), actor(s), and year.
 * @param {Object} options - Movie filter options.
 * @param {string | string[]} options.genre - Single genre or array of genres.
 * @param {string | string[]} options.actors - Single actor or array of actors.
 * @param {number} options.year - Release year of the movie.
 * @returns {Promise<Object[]>} - List of movie recommendations.
 */
async function getMovieRecommendations(options = {}) {
    try {
        let { genre, actor, actors, year } = options;

        // Ensure genre and actors are arrays if not already
        let genreNames = Array.isArray(genre) ? genre : genre ? [genre] : [];
        let actorNames = Array.isArray(actors) ? actors : actor ? [actor] : [];

        let genreIds = genreNames.length > 0 ? await getGenreIds(genreNames) : [];
        let actorIds = actorNames.length > 0 ? await getActorIds(actorNames) : [];

        // Construct query parameters dynamically
        let queryParams = {
            api_key: TMDB_API_KEY,
            language: "en-US",
            sort_by: "popularity.desc",
            page: 1,
            ...(genreIds.length > 0 && { with_genres: genreIds.join(",") }),
            ...(actorIds.length > 0 && { with_cast: actorIds.join(",") }),
            ...(year && { primary_release_year: year })
        };

        // Fetch movies from TMDB
        const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, { params: queryParams });

        // Process and return results
        const movies = response.data.results.map(movie => ({
            title: movie.title,
            overview: movie.overview,
            release_date: movie.release_date,
            rating: movie.vote_average,
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null
        }));

        return movies.length > 0 ? movies.slice(0, 5) : [];

    } catch (error) {
        console.error("Error fetching movie recommendations:", error);
        return ["Sorry, an error occurred while fetching movie recommendations."];
    }
}

/**
 * Convert genre names to TMDB genre IDs.
 */
async function getGenreIds(genreNames) {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
            params: { api_key: TMDB_API_KEY, language: "en-US" }
        });

        const genreMap = response.data.genres.reduce((map, genre) => {
            map[genre.name.toLowerCase()] = genre.id;
            return map;
        }, {});

        return genreNames.map(name => genreMap[name.toLowerCase()]).filter(id => id);
    } catch (error) {
        console.error("Error fetching genre IDs:", error);
        return [];
    }
}

/**
 * Convert actor names to TMDB actor IDs.
 */
async function getActorIds(actorNames) {
    try {
        const actorIds = [];
        for (const actorName of actorNames) {
            const response = await axios.get(`${TMDB_BASE_URL}/search/person`, {
                params: { api_key: TMDB_API_KEY, query: actorName }
            });

            if (response.data.results.length > 0) {
                actorIds.push(response.data.results[0].id);
            }
        }
        return actorIds;
    } catch (error) {
        console.error("Error fetching actor IDs:", error);
        return [];
    }
}

module.exports = { getMovieRecommendations };
