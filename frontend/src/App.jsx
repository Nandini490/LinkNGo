import { useState, useEffect } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

function App() {
  const [healthMessage, setHealthMessage] = useState(null)
  const [isHealthLoading, setIsHealthLoading] = useState(true)
  const [healthError, setHealthError] = useState(null)

  // Auth State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Registration State
  const [isRegisterView, setIsRegisterView] = useState(false)
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regError, setRegError] = useState(null)
  const [regSuccess, setRegSuccess] = useState(null)
  const [isRegistering, setIsRegistering] = useState(false)

  // Journey State
  const [journeyName, setJourneyName] = useState('')
  const [journeyDestination, setJourneyDestination] = useState('')
  const [journeyError, setJourneyError] = useState(null)
  const [isCreatingJourney, setIsCreatingJourney] = useState(false)
  const [createdJourney, setCreatedJourney] = useState(null)

  const [joinJourneyId, setJoinJourneyId] = useState('')
  const [joinError, setJoinError] = useState(null)
  const [joinSuccess, setJoinSuccess] = useState(null)
  const [isJoiningJourney, setIsJoiningJourney] = useState(false)
  const [joinedJourney, setJoinedJourney] = useState(null)
  
  const [myJourneys, setMyJourneys] = useState([])
  const [isJourneysLoading, setIsJourneysLoading] = useState(false)
  const [journeysError, setJourneysError] = useState(null)

  const [selectedJourney, setSelectedJourney] = useState(null)
  const [isSelectedJourneyLoading, setIsSelectedJourneyLoading] = useState(false)
  const [selectedJourneyError, setSelectedJourneyError] = useState(null)

  const fetchMyJourneys = async (token) => {
    setIsJourneysLoading(true)
    setJourneysError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/journeys`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setMyJourneys(data.data)
      } else {
        setJourneysError(data.message || 'Failed to fetch journeys')
      }
    } catch (err) {
      console.error('Failed to fetch journeys:', err)
      setJourneysError('Connection error. Is the backend running?')
    } finally {
      setIsJourneysLoading(false)
    }
  }

  const fetchCurrentUser = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setCurrentUser(data.data)
        fetchMyJourneys(token)
      } else {
        // Token might be invalid or expired
        localStorage.removeItem('linkngo_token')
        setCurrentUser(null)
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err)
      // We don't clear the token here, as it might just be a network error
    } finally {
      setIsAuthLoading(false)
    }
  }

  useEffect(() => {
    // Fetch data from the Express backend
    fetch(`${API_BASE_URL}/api/health`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then(data => {
        setHealthMessage(data.message)
        setIsHealthLoading(false)
      })
      .catch(err => {
        setHealthError(err.message)
        setIsHealthLoading(false)
      })

    // Check for existing token and fetch user
    const token = localStorage.getItem('linkngo_token')
    if (token) {
      fetchCurrentUser(token)
    } else {
      setIsAuthLoading(false)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setLoginError('Email and password are required')
      return
    }

    setLoginError(null)
    setIsLoggingIn(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store the token
        localStorage.setItem('linkngo_token', data.token)
        
        // Fetch current user with new token
        await fetchCurrentUser(data.token)
        
        // Clear form
        setEmail('')
        setPassword('')
      } else {
        setLoginError(data.message || 'Login failed')
      }
    } catch (err) {
      setLoginError('Connection error. Is the backend running?')
      console.error('Login error:', err)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (!regName || !regEmail || !regPassword) {
      setRegError('Name, email, and password are required')
      return
    }

    setRegError(null)
    setRegSuccess(null)
    setIsRegistering(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setRegSuccess('Account created successfully! You can now log in.')
        setRegName('')
        setRegEmail('')
        setRegPassword('')
        // Do NOT automatically log in or store JWT per requirements
      } else {
        setRegError(data.message || 'Registration failed')
      }
    } catch (err) {
      setRegError('Connection error. Is the backend running?')
      console.error('Registration error:', err)
    } finally {
      setIsRegistering(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('linkngo_token')
    setCurrentUser(null)
    setCreatedJourney(null) // clear journey on logout
    setMyJourneys([])
    setSelectedJourney(null)
    setJoinedJourney(null)
    setJoinSuccess(null)
    setJoinError(null)
  }

  const handleCreateJourney = async (e) => {
    e.preventDefault()
    
    if (!journeyName || !journeyDestination) {
      setJourneyError('Journey name and destination are required')
      return
    }

    setJourneyError(null)
    setIsCreatingJourney(true)

    const token = localStorage.getItem('linkngo_token')

    try {
      const response = await fetch(`${API_BASE_URL}/api/journeys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: journeyName, destination: journeyDestination })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setCreatedJourney(data.data)
        setJourneyName('')
        setJourneyDestination('')
        fetchMyJourneys(token)
      } else {
        setJourneyError(data.message || 'Failed to create journey')
      }
    } catch (err) {
      setJourneyError('Connection error. Is the backend running?')
      console.error('Create journey error:', err)
    } finally {
      setIsCreatingJourney(false)
    }
  }

  const handleJoinJourney = async (e) => {
    e.preventDefault()
    
    if (!joinJourneyId) {
      setJoinError('Journey ID is required')
      return
    }

    setJoinError(null)
    setJoinSuccess(null)
    setIsJoiningJourney(true)

    const token = localStorage.getItem('linkngo_token')

    try {
      const response = await fetch(`${API_BASE_URL}/api/journeys/${joinJourneyId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setJoinSuccess('Successfully joined journey!')
        setJoinedJourney(data.data)
        setJoinJourneyId('')
      } else {
        setJoinError(data.message || 'Failed to join journey')
      }
    } catch (err) {
      setJoinError('Connection error. Is the backend running?')
      console.error('Join journey error:', err)
    } finally {
      setIsJoiningJourney(false)
    }
  }

  const handleSelectJourney = async (journeyId) => {
    setSelectedJourney(null)
    setSelectedJourneyError(null)
    setIsSelectedJourneyLoading(true)

    const token = localStorage.getItem('linkngo_token')
    if (!token) {
      setSelectedJourneyError('Authentication token missing')
      setIsSelectedJourneyLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/journeys/${journeyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setSelectedJourney(data.data)
      } else {
        setSelectedJourneyError(data.message || 'Failed to fetch journey details')
      }
    } catch (err) {
      console.error('Failed to fetch journey details:', err)
      setSelectedJourneyError('Connection error. Is the backend running?')
    } finally {
      setIsSelectedJourneyLoading(false)
    }
  }

  const handleBackToJourneys = () => {
    setSelectedJourney(null)
    setSelectedJourneyError(null)
  }

  return (
    <div className="app-container">
      <h1>LinkNGo</h1>
      <p>Connect. Ride. Stay together.</p>
      
      <div className="backend-status" style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Backend Status</h2>
        {isHealthLoading && <p>Loading connection...</p>}
        {healthError && <p style={{ color: 'red' }}>Connection failed: {healthError}</p>}
        {healthMessage && <p style={{ color: 'green' }}>Connected: {healthMessage}</p>}
      </div>

      <div className="auth-container" style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'left' }}>
        {isAuthLoading ? (
          <div>
            <h2>Checking authentication...</h2>
          </div>
        ) : selectedJourney || isSelectedJourneyLoading || selectedJourneyError ? (
          <div>
            <button onClick={handleBackToJourneys} style={{ padding: '0.2rem 0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
              &larr; Back to Journeys
            </button>
            <h2>Journey Lobby</h2>
            {isSelectedJourneyLoading ? (
              <p>Loading journey lobby...</p>
            ) : selectedJourneyError ? (
              <p style={{ color: 'red' }}>{selectedJourneyError}</p>
            ) : selectedJourney ? (
              <div style={{ padding: '1.5rem', border: '2px solid #007bff', borderRadius: '8px', backgroundColor: '#f8f9fa', textAlign: 'center' }}>
                <h3 style={{ marginTop: '0', color: '#007bff' }}>{selectedJourney.name}</h3>
                <p><strong>Destination:</strong> {selectedJourney.destination}</p>
                <p><strong>Creator:</strong> {currentUser?.name || 'Unknown'}</p>
                <div style={{ margin: '2rem 0', padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                  <h4 style={{ margin: 0, color: '#495057' }}>Waiting for riders to join...</h4>
                  <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#6c757d' }}>This is your journey lobby. Riders will appear here once they join.</div>
                </div>
                <p style={{ fontSize: '0.85em', color: '#999', margin: '0' }}>Journey ID: {selectedJourney._id}</p>
              </div>
            ) : null}
          </div>
        ) : currentUser ? (
          <div>
            <h2>Logged in as:</h2>
            <p><strong>Name:</strong> {currentUser.name}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Member since:</strong> {new Date(currentUser.createdAt).toLocaleDateString()}</p>
            
            <hr style={{ margin: '1.5rem 0' }} />
            <h3>Create a Journey</h3>
            {journeyError && <p style={{ color: 'red', marginBottom: '1rem' }}>{journeyError}</p>}
            <form onSubmit={handleCreateJourney} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', marginBottom: '1rem' }}>
              <div>
                <label htmlFor="journeyName" style={{ display: 'block', marginBottom: '0.5rem' }}>Journey Name:</label>
                <input 
                  type="text" 
                  id="journeyName" 
                  value={journeyName} 
                  onChange={(e) => setJourneyName(e.target.value)} 
                  style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label htmlFor="journeyDestination" style={{ display: 'block', marginBottom: '0.5rem' }}>Destination:</label>
                <input 
                  type="text" 
                  id="journeyDestination" 
                  value={journeyDestination} 
                  onChange={(e) => setJourneyDestination(e.target.value)} 
                  style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" disabled={isCreatingJourney} style={{ padding: '0.5rem', cursor: isCreatingJourney ? 'not-allowed' : 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
                {isCreatingJourney ? 'Creating...' : 'Create Journey'}
              </button>
            </form>

            {createdJourney && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#eef', borderRadius: '4px' }}>
                <h4>Journey Created Successfully!</h4>
                <p><strong>Name:</strong> {createdJourney.name}</p>
                <p><strong>Destination:</strong> {createdJourney.destination}</p>
                <p><strong>Created At:</strong> {new Date(createdJourney.createdAt).toLocaleString()}</p>
              </div>
            )}

            <hr style={{ margin: '1.5rem 0' }} />
            <h3>Join a Journey</h3>
            {joinError && <p style={{ color: 'red', marginBottom: '1rem' }}>{joinError}</p>}
            {joinSuccess && <p style={{ color: 'green', marginBottom: '1rem' }}>{joinSuccess}</p>}
            <form onSubmit={handleJoinJourney} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', marginBottom: '1rem' }}>
              <div>
                <label htmlFor="joinJourneyId" style={{ display: 'block', marginBottom: '0.5rem' }}>Journey ID:</label>
                <input 
                  type="text" 
                  id="joinJourneyId" 
                  value={joinJourneyId} 
                  onChange={(e) => setJoinJourneyId(e.target.value)} 
                  style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" disabled={isJoiningJourney} style={{ padding: '0.5rem', cursor: isJoiningJourney ? 'not-allowed' : 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
                {isJoiningJourney ? 'Joining...' : 'Join Journey'}
              </button>
            </form>

            {joinedJourney && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#eef', border: '1px solid #007bff', borderRadius: '4px' }}>
                <h4>Joined Journey Details</h4>
                <p><strong>Name:</strong> {joinedJourney.name}</p>
                <p><strong>Destination:</strong> {joinedJourney.destination}</p>
                <p><strong>Created At:</strong> {new Date(joinedJourney.createdAt).toLocaleString()}</p>
                <p><strong>Participants:</strong> {joinedJourney.participants ? joinedJourney.participants.length : 0}</p>
              </div>
            )}

            <hr style={{ margin: '1.5rem 0' }} />
            <h3>My Journeys</h3>
            {isJourneysLoading ? (
              <p>Loading journeys...</p>
            ) : journeysError ? (
              <p style={{ color: 'red' }}>{journeysError}</p>
            ) : myJourneys.length === 0 ? (
              <p>No journeys created yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myJourneys.map(journey => (
                  <div 
                    key={journey._id} 
                    onClick={() => handleSelectJourney(journey._id)}
                    style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#fafafa' }}
                  >
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#007bff' }}>{journey.name}</h4>
                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Destination:</strong> {journey.destination}</p>
                    <p style={{ margin: '0', fontSize: '0.85em', color: '#666' }}><strong>Created At:</strong> {new Date(journey.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            <hr style={{ margin: '1.5rem 0' }} />
            <button onClick={handleLogout} style={{ padding: '0.5rem', cursor: 'pointer', marginTop: '1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
              Logout
            </button>
          </div>
        ) : isRegisterView ? (
          <div>
            <h2>Register</h2>
            {regError && <p style={{ color: 'red', marginBottom: '1rem' }}>{regError}</p>}
            {regSuccess && <p style={{ color: 'green', marginBottom: '1rem' }}>{regSuccess}</p>}
            
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
              <div>
                <label htmlFor="regName" style={{ display: 'block', marginBottom: '0.5rem' }}>Name:</label>
                <input 
                  type="text" 
                  id="regName" 
                  value={regName} 
                  onChange={(e) => setRegName(e.target.value)} 
                  style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label htmlFor="regEmail" style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
                <input 
                  type="email" 
                  id="regEmail" 
                  value={regEmail} 
                  onChange={(e) => setRegEmail(e.target.value)} 
                  style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label htmlFor="regPassword" style={{ display: 'block', marginBottom: '0.5rem' }}>Password:</label>
                <input 
                  type="password" 
                  id="regPassword" 
                  value={regPassword} 
                  onChange={(e) => setRegPassword(e.target.value)} 
                  style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" disabled={isRegistering} style={{ padding: '0.5rem', cursor: isRegistering ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}>
                {isRegistering ? 'Creating account...' : 'Register'}
              </button>
            </form>
            <div style={{ marginTop: '1rem' }}>
              <p>Already have an account? <button onClick={() => { setIsRegisterView(false); setRegSuccess(null); setRegError(null); }} style={{ padding: '0.2rem 0.5rem', cursor: 'pointer' }}>Login</button></p>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>Login</h2>
            {loginError && <p style={{ color: 'red', marginBottom: '1rem', backgroundColor: '#ffe6e6', padding: '0.5rem', borderRadius: '4px' }}>{loginError}</p>}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
              <div>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email:</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password:</label>
                <input 
                  type="password" 
                  id="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <button type="submit" disabled={isLoggingIn} style={{ padding: '0.6rem', cursor: isLoggingIn ? 'not-allowed' : 'pointer', marginTop: '0.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <div style={{ marginTop: '1rem' }}>
              <p>Don't have an account? <button onClick={() => { setIsRegisterView(true); setLoginError(null); }} style={{ padding: '0.2rem 0.5rem', cursor: 'pointer', background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline' }}>Register</button></p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
