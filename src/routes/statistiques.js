import express from 'express'
import prisma from '../prisma.js'
import { verifierToken } from '../middleware/auth.js'

const router = express.Router()

router.get('/', verifierToken, async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const debutMois = new Date(today.getFullYear(), today.getMonth(), 1)

    // ─── Stats de base
    const [ventesJour, totalProduits, produitsRupture, commandesEnAttente] = await Promise.all([
      prisma.vente.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.produit.count(),
      prisma.produit.count({ where: { stock: 0 } }),
      prisma.commande.count({ where: { statut: 'en_attente' } }),
    ])

    // ─── Ventes récentes
    const ventesRecentes = await prisma.vente.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    }).catch(() => [])

    // ─── Alertes stock
    const alertesStock = await prisma.produit.findMany({
      where: { stock: { lte: 20 } },
      orderBy: { stock: 'asc' },
      take: 5,
    }).catch(() => [])

    // ─── Top produits (seulement si des ventes existent)
    let topProduits = []
    try {
      const topProduitsGrouped = await prisma.ligneVente.groupBy({
        by: ['produitId'],
        where: {
          vente: {
            createdAt: { gte: debutMois }
          }
        },
        _sum: { quantite: true },
        orderBy: { _sum: { quantite: 'desc' } },
        take: 5,
      })

      topProduits = await Promise.all(
        topProduitsGrouped.map(async (tp) => {
          const produit = await prisma.produit.findUnique({
            where: { id: tp.produitId }
          })
          return { ...tp, produit }
        })
      )
    } catch (e) {
      console.log('Pas de données top produits:', e.message)
      topProduits = []
    }

    res.json({
      chiffreAffaires: ventesJour._sum.total || 0,
      ventesJour: ventesJour._count || 0,
      totalProduits: totalProduits || 0,
      produitsRupture: produitsRupture || 0,
      commandesEnAttente: commandesEnAttente || 0,
      ventesRecentes,
      alertesStock,
      topProduits,
    })

  } catch (err) {
    console.error('Erreur statistiques:', err)
    res.status(500).json({
      message: 'Erreur serveur',
      details: err.message
    })
  }
})

export default router