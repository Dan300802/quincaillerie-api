import express from 'express'
import prisma from '../prisma.js'
import { verifierToken } from '../middleware/auth.js'

const router = express.Router()

router.get('/', verifierToken, async (req, res) => {
  try {
    const fournisseurs = await prisma.fournisseur.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(fournisseurs)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.post('/', verifierToken, async (req, res) => {
  const { nom, contact, telephone, email, adresse, categorie, delaiLivraison, statut } = req.body
  try {
    const fournisseur = await prisma.fournisseur.create({
      data: { nom, contact, telephone, email, adresse, categorie, delaiLivraison, statut }
    })
    res.status(201).json(fournisseur)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.put('/:id', verifierToken, async (req, res) => {
  const { nom, contact, telephone, email, adresse, categorie, delaiLivraison, statut } = req.body
  try {
    const fournisseur = await prisma.fournisseur.update({
      where: { id: Number(req.params.id) },
      data: { nom, contact, telephone, email, adresse, categorie, delaiLivraison, statut, updatedAt: new Date() }
    })
    res.json(fournisseur)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.delete('/:id', verifierToken, async (req, res) => {
  try {
    await prisma.fournisseur.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Fournisseur supprimé' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

export default router