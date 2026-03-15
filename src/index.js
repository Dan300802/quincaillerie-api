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

// ─── Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://quincaillerie-frontend.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}))
app.use(express.json())

// ─── Routes
app.use('/api/auth', authRoutes)
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

// ─── Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`)
})