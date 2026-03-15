import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// ─── Routes
import authRoutes from './routes/auth.js'
import produitRoutes from './routes/produits.js'
import clientRoutes from './routes/clients.js'
import fournisseurRoutes from './routes/fournisseurs.js'
import venteRoutes from './routes/ventes.js'
import commandeRoutes from './routes/commandes.js'
import statistiqueRoutes from './routes/statistiques.js'
import utilisateurRoutes from './routes/utilisateurs.js'
import categorieRoutes from './routes/categories.js'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// ─── CORS : origines autorisées (frontend Vercel + dev local)
const corsOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://quincaillerie-snowy.vercel.app',
  /\.vercel\.app$/
]
if (process.env.CORS_ORIGINS) {
  process.env.CORS_ORIGINS.split(',').forEach(origin => {
    corsOrigins.push(origin.trim())
  })
}
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// ─── Routes
app.use('/api/auth', authRoutes)
app.use('/auth', authRoutes) // aussi sans /api pour compatibilité frontend
app.use('/api/produits', produitRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/fournisseurs', fournisseurRoutes)
app.use('/api/ventes', venteRoutes)
app.use('/api/commandes', commandeRoutes)
app.use('/api/statistiques', statistiqueRoutes)
app.use('/api/utilisateurs', utilisateurRoutes)
app.use('/api/categories', categorieRoutes)
// ─── Route test
app.get('/', (req, res) => {
  res.json({ message: '✅ QuincaPro API fonctionne !' })
})

// ─── Santé API (pour vérifier que le backend Railway répond)
app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, message: 'API disponible' })
})

// ─── 404 — route non trouvée
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée : ${req.method} ${req.originalUrl}`,
  })
})

// ─── Gestionnaire d'erreurs global (doit être en dernier)
app.use((err, req, res, next) => {
  console.error('Erreur API:', err)

  const statusCode = err.statusCode || err.status || 500
  const message = err.message || 'Erreur interne du serveur'

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// ─── Rejets de promesses non gérés
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// ─── Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`)
})