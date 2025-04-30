// Configurações da API
const API_CONFIG = {
    BASE_URL: 'https://api.sportsdata.io/v3/csgo/scores/json',
    STATS_URL: 'https://api.sportsdata.io/v3/csgo/stats/json',
    // ATENÇÃO: Substitua 'SUA_SPORTSDATA_API_KEY' pela sua chave da SportsData.io
    KEY: 'SUA_SPORTSDATA_API_KEY',
    HEADERS: {
        'Ocp-Apim-Subscription-Key': 'SUA_SPORTSDATA_API_KEY'
    },
    // IDs importantes
    ROUND_ID: '100000138', // ID do round atual
    COMPETITION_ID: '100000009', // ID da competição principal
    // Intervalos de atualização (em milissegundos)
    UPDATE_INTERVALS: {
        TEAMS: 4 * 60 * 60 * 1000, // 4 horas
        PLAYERS: 60 * 60 * 1000, // 1 hora
        SCHEDULE: 5 * 60 * 1000, // 5 minutos
        STATS: 60 * 1000 // 1 minuto
    }
};

// Exportar configurações
export default API_CONFIG; 