import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Home() {
    const [capacity, setCapacity] = useState(3)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const createRoom = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ capacity }),
            })

            if (!res.ok) {
                throw new Error('Failed to create room')
            }

            const data = await res.json()
            router.push(`/${data.id}`)
        } catch (error) {
            alert('Error creating room')
            setLoading(false)
        }
    }

    return (
        <div className="container">
            <Head>
                <title>Secret Santa Guesser</title>
                <meta name="description" content="Guess who your Secret Santa was!" />
            </Head>

            <div className="snow-bg" />

            <main>
                <h1>🎅 Secret Santa Guesser 🎄</h1>
                <div className="card">
                    <h2>Create a New Room</h2>
                    <p>How many people participated?</p>

                    <div style={{ margin: '1rem 0' }}>
                        <input
                            type="number"
                            min="2"
                            max="50"
                            value={capacity}
                            onChange={(e) => setCapacity(parseInt(e.target.value) || 2)}
                        />
                    </div>

                    <button onClick={createRoom} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Room'}
                    </button>
                </div>
            </main>
        </div>
    )
}
