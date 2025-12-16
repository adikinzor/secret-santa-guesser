import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

type Guess = {
    id: number
    receiverName: string
    santaName: string // '***' or actual name
}

type RoomStatus = {
    id: string
    capacity: number
    currentCount: number
    isComplete: boolean
    guesses: Guess[]
}

export default function Room() {
    const router = useRouter()
    const { roomId } = router.query

    const [status, setStatus] = useState<RoomStatus | null>(null)
    const [receiverName, setReceiverName] = useState('')
    const [santaName, setSantaName] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    // Polling
    useEffect(() => {
        if (!roomId) return

        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/room/${roomId}/guess`)
                if (res.ok) {
                    const data = await res.json()
                    setStatus(data)
                }
            } catch (err) {
                console.error('Failed to poll', err)
            }
        }

        fetchStatus()
        const interval = setInterval(fetchStatus, 3000)
        return () => clearInterval(interval)
    }, [roomId])

    const submitGuess = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const res = await fetch(`/api/room/${roomId}/guess`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverName, santaName }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Error submitting guess')
            }

            setSubmitted(true)
            setReceiverName('')
            setSantaName('')
        } catch (err: any) {
            setError(err.message)
        }
    }

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
    }

    if (!status) return <div className="container">Loading...</div>

    return (
        <div className="container">
            <Head>
                <title>Room {status.id} - Secret Santa</title>
            </Head>
            <div className="snow-bg" />

            <h1>🎁 Secret Santa Room 🎄</h1>
            <p style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={copyLink}>
                ID: {status.id} (Click to Copy Link)
            </p>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2>Status: {status.currentCount} / {status.capacity}</h2>
                {status.isComplete ? (
                    <p style={{ color: 'var(--tree-green)', fontWeight: 'bold' }}>
                        🎉 All guesses are in! The names are revealed! 🎁
                    </p>
                ) : (
                    <p>Waiting for everyone to submit their guesses...</p>
                )}
            </div>

            {!status.isComplete && !submitted && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2>Make your guess</h2>
                    <form onSubmit={submitGuess}>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <div>
                            <label>I am...</label>
                            <input
                                value={receiverName}
                                onChange={e => setReceiverName(e.target.value)}
                                placeholder="Your Name"
                                required
                            />
                        </div>
                        <div>
                            <label>I think my Secret Santa was...</label>
                            <input
                                value={santaName}
                                onChange={e => setSantaName(e.target.value)}
                                placeholder="Santa's Name"
                                required
                            />
                        </div>
                        <button type="submit">Submit Guess</button>
                    </form>
                </div>
            )}

            {submitted && !status.isComplete && (
                <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#e6fffa' }}>
                    <h3>✅ Guess Submitted!</h3>
                    <p>Sit back and wait for the others.</p>
                </div>
            )}

            <div className="card">
                <h2>Participants</h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {status.guesses.map((guess, idx) => (
                        <li key={idx} style={{
                            padding: '1rem',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span><strong>{guess.receiverName}</strong> guessed:</span>
                            <span style={{
                                backgroundColor: status.isComplete ? '#e6fffa' : '#eee',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                minWidth: '100px',
                                textAlign: 'center',
                                fontFamily: status.isComplete ? 'inherit' : 'monospace',
                                letterSpacing: status.isComplete ? 'normal' : '2px',
                                color: status.isComplete ? 'var(--tree-green)' : '#999'
                            }}>
                                {guess.santaName}
                            </span>
                        </li>
                    ))}
                    {status.guesses.length === 0 && <p>No guesses yet.</p>}
                </ul>
            </div>
        </div>
    )
}
