import express from 'express'
import prisma from '../prisma.js'
import { verifierToken } from '../middleware/auth.js'

const router = express.Router()

// ─── GET toutes les ventes
router.get('/', verifierToken, async (req, res) => {
  try {
    const { date, clientId } = req.query

    const where = {}
    if (date) {
      const debut = new Date(date)
      debut.setHours(0, 0, 0, 0)
      const fin = new Date(date)
      fin.setHours(23, 59, 59, 999)
      where.createdAt = { gte: debut, lte: fin }
    }
    if (clientId) where.clientId = Number(clientId)

    const ventes = await prisma.vente.findMany({
      where,
      include: {
        client: true,
        utilisateur: { select: { prenom: true, nom: true } },
        lignes: { include: { produit: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(ventes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// ─── GET une vente par id
router.get('/:id', verifierToken, async (req, res) => {
  try {
    const vente = await prisma.vente.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        client: true,
        utilisateur: { select: { prenom: true, nom: true } },
        lignes: { include: { produit: true } }
      }
    })
    if (!vente) return res.status(404).json({ message: 'Vente non trouvée' })
    res.json(vente)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

// ─── POST nouvelle vente
router.post('/', verifierToken, async (req, res) => {
  const { clientId, lignes, sousTotal, tva, total } = req.body
  try {
    const numero = 'VTE-' + Date.now().toString().slice(-6)

    const vente = await prisma.vente.create({
      data: {
        numero,
        clientId: clientId || null,
        utilisateurId: req.utilisateur.id,
        sousTotal,
        tva,
        total,
        lignes: {
          create: lignes.map(l => ({
            produitId: l.produitId,
            quantite: l.quantite,
            prix: l.prix,
            total: l.prix * l.quantite
          }))
        }
      },
      include: { lignes: true }
    })

    // Mettre à jour le stock
    for (const ligne of lignes) {
      await prisma.produit.update({
        where: { id: ligne.produitId },
        data: { stock: { decrement: ligne.quantite } }
      })
    }

    res.status(201).json(vente)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

export default router