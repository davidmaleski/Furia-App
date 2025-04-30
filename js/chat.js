// Chat functionality
let chatListener = null;

// Onboarding via chat
const onboardingQuestions = [
    { key: 'cidade', question: 'Para começar, de qual cidade você está falando?' },
    { key: 'idade', question: 'Qual a sua idade?' },
    { key: 'jogadorFavorito', question: 'Quem é seu jogador favorito da FURIA?' },
    { key: 'redeSocialFavorita', question: 'Qual sua rede social favorita? (Twitter, Instagram ou Facebook)' }
];

// Níveis de Fã
const fanLevels = [
    'Fã Novato',
    'Fã Engajado',
    'Fã Analista',
    'Fã Raiz',
    'Fã Furioso',
    'Fã Lendário',
    'Fã Imortal'
];

// Perguntas e respostas sobre a FURIA
const furiaQuestions = [
    { q: 'Qual o nome do capitão atual da equipe de CS:GO da FURIA?', a: ['fallen', 'gabriel toledo'] },
    { q: 'Em que ano a FURIA foi fundada?', a: ['2017'] },
    { q: 'Qual jogador é conhecido como "FalleN"?', a: ['gabriel toledo', 'fallen'] },
    { q: 'Qual foi a melhor colocação da FURIA em um Major de CS:GO?', a: ['semifinal', 'semi-final', 'top 4', '4º', '4'] },
    { q: 'Qual é o animal símbolo da FURIA?', a: ['pantera', 'onça', 'felino'] },
    { q: 'Quem é o treinador da equipe de CS:GO da FURIA?', a: ['sidde', 'sid macedo'] },
    { q: 'Qual jogador tem o nickname "KSCERATO"?', a: ['kaike cerato', 'kscerato'] },
    { q: 'Em que país a FURIA foi criada?', a: ['brasil', 'brazil'] },
    { q: 'Qual a cor predominante no logo da FURIA?', a: ['preto', 'preta', 'black'] },
    { q: 'Qual jogador ficou famoso pelo clutch 1v5 contra a Astralis?', a: ['yuurih', 'yuri santos'] }
];

// Estado do quiz
let quizActive = false;
let quizStep = 0;
let quizQuestion = null;

document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendMessage');

    // Initialize chat when chat section is shown
    document.querySelector('a[href="#chat"]').addEventListener('click', initializeChat);

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

function initializeChat() {
    if (chatListener) return;

    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';

    // Add welcome message apenas se não for onboarding
    db.collection('users').doc(auth.currentUser.uid).get().then(userDoc => {
        const userData = userDoc.data() || {};
        const missing = onboardingQuestions.find(q => !userData[q.key]);
        if (!missing) {
            addMessageToChat({
                text: 'Olá! Eu sou o assistente virtual da FURIA. Como posso ajudar você hoje?',
                isBot: true,
                timestamp: new Date()
            });
        }
    });

    // Listen for new messages
    chatListener = db.collection('chats')
        .where('userId', '==', auth.currentUser.uid)
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const message = change.doc.data();
                    addMessageToChat(message);
                }
            });
        });

    setTimeout(checkAndStartOnboarding, 800);
}

function formatBotMessage(text) {
    // Remove excesso de asteriscos (****) e trata listas com * ou -
    text = text.replace(/\*{2,}/g, '');
    if (text.includes('* ') || text.includes('- ')) {
        const lines = text.split('\n');
        let inList = false;
        let html = '';
        for (const line of lines) {
            if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                if (!inList) {
                    html += '<ul style="margin:0 0 0.5rem 1.2rem;padding:0;">';
                    inList = true;
                }
                html += `<li>${line.replace(/^([\*-])\s*/, '')}</li>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (line.trim() !== '') html += `<div>${line}</div>`;
            }
        }
        if (inList) html += '</ul>';
        return html;
    }
    // Se não for lista, só troca \n por <br>
    return text.replace(/\n/g, '<br>');
}

function addMessageToChat(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    // Definir alinhamento e nome
    if (message.isBot) {
        messageElement.className = 'message bot-message';
        messageElement.innerHTML = `
            <div class="message-content">
                <span class="sender-name">FURIA Bot</span>
                <p>${formatBotMessage(message.text)}</p>
            </div>
        `;
    } else {
        messageElement.className = 'message user-message';
        // Nome do usuário não aparece na direita (estilo WhatsApp)
        messageElement.innerHTML = `
            <div class="message-content">
                <span class="sender-name"></span>
                <p>${message.text}</p>
            </div>
        `;
    }
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatMessageTime(timestamp) {
    if (!timestamp) return '...';
    // Se for um objeto Timestamp do Firestore
    if (typeof timestamp.toDate === 'function') {
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    // Se for um Date puro
    if (timestamp instanceof Date) {
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(timestamp);
    }
    // Se for string ou outro formato
    return String(timestamp);
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    if (!message) return;
    try {
        // Add user message to chat
        const userMessage = {
            text: message,
            userId: auth.currentUser.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            isBot: false
        };
        await db.collection('chats').add(userMessage);
        messageInput.value = '';
        // Incrementar interações com o chat
        if (window.incrementChatInteraction) window.incrementChatInteraction();
        // Process message and generate bot response
        const botResponse = await processMessage(message);
        // Add bot response to chat apenas se não for vazio
        if (botResponse && botResponse.trim() !== '') {
            await db.collection('chats').add({
                text: botResponse,
                userId: auth.currentUser.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                isBot: true
            });
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Erro ao enviar mensagem. Tente novamente mais tarde.');
    }
}

async function checkAndStartOnboarding() {
    const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
    const userData = userDoc.data() || {};
    // Se algum campo essencial está faltando, iniciar onboarding
    const missing = onboardingQuestions.find(q => !userData[q.key]);
    if (missing) {
        await db.collection('chats').add({
            text: 'Bem-vindo ao FURIA Fan Hub! Para personalizar sua experiência, preciso saber algumas coisas sobre você.',
            userId: auth.currentUser.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            isBot: true
        });
        startOnboarding(0, userData);
    }
}

async function startOnboarding(step, userData) {
    if (step >= onboardingQuestions.length) {
        await db.collection('chats').add({
            text: 'Perfil completo! Obrigado por compartilhar suas informações. Você pode atualizar qualquer dado a qualquer momento pelo chat.',
            userId: auth.currentUser.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            isBot: true
        });
        return;
    }
    const q = onboardingQuestions[step];
    await db.collection('chats').add({
        text: q.question,
        userId: auth.currentUser.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        isBot: true
    });
    // Salvar estado do onboarding
    await db.collection('users').doc(auth.currentUser.uid).set({ onboardingStep: step }, { merge: true });
}

// Convidar para o quiz
async function inviteQuizIfRequested(message) {
    if (/quero responder perguntas|subir de nível|subir nivel|quiz/i.test(message)) {
        quizActive = true;
        quizStep = 0;
        await sendQuizQuestion();
        return true;
    }
    return false;
}

async function sendQuizQuestion() {
    // Escolher pergunta aleatória
    quizQuestion = furiaQuestions[Math.floor(Math.random() * furiaQuestions.length)];
    await db.collection('chats').add({
        text: `Pergunta para subir de nível:\n${quizQuestion.q}`,
        userId: auth.currentUser.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        isBot: true
    });
}

async function processQuizAnswer(message) {
    if (!quizQuestion) return 'Ocorreu um erro. Tente novamente.';
    const answer = message.trim().toLowerCase();
    const correct = quizQuestion.a.some(a => answer.includes(a));
    if (correct) {
        // Subir nível
        const userRef = db.collection('users').doc(auth.currentUser.uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data() || {};
        let currentLevel = userData.fanLevel || 0;
        if (currentLevel < fanLevels.length - 1) currentLevel++;
        await userRef.set({ fanLevel: currentLevel }, { merge: true });
        quizActive = false;
        quizQuestion = null;
        return `Parabéns! Você acertou e subiu para o nível: ${fanLevels[currentLevel]}!`;
    } else {
        quizStep++;
        if (quizStep >= 2) {
            quizActive = false;
            quizQuestion = null;
            return 'Resposta incorreta. Você pode tentar novamente mais tarde digitando "quero responder perguntas".';
        } else {
            return 'Resposta incorreta. Tente de novo!';
        }
    }
}

async function processMessage(message) {
    const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
    const userData = userDoc.data() || {};
    // Onboarding
    if (typeof userData.onboardingStep === 'number' && userData.onboardingStep < onboardingQuestions.length) {
        const step = userData.onboardingStep;
        const key = onboardingQuestions[step].key;
        let value = message.trim();
        if (key === 'idade') {
            value = parseInt(value);
            if (isNaN(value) || value < 5 || value > 120) {
                return 'Por favor, digite uma idade válida.';
            }
        }
        await db.collection('users').doc(auth.currentUser.uid).set({ [key]: value }, { merge: true });
        await db.collection('users').doc(auth.currentUser.uid).set({ onboardingStep: step + 1 }, { merge: true });
        setTimeout(() => startOnboarding(step + 1, { ...userData, [key]: value }), 500);
        return 'Perfil salvo!';
    }
    // Atualização via chat
    const updateMatch = message.match(/(mudar|trocar|atualizar)\s+(minha|meu)?\s*(cidade|idade|jogador favorito|rede social favorita)\s*para\s*(.+)/i);
    if (updateMatch) {
        const fieldMap = {
            'cidade': 'cidade',
            'idade': 'idade',
            'jogador favorito': 'jogadorFavorito',
            'rede social favorita': 'redeSocialFavorita'
        };
        const field = fieldMap[updateMatch[3].toLowerCase()];
        let value = updateMatch[4].trim();
        if (field === 'idade') value = parseInt(value);
        await db.collection('users').doc(auth.currentUser.uid).set({ [field]: value }, { merge: true });
        return `Informação atualizada: ${updateMatch[3]} agora é ${value}!`;
    }
    // Quiz: convite
    if (await inviteQuizIfRequested(message)) {
        return '';
    }
    // Quiz: resposta
    if (quizActive && quizQuestion) {
        return await processQuizAnswer(message);
    }
    // Caso contrário, chama Gemini normalmente
    return 'Função de integração com Gemini removida por segurança e privacidade das chaves de API. Caso queira usar IA, implemente sua própria integração e proteja sua chave.';
}

// Iniciar onboarding no primeiro acesso ao chat
const oldInitializeChat = initializeChat;
initializeChat = function() {
    oldInitializeChat();
    setTimeout(checkAndStartOnboarding, 800);
}

// Função para rolar o chat para o final
function scrollChatToBottom() {
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// Detecta quando a aba do chat fica ativa
const chatTab = document.querySelector('a[href="#chat"]');
const chatSection = document.getElementById('chat');
if (chatTab && chatSection) {
  chatTab.addEventListener('click', () => {
    // Espera o chat ficar visível e o DOM renderizar
    const interval = setInterval(() => {
      if (chatSection.classList.contains('active')) {
        scrollChatToBottom();
        clearInterval(interval);
      }
    }, 50);
    // Limite de tempo para não travar
    setTimeout(() => clearInterval(interval), 1000);
  });
}

// Sempre que uma nova mensagem for adicionada
if (document.getElementById('chatMessages')) {
  const observer = new MutationObserver(scrollChatToBottom);
  observer.observe(document.getElementById('chatMessages'), { childList: true });
} 