# FURIA Fan Hub

Confira o app em funcionamento: [https://app-furia.vercel.app/login.html](https://app-furia.vercel.app/login.html)

Este é um aplicativo web para fãs da FURIA Esports, desenvolvido em HTML, CSS e JavaScript, com autenticação via Google, integração com Firebase e dados esportivos via SportsData API.

## 📸 Prints do App

Adicione aqui prints do seu app para mostrar como ele funciona:

<div>
  <img src="./prints/home1.png" alt="Tela de Login" width="32%">
  <img src="./prints/home2.png" alt="Tela Principal" width="32%">
  <img src="./prints/home3.png" alt="Tela Principal" width="32%">
</div>

## Funcionalidades
- Login com Google
- Chat integrado com Gemini (IA)
- Perfil do usuário
- Estatísticas e informações do time FURIA em tempo real
- Responsivo para desktop e mobile

## Como rodar localmente

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/davidmaleski/furia-app.git](https://github.com/davidmaleski/furia-app.git)
   cd seu-repo
   ```

2. **Instale o http-server (caso não tenha):**
   ```bash
   npm install -g http-server
   ```

3. **Adicione suas chaves de API:**
   - **Firebase:**  
     Abra os arquivos abaixo e substitua os valores dos campos do objeto `firebaseConfig` pelas suas credenciais do Firebase:
     - `js/firebase-init.js`
     - `js/firebase-manager.js`
     - `js/firebase-config.js`
     - `js/init-firebase.js`
   - **SportsData API:**  
     Abra os arquivos abaixo e substitua o valor do campo da chave por sua chave da SportsData.io:
     - `index.html` (procure por `SUA_SPORTSDATA_API_KEY`)
     - `js/config.js`
     - `js/app.js`
    - **Google Gemini API:**
        Abra os arquivos onde a API do Gemini é utilizada (verifique seus arquivos JavaScript como `js/gemini-integration.js`, `js/app.js` ou similar) e substitua o placeholder (`SUA_GEMINI_API_KEY` ou similar) pela sua chave.
   - **Importante:**  
     Não deixe suas chaves reais em repositórios públicos! Use apenas para testes ou configure variáveis de ambiente em produção.

4. **Inicie o servidor local:**
   ```bash
   npx http-server -p 8080
   ```
   Acesse [http://localhost:8080](http://localhost:8080) no navegador.

## Configuração das APIs

### Firebase
- Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
- Ative o Authentication (Google)
- Ative o Firestore Database
- Copie as credenciais do seu projeto e substitua nos arquivos indicados acima.

### SportsData API
- Crie uma conta em [SportsData.io](https://sportsdata.io/)
- Pegue sua chave de API e substitua nos arquivos indicados acima.

### Google Gemini API
Se seu projeto utiliza a API do Google Gemini (anteriormente parte do Google AI Platform ou disponível via Google AI Studio), você precisará de uma chave:
1.  Vá para o [Google AI Studio](https://aistudio.google.com/).
2.  Faça login com sua conta Google.
3.  Crie uma nova chave de API seguindo as instruções na plataforma.
4.  Copie a chave gerada e cole-a nos arquivos do seu projeto onde o placeholder `SUA_GEMINI_API_KEY` (ou nome similar) estiver indicado (verifique os arquivos mencionados na seção "Como rodar localmente").

**Lembre-se:** Mantenha suas chaves de API seguras e nunca as exponha publicamente.

## Deploy no Vercel
1. Instale o Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Faça login:
   ```bash
   vercel login
   ```
3. Faça o deploy:
   ```bash
   vercel --prod
   ```

## Licença
Este projeto é open-source e pode ser adaptado livremente.
