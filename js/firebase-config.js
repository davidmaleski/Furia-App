// Importa as funções necessárias do Firebase
import { initializeApp, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Inicializa o Firebase apenas se ainda não foi inicializado
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    if (!/already exists/.test(error.message)) {
        console.error('Erro ao inicializar Firebase:', error);
    }
    app = getApp();
}

// Inicializa os serviços
const auth = getAuth(app);
const db = getFirestore(app);

// Exporta as instâncias para uso em outros arquivos
export { auth, db }; 