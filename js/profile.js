// Profile functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize profile when profile section is shown
    document.querySelector('a[href="#profile"]').addEventListener('click', loadProfile);
    
    // Social media connection buttons
    document.getElementById('connectTwitter').addEventListener('click', connectTwitter);
    document.getElementById('connectInstagram').addEventListener('click', connectInstagram);
});

async function loadProfile() {
    try {
        const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
        const userData = userDoc.data() || {};
        
        updateProfileUI(userData);
        loadUserStats();
        loadFanProfile(userData);
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Erro ao carregar perfil. Tente novamente mais tarde.');
    }
}

function updateProfileUI(userData) {
    const userName = document.getElementById('userName');
    const profileAvatar = document.getElementById('profileAvatar');
    
    userName.textContent = userData.displayName || auth.currentUser.displayName || 'Usuário FURIA';
    if (userData.photoURL || auth.currentUser.photoURL) {
        profileAvatar.src = userData.photoURL || auth.currentUser.photoURL;
    }
}

function loadFanProfile(userData) {
    document.getElementById('fanCidade').textContent = userData.cidade || '-';
    document.getElementById('fanIdade').textContent = userData.idade || '-';
    document.getElementById('fanJogador').textContent = userData.jogadorFavorito || '-';
    document.getElementById('fanRedeSocial').textContent = userData.redeSocialFavorita || '-';
    document.getElementById('fanRedesConectadas').textContent = 'Google';
    document.getElementById('interactionCount').textContent = userData.interacoesChat || 0;
    // Mostrar nome do nível de fã
    const fanLevels = [
        'Fã Novato',
        'Fã Engajado',
        'Fã Analista',
        'Fã Raiz',
        'Fã Furioso',
        'Fã Lendário',
        'Fã Imortal'
    ];
    let levelIdx = userData.fanLevel;
    if (typeof levelIdx !== 'number' || levelIdx < 0 || levelIdx >= fanLevels.length) levelIdx = 0;
    document.getElementById('fanScore').textContent = fanLevels[levelIdx];
}

async function loadUserStats() {
    try {
        // Get user interactions count (não sobrescrever interacoesChat)
        const interactionsSnapshot = await db.collection('interactions')
            .where('userId', '==', auth.currentUser.uid)
            .get();
        // Get user favorites count (não sobrescrever nada no perfil)
        const favoritesSnapshot = await db.collection('likes')
            .where('userId', '==', auth.currentUser.uid)
            .get();
        // Apenas atualizar UI se necessário, não salvar nada no perfil
        // document.getElementById('interactionCount').textContent = ... (removido, pois agora é só interacoesChat)
        // document.getElementById('favoritesCount').textContent = ... (removido)
        // Não salvar interacoes ou ultimosFavoritos no perfil
        // Atualizar painel do fã
        const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
        loadFanProfile(userDoc.data() || {});
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

async function connectTwitter() {
    try {
        // Here you would implement Twitter OAuth
        // For now, we'll just update the UI
        const button = document.getElementById('connectTwitter');
        button.innerHTML = '<i class="fab fa-twitter"></i> Conectado';
        button.disabled = true;
        
        // Update user document
        await db.collection('users').doc(auth.currentUser.uid).update({
            twitterConnected: true,
            twitterConnectedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error connecting Twitter:', error);
        alert('Erro ao conectar Twitter. Tente novamente mais tarde.');
    }
}

async function connectInstagram() {
    try {
        // Here you would implement Instagram OAuth
        // For now, we'll just update the UI
        const button = document.getElementById('connectInstagram');
        button.innerHTML = '<i class="fab fa-instagram"></i> Conectado';
        button.disabled = true;
        
        // Update user document
        await db.collection('users').doc(auth.currentUser.uid).update({
            instagramConnected: true,
            instagramConnectedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error connecting Instagram:', error);
        alert('Erro ao conectar Instagram. Tente novamente mais tarde.');
    }
}

// BADGES E SCORE
function calcularBadgesELevel(userData) {
    const badges = [];
    let score = 0;
    // Badge por interações
    if ((userData.interacoes||0) >= 50) badges.push('Super Fã');
    if ((userData.interacoes||0) >= 10) badges.push('Fã Ativo');
    // Badge por favoritos
    if ((userData.ultimosFavoritos||[]).length >= 10) badges.push('Colecionador');
    // Badge por rede social conectada
    if (userData.twitterConnected) badges.push('Fã Social (Twitter)');
    if (userData.instagramConnected) badges.push('Fã Social (Instagram)');
    // Badge por jogador favorito
    if (userData.jogadorFavorito === 'FalleN') badges.push('Fã do Professor');
    if (userData.jogadorFavorito === 'KSCERATO') badges.push('Fã do KSCERATO');
    // Score simples
    score += (userData.interacoes||0) * 2;
    score += (userData.ultimosFavoritos||[]).length * 3;
    if (userData.twitterConnected) score += 10;
    if (userData.instagramConnected) score += 10;
    return { badges, score };
}

// Tracking detalhado de interações
function trackInteraction(type, targetId) {
    try {
        db.collection('interactions').add({
            userId: auth.currentUser.uid,
            type: type,
            targetId: targetId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error tracking interaction:', error);
    }
}

// Expor para uso global
window.calcularBadgesELevel = calcularBadgesELevel;

// Após loadFanProfile, popular badges, score, recomendações e gráfico
function popularKnowYourFan(userData) {
    // Badges e score
    const { badges, score } = calcularBadgesELevel(userData);
    const badgesList = document.getElementById('badgesList');
    badgesList.innerHTML = badges.length ? badges.map(b => `<span class='badge'>${b}</span>`).join('') : '<span style="opacity:0.7">Nenhuma badge ainda</span>';
    // Recomendações
    const recs = [];
    if ((userData.interacoes||0) > 30) recs.push('Você é muito ativo! Que tal compartilhar seu perfil nas redes sociais?');
    if ((userData.ultimosFavoritos||[]).includes('FalleN')) recs.push('Você curte o FalleN! Veja as últimas notícias sobre ele na aba Time.');
    if ((userData.ultimosFavoritos||[]).length === 0) recs.push('Adicione jogadores ou notícias aos favoritos para personalizar ainda mais seu perfil!');
    if ((userData.jogadorFavorito||'').toLowerCase() === 'kscerato') recs.push('KSCERATO está em ótima fase! Confira suas estatísticas.');
    if (recs.length === 0) recs.push('Continue interagindo para desbloquear mais badges e recomendações personalizadas!');
    document.getElementById('fanRecommendations').innerHTML = recs.map(r => `<div>• ${r}</div>`).join('');
    // Gráfico de interações (Chart.js)
    if (window.fanChartInstance) window.fanChartInstance.destroy();
    db.collection('interactions').where('userId', '==', auth.currentUser.uid).get().then(snapshot => {
        const typeCount = {};
        snapshot.forEach(doc => {
            const t = doc.data().type || 'Outro';
            typeCount[t] = (typeCount[t]||0)+1;
        });
        const labels = Object.keys(typeCount);
        const data = Object.values(typeCount);
        const ctx = document.getElementById('fanChart').getContext('2d');
        window.fanChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: [
                        '#ff6200', '#00ddeb', '#1c2526', '#4CAF50', '#f44336', '#FFD600', '#7C4DFF'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { color: '#e0e0e0', font: { size: 13 } } }
                },
                cutout: '65%',
                responsive: true,
                maintainAspectRatio: false
            }
        });
    });
}

// Chamar após carregar perfil
const oldLoadFanProfile = loadFanProfile;
loadFanProfile = function(userData) {
    oldLoadFanProfile(userData);
    setTimeout(() => popularKnowYourFan(userData), 200);
}

// Incrementar interações com o chat a cada mensagem enviada
window.incrementChatInteraction = async function() {
    const userRef = db.collection('users').doc(auth.currentUser.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data() || {};
    const newCount = (userData.interacoesChat || 0) + 1;
    await userRef.set({ interacoesChat: newCount }, { merge: true });
    document.getElementById('interactionCount').textContent = newCount;
}

// Aguardar o Firebase ser inicializado
async function initializeProfile() {
    try {
        // Aguardar a inicialização do Firebase
        await window.firebaseManager.initialize();
        
        // Configurar listeners apenas se os elementos existirem
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                firebase.auth().signOut().then(() => {
                    window.location.href = 'login.html';
                }).catch((error) => {
                    console.error('Erro ao fazer logout:', error);
                });
            });
        }

        const profileSection = document.getElementById('profile');
        const profileLoading = document.getElementById('profile-loading');
        const profileCard = document.querySelector('.profile-modern-card');

        if (profileSection && profileLoading && profileCard) {
            const profileLink = document.querySelector('a[href="#profile"]');
            if (profileLink) {
                profileLink.addEventListener('click', () => {
                    profileLoading.style.display = 'flex';
                    profileCard.style.display = 'none';
                    setTimeout(() => {
                        profileLoading.style.display = 'none';
                        profileCard.style.display = 'block';
                    }, 1200);
                });
            }
        }

        // Atualizar informações do perfil quando o usuário estiver logado
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                updateProfileInfo(user);
            }
        });

    } catch (error) {
        console.error('Erro ao inicializar perfil:', error);
    }
}

async function updateProfileInfo(user) {
    try {
        const userNameElement = document.getElementById('userName');
        const profileAvatar = document.getElementById('profileAvatar');
        
        if (userNameElement) {
            userNameElement.textContent = user.displayName || 'Usuário FURIA';
        }
        
        if (profileAvatar && user.photoURL) {
            profileAvatar.src = user.photoURL;
        }

        // Carregar dados adicionais do perfil do Firestore
        const db = firebase.firestore();
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            updateProfileFields(userData);
        }

    } catch (error) {
        console.error('Erro ao atualizar informações do perfil:', error);
    }
}

function updateProfileFields(userData) {
    const fields = {
        'fanCidade': userData.cidade || '-',
        'fanIdade': userData.idade || '-',
        'fanJogador': userData.jogadorFavorito || '-',
        'fanRedeSocial': userData.redeSocialFavorita || '-',
        'fanRedesConectadas': userData.redesConectadas || '-',
        'fanScore': userData.nivel || 'Fã Novato',
        'interactionCount': userData.interacoes || '0'
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeProfile); 