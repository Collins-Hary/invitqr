import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'

const base = 'http://localhost:3000/api'
const token = jwt.sign({ userId: 'cmrdxxl3o000071oz3dj9dz2c' }, 'sua_chave_secreta_bem_longa_aqui_min_32_caracteres', { expiresIn: '7d' })

async function request(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })

  const text = await res.text()
  let body = text
  try { body = JSON.parse(text) } catch {}
  return { status: res.status, body }
}

async function main() {
  const createEvent = await request('/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Guest Test Event',
      date: '2099-12-31T20:00:00.000Z',
      location: 'Porto',
      max_guests: 50
    })
  })

  assert.equal(createEvent.status, 201, 'event creation should succeed')
  const eventId = createEvent.body.id

  const createGuest = await request(`/events/${eventId}/guests`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Maria Silva', email: 'maria@example.com', phone: '+351912000000' })
  })

  assert.equal(createGuest.status, 201, 'guest creation should succeed')
  assert.ok(createGuest.body.qr_token, 'guest should get a qr token')
  assert.ok(createGuest.body.backup_code, 'guest should get a backup code')

  const listGuests = await request(`/events/${eventId}/guests`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  })

  assert.equal(listGuests.status, 200, 'guest listing should succeed')
  assert.ok(Array.isArray(listGuests.body), 'guest list should be an array')

  console.log('Guest flow test passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
