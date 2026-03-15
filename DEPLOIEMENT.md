# Déploiement : Backend Railway + Frontend Vercel

## Pourquoi « Échec de connexion » ?

En production, le frontend (Vercel) doit appeler l’**URL du backend** (Railway), pas `localhost`.

---

## 1. Backend (Railway)

- **Variables d’environnement** à définir dans Railway :
  - `DATABASE_URL` : URL de ta base (PostgreSQL fournie par Railway ou externe)
  - `JWT_SECRET` : une chaîne secrète longue et aléatoire (obligatoire pour le login)
  - `PORT` : optionnel (Railway le définit souvent)
  - `NODE_ENV` : `production`
- **URL publique** : dans Railway, ton service a une URL du type  
  `https://ton-projet.up.railway.app`  
  C’est cette URL qu’il faut utiliser côté frontend.

---

## 2. Frontend (Vercel)

- Dans **Vercel** → ton projet → **Settings** → **Environment Variables**, ajoute par exemple :
  - **Name** : `VITE_API_URL`  
  - **Value** : `https://ton-projet.up.railway.app`  
    (remplace par l’URL réelle de ton backend Railway)
- Dans ton code frontend, utilise cette variable pour les appels API, par exemple :
  - `const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'`
  - puis : `fetch(\`${apiUrl}/api/auth/login\`, { ... })`
- Redéploie le frontend après avoir ajouté la variable.

---

## 3. Vérifications rapides

1. **Backend accessible**  
   Ouvre dans le navigateur :  
   `https://ton-backend.up.railway.app/api/health`  
   Tu dois voir : `{"ok":true,"message":"API disponible"}`.

2. **CORS**  
   Le backend autorise déjà `https://quincaillerie-snowy.vercel.app` et `*.vercel.app`.  
   Si tu as un autre domaine Vercel, ajoute sur Railway la variable :  
   `CORS_ORIGINS=https://ton-autre-domaine.vercel.app`

3. **Login**  
   Si l’API répond mais le login échoue encore, ouvre les **DevTools** (F12) → onglet **Network** :  
   - la requête vers `/api/auth/login` part-elle vers l’URL Railway ?  
   - quel code HTTP et quel corps de réponse ? (401 = identifiants incorrects, 500 = erreur serveur, pas de réponse = problème de réseau/CORS ou mauvaise URL).

---

## Résumé

| Où       | À faire |
|----------|--------|
| **Railway** | `JWT_SECRET`, `DATABASE_URL`, `NODE_ENV=production` ; noter l’URL publique du service |
| **Vercel**  | Variable `VITE_API_URL` = URL Railway ; appels API via cette variable ; redéploiement |

Une fois `VITE_API_URL` pointant vers Railway et le backend configuré, la page de connexion ne devrait plus afficher « Échec de connexion » pour un simple problème d’URL.
