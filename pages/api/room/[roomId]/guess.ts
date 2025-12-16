import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { roomId } = req.query

    if (typeof roomId !== 'string') {
        return res.status(400).json({ message: 'Invalid Room ID' })
    }

    if (req.method === 'POST') {
        // Submit a guess
        const { receiverName, santaName } = req.body

        if (!receiverName || !santaName) {
            return res.status(400).json({ message: 'Missing names' })
        }

        try {
            const room = await prisma.room.findUnique({
                where: { id: roomId },
                include: { guesses: true },
            })

            if (!room) {
                return res.status(404).json({ message: 'Room not found' })
            }

            if (room.guesses.length >= room.capacity) {
                return res.status(400).json({ message: 'Room is full' })
            }

            // Check if user already guessed (simple check by receiver name, though imperfect)
            const existingGuess = room.guesses.find(g => g.receiverName === receiverName)
            if (existingGuess) {
                return res.status(400).json({ message: 'You have already submitted a guess' })
            }

            const guess = await prisma.guess.create({
                data: {
                    roomId,
                    receiverName,
                    santaName,
                },
            })

            res.status(200).json(guess)
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    } else if (req.method === 'GET') {
        // Get status
        try {
            const room = await prisma.room.findUnique({
                where: { id: roomId },
                include: { guesses: true },
            })

            if (!room) {
                return res.status(404).json({ message: 'Room not found' })
            }

            const isComplete = room.guesses.length >= room.capacity

            const guesses = room.guesses.map(g => ({
                id: g.id,
                receiverName: g.receiverName,
                santaName: isComplete ? g.santaName : '***',
            }))

            res.status(200).json({
                id: room.id,
                capacity: room.capacity,
                currentCount: room.guesses.length,
                isComplete,
                guesses,
            })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' })
    }
}
