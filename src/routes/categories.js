import express from 'express'
import prisma from '../prisma.js'
import { verifierToken } from '../middleware/auth.js'

const router = express.Router()

router.get('/', verifierToken, async (req, res) => {
  try {
    const categories = await prisma.categorie.findMany({
      orderBy: { nom: 'asc' }
    })
    res.json(categories)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

export default router