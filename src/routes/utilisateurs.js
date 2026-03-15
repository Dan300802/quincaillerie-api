import express from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../prisma.js'
import { verifierToken, verifierRole } from '../middleware/auth.js'

const router = express.Router()

router.get('/', verifierToken, verifierRole(['administrateur']), async (req, res) => {
  try {
    const utilisateurs = await prisma.utilisateur.findMany({
      select: {
        id: true, prenom: true, nom: true, email: true,
        telephone: true, role: true, actif: true, droits: true, createdAt: true
      }
    })
    res.json(utilisateurs)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.post('/', verifierToken, verifierRole(['administrateur']), async (req, res) => {
  const { prenom, nom, email, telephone, motDePasse, role, droits } = req.body
  try {
    const hash = await bcrypt.hash(motDePasse, 10)
    const utilisateur = await prisma.utilisateur.create({
      data: { prenom, nom, email, telephone, motDePasse: hash, role, droits: droits || {} }
    })
    res.status(201).json({ ...utilisateur, motDePasse: undefined })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.put('/:id', verifierToken, verifierRole(['administrateur']), async (req, res) => {
  const { prenom, nom, email, telephone, role, actif, droits } = req.body
  try {
    const utilisateur = await prisma.utilisateur.update({
      where: { id: Number(req.params.id) },
      data: { prenom, nom, email, telephone, role, actif, droits, updatedAt: new Date() }
    })
    res.json({ ...utilisateur, motDePasse: undefined })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.delete('/:id', verifierToken, verifierRole(['administrateur']), async (req, res) => {
  try {
    await prisma.utilisateur.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Utilisateur supprimé' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

export default router