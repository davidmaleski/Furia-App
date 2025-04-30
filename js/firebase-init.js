// Configuração do Firebase
// ATENÇÃO: Substitua os valores abaixo pelas suas credenciais do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID",
    measurementId: "SEU_MEASUREMENT_ID"
};

// Initialize Firebase
let firebaseApp;
try {
    if (typeof firebase === 'undefined') {
        throw new Error('Firebase SDK não está carregado');
    }

    if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        
        // Configurar persistência do Firestore
        firebase.firestore().enablePersistence()
            .catch((err) => {
                if (err.code == 'failed-precondition') {
                    console.warn('Persistência falhou: múltiplas abas abertas');
                } else if (err.code == 'unimplemented') {
                    console.warn('Navegador não suporta persistência');
                }
            });

        // Configurar autenticação
        firebase.auth().useDeviceLanguage();
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        
        console.log('Firebase inicializado com sucesso!');
    } else {
        firebaseApp = firebase.app();
        console.log('Firebase já estava inicializado.');
    }

    // Verificar se a autenticação está disponível
    if (!firebase.auth) {
        throw new Error('Firebase Auth não está disponível');
    }

    // Verificar se o Firestore está disponível
    if (!firebase.firestore) {
        throw new Error('Firebase Firestore não está disponível');
    }

    // Definir as variáveis globais após a inicialização completa
    window.db = firebase.firestore();
    window.auth = firebase.auth();
    
    // Aguardar a inicialização completa do Firebase
    firebase.auth().onAuthStateChanged(() => {
        console.log('Firebase Auth e Firestore inicializados com sucesso!');
    });
    
} catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        const errorElement = document.getElementById('firebase-error');
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.textContent = 'Erro ao inicializar Firebase: ' + error.message;
        }
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            const errorElement = document.getElementById('firebase-error');
            if (errorElement) {
                errorElement.style.display = 'block';
                errorElement.textContent = 'Erro ao inicializar Firebase: ' + error.message;
            }
        });
    }
}

// Exportar para uso global
window.firebaseManager = {
    initialize: async function() {
        return new Promise((resolve, reject) => {
            if (firebase.apps.length) {
                resolve(firebase.app());
            } else {
                const unsubscribe = firebase.auth().onAuthStateChanged(() => {
                    unsubscribe();
                    resolve(firebase.app());
                }, reject);
            }
        });
    }
}; 