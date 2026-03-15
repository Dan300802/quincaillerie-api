import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const verifierToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token manquant — accès refusé' })
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET manquant — vérifiez les variables d\'environnement Railway')
    return res.status(500).json({ message: 'Configuration serveur manquante' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.utilisateur = decoded
    next()
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide' })
  }
}

export const verifierRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.utilisateur.role)) {
      return res.status(403).json({ message: 'Accès refusé — droits insuffisants' })
    }
    next()
  }
}