// Firebase Manager
(function() {
    class FirebaseManager {
        static instance = null;
        
        constructor() {
            if (FirebaseManager.instance) {
                return FirebaseManager.instance;
            }
            FirebaseManager.instance = this;
            this.initialized = false;
            this.app = null;
            console.log('FirebaseManager construtor executado');
        }

        async initialize() {
            if (this.initialized) {
                console.log('Firebase já está inicializado');
                return true;
            }

            console.log('Iniciando inicialização do Firebase');

            const firebaseConfig = {
                // ATENÇÃO: Substitua os valores abaixo pelas suas credenciais do Firebase
                apiKey: "SUA_API_KEY",
                authDomain: "SEU_AUTH_DOMAIN",
                projectId: "SEU_PROJECT_ID",
                storageBucket: "SEU_STORAGE_BUCKET",
                messagingSenderId: "SEU_MESSAGING_SENDER_ID",
                appId: "SEU_APP_ID",
                measurementId: "SEU_MEASUREMENT_ID"
            };

            try {
                console.log('Verificando Firebase SDK');
                // Verificar se o Firebase SDK está carregado
                if (typeof firebase === 'undefined') {
                    throw new Error('Firebase SDK não está carregado. Verifique sua conexão com a internet.');
                }

                console.log('Inicializando Firebase App');
                // Inicializar Firebase
                if (!firebase.apps.length) {
                    this.app = firebase.initializeApp(firebaseConfig);
                } else {
                    this.app = firebase.app();
                }

                console.log('Verificando serviços do Firebase');
                // Verificar serviços necessários
                if (!firebase.auth) {
                    throw new Error('Firebase Auth não está disponível');
                }
                if (!firebase.firestore) {
                    throw new Error('Firebase Firestore não está disponível');
                }

                this.initialized = true;
                console.log('Firebase inicializado com sucesso!');
                return true;

            } catch (error) {
                console.error('Erro ao inicializar Firebase:', error);
                this.showError(error.message);
                return false;
            }
        }

        showError(message) {
            console.log('Mostrando erro:', message);
            const showErrorInDOM = () => {
                const errorElement = document.getElementById('firebase-error');
                const loadingElement = document.getElementById('loading');
                if (errorElement) {
                    errorElement.style.display = 'block';
                    errorElement.textContent = 'Erro na inicialização do app: ' + message;
                }
                if (loadingElement) {
                    loadingElement.style.display = 'none';
                }
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', showErrorInDOM);
            } else {
                showErrorInDOM();
            }
        }

        isInitialized() {
            return this.initialized;
        }

        getApp() {
            return this.app;
        }
    }

    // Criar instância global
    try {
        console.log('Criando instância global do FirebaseManager');
        window.firebaseManager = new FirebaseManager();
        console.log('FirebaseManager criado com sucesso');
    } catch (error) {
        console.error('Erro ao criar FirebaseManager:', error);
    }
})(); 