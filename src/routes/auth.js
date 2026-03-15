import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prisma.js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// ─── POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, motDePasse } = req.body

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET manquant dans les variables d\'environnement (ex: Railway)')
    return res.status(500).json({ message: 'Erreur serveur — configuration manquante' })
  }

  try {
    // Chercher l'utilisateur
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email }
    })

    if (!utilisateur) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }

    if (!utilisateur.actif) {
      return res.status(401).json({ message: 'Compte désactivé — contactez l\'administrateur' })
    }

    // Vérifier le mot de passe
    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse)

    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }

    // Créer le token JWT
    const token = jwt.sign(
      {
        id: utilisateur.id,
        email: utilisateur.email,
        role: utilisateur.role,
        droits: utilisateur.droits,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      utilisateur: {
        id: utilisateur.id,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        email: utilisateur.email,
        role: utilisateur.role,
        droits: utilisateur.droits,
      }
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// ─── GET /api/auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ message: 'Non authentifié' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: decoded.id },
      select: {
        id: true, prenom: true, nom: true,
        email: true, role: true, droits: true, actif: true
      }
    })
    res.json(utilisateur)
  } catch (err) {
    res.status(403).json({ message: 'Token invalide' })
  }
})

export default router