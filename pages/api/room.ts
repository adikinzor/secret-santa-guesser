import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const { capacity } = req.body

    if (!capacity || typeof capacity !== 'number' || capacity < 2) {
        return res.status(400).json({ message: 'Invalid capacity (min 2)' })
    }

    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase()

    try {
        const room = await prisma.room.create({
            data: {
                id: roomId,
                capacity,
            },
        })
        res.status(200).json(room)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
