// Navigation handling
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            link.classList.add('active');
            document.getElementById(targetId).classList.add('active');
            // Bloquear rolagem do body quando chat estiver ativo
            if (targetId === 'chat') {
                document.body.classList.add('chat-open');
            } else {
                document.body.classList.remove('chat-open');
            }
        });
    });

    // Load initial news and FURIA data
    loadNews();
    loadFuriaData();
});

// Aguardar o Firebase ser inicializado
async function initializeApp() {
    try {
        // Aguardar a inicialização do Firebase
        await window.firebaseManager.initialize();
        
        // Obter referência do Firestore
        const db = firebase.firestore();
        
        // Função para carregar notícias
        async function loadNews() {
            try {
                const newsContainer = document.getElementById('newsContainer');
                if (!newsContainer) {
                    console.log('Container de notícias não encontrado');
                    return;
                }

                const newsRef = db.collection('news').orderBy('timestamp', 'desc').limit(5);
                const snapshot = await newsRef.get();
                
                let newsHTML = '';
                snapshot.forEach(doc => {
                    const news = doc.data();
                    newsHTML += `
                        <div class="news-item">
                            <h3>${news.title}</h3>
                            <p>${news.content}</p>
                            <span class="news-date">${new Date(news.timestamp).toLocaleDateString()}</span>
                        </div>
                    `;
                });
                
                if (newsHTML === '') {
                    newsHTML = '<p>Nenhuma notícia disponível no momento.</p>';
                }
                
                newsContainer.innerHTML = newsHTML;
            } catch (error) {
                console.error('Erro ao carregar notícias:', error);
                const newsContainer = document.getElementById('newsContainer');
                if (newsContainer) {
                    newsContainer.innerHTML = '<p>Erro ao carregar notícias. Tente novamente mais tarde.</p>';
                }
            }
        }

        // Carregar notícias apenas se o container existir
        if (document.getElementById('newsContainer')) {
            loadNews();
        }

    } catch (error) {
        console.error('Erro ao inicializar app:', error);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeApp);

function createNewsElement(news) {
    const article = document.createElement('article');
    article.className = 'news-card';
    
    article.innerHTML = `
        <img src="${news.imageUrl}" alt="${news.title}" class="news-image">
        <div class="news-content">
            <h3>${news.title}</h3>
            <p>${news.summary}</p>
            <div class="news-meta">
                <span class="news-date">${formatDate(news.timestamp)}</span>
                <button class="like-btn" onclick="toggleLike('${news.id}')">
                    <i class="far fa-heart"></i>
                    <span>${news.likes || 0}</span>
                </button>
            </div>
        </div>
    `;
    
    return article;
}

function formatDate(timestamp) {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

async function toggleLike(newsId) {
    try {
        const newsRef = db.collection('news').doc(newsId);
        const likeRef = db.collection('likes').doc(`${auth.currentUser.uid}_${newsId}`);
        
        const likeDoc = await likeRef.get();
        
        if (likeDoc.exists) {
            await likeRef.delete();
            await newsRef.update({
                likes: firebase.firestore.FieldValue.increment(-1)
            });
        } else {
            await likeRef.set({
                userId: auth.currentUser.uid,
                newsId: newsId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            await newsRef.update({
                likes: firebase.firestore.FieldValue.increment(1)
            });
        }
        
        // Refresh news to update like count
        loadNews();
    } catch (error) {
        console.error('Error toggling like:', error);
        alert('Erro ao curtir notícia. Tente novamente mais tarde.');
    }
}

async function loadFuriaData() {
    const furiaContainer = document.getElementById('furiaContainer');
    furiaContainer.innerHTML = '<p>Carregando dados da FURIA...</p>';

    // 1. Buscar todos os times
    // ATENÇÃO: Substitua 'SUA_SPORTSDATA_API_KEY' pela sua chave da SportsData.io
    const teamsUrl = "https://api.sportsdata.io/v3/csgo/scores/json/Teams?key=SUA_SPORTSDATA_API_KEY";
    try {
        const teamsResp = await fetch(teamsUrl);
        const teams = await teamsResp.json();
        const furia = teams.find(t => t.Name && t.Name.toLowerCase().includes('furia'));
        if (!furia) {
            furiaContainer.innerHTML = "<p>Time FURIA não encontrado na API.</p>";
            return;
        }

        // 2. Buscar jogadores do FURIA
        const playersUrl = `https://api.sportsdata.io/v3/csgo/scores/json/PlayersByTeam/${furia.TeamId}?key=f5ed1438f0e541369637fa152c2e85b0`;
        const playersResp = await fetch(playersUrl);
        const players = await playersResp.json();

        // 3. Montar HTML
        let htmlContent = `
            <div class="furia-info">
                <h2>${furia.Name}</h2>
                <img src="${furia.WikipediaLogoUrl || ''}" alt="Logo FURIA" style="max-width:120px; margin-bottom:1rem;">
                <h3>Jogadores</h3>
                <ul>
                    ${players.map(p => `<li>${p.FirstName || ''} "${p.CommonName || p.LastName || ''}" ${p.LastName || ''} - ${p.Position || ''}</li>`).join('')}
                </ul>
            </div>
        `;
        furiaContainer.innerHTML = htmlContent;
    } catch (e) {
        furiaContainer.innerHTML = "<p>Erro ao carregar dados da FURIA.</p>";
    }
} 