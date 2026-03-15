import express from 'express'
import prisma from '../prisma.js'
import { verifierToken } from '../middleware/auth.js'

const router = express.Router()

// ─── GET /api/produits
router.get('/', verifierToken, async (req, res) => {
  try {
    const produits = await prisma.produit.findMany({
      include: { categorie: true, fournisseur: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(produits)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// ─── GET /api/produits/:id
router.get('/:id', verifierToken, async (req, res) => {
  try {
    const produit = await prisma.produit.findUnique({
      where: { id: Number(req.params.id) },
      include: { categorie: true, fournisseur: true }
    })
    if (!produit) return res.status(404).json({ message: 'Produit non trouvé' })
    res.json(produit)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// ─── POST /api/produits
router.post('/', verifierToken, async (req, res) => {
  const { ref, nom, categorieId, fournisseurId, stock, seuil, prix } = req.body
  try {
    const produit = await prisma.produit.create({
      data: { ref, nom, categorieId, fournisseurId, stock, seuil, prix }
    })
    res.status(201).json(produit)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// ─── PUT /api/produits/:id
router.put('/:id', verifierToken, async (req, res) => {
  const { ref, nom, categorieId, fournisseurId, stock, seuil, prix } = req.body
  try {
    const produit = await prisma.produit.update({
      where: { id: Number(req.params.id) },
      data: { ref, nom, categorieId, fournisseurId, stock, seuil, prix, updatedAt: new Date() }
    })
    res.json(produit)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// ─── DELETE /api/produits/:id
router.delete('/:id', verifierToken, async (req, res) => {
  try {
    await prisma.produit.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Produit supprimé' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

export default router