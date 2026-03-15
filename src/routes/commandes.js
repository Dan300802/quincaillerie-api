import express from 'express'
import prisma from '../prisma.js'
import { verifierToken } from '../middleware/auth.js'

const router = express.Router()

router.get('/', verifierToken, async (req, res) => {
  try {
    const commandes = await prisma.commande.findMany({
      include: { fournisseur: true, lignes: { include: { produit: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(commandes)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.post('/', verifierToken, async (req, res) => {
  const { fournisseurId, dateLivraison, lignes } = req.body
  try {
    const numero = 'CMD-' + Date.now().toString().slice(-6)
    const montant = lignes.reduce((s, l) => s + l.prix * l.quantite, 0)

    const commande = await prisma.commande.create({
      data: {
        numero,
        fournisseurId,
        dateLivraison: dateLivraison ? new Date(dateLivraison) : null,
        montant,
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
    res.status(201).json(commande)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.put('/:id/statut', verifierToken, async (req, res) => {
  const { statut } = req.body
  try {
    const commande = await prisma.commande.update({
      where: { id: Number(req.params.id) },
      data: { statut, updatedAt: new Date() }
    })

    // Si livrée → mettre à jour le stock
    if (statut === 'livree') {
      const lignes = await prisma.ligneCommande.findMany({
        where: { commandeId: Number(req.params.id) }
      })
      for (const ligne of lignes) {
        await prisma.produit.update({
          where: { id: ligne.produitId },
          data: { stock: { increment: ligne.quantite } }
        })
      }
    }

    res.json(commande)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

export default router