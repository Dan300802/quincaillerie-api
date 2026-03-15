import express from 'express'
import prisma from '../prisma.js'
import { verifierToken } from '../middleware/auth.js'

const router = express.Router()

router.get('/', verifierToken, async (req, res) => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(clients)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.get('/:id', verifierToken, async (req, res) => {
  try {
    const client = await prisma.client.findUnique({ where: { id: Number(req.params.id) } })
    if (!client) return res.status(404).json({ message: 'Client non trouvé' })
    res.json(client)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.post('/', verifierToken, async (req, res) => {
  const { nom, telephone, email, adresse } = req.body
  try {
    const client = await prisma.client.create({ data: { nom, telephone, email, adresse } })
    res.status(201).json(client)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.put('/:id', verifierToken, async (req, res) => {
  const { nom, telephone, email, adresse } = req.body
  try {
    const client = await prisma.client.update({
      where: { id: Number(req.params.id) },
      data: { nom, telephone, email, adresse, updatedAt: new Date() }
    })
    res.json(client)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.delete('/:id', verifierToken, async (req, res) => {
  try {
    await prisma.client.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Client supprimé' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

export default router