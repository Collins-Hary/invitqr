import assert from 'node:assert/strict'

const base = 'http://localhost:3000/api'
let token = ''

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
  try {
    body = JSON.parse(text)
  } catch {}

  return { status: res.status, body }
}

async function main() {
  const register = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Event Tester',
      email: 'events-tester@example.com',
      password: 'password123'
    })
  })

  assert.equal(register.status, 201, 'register should succeed')
  token = register.body.token

  const create = await request('/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Launch Party',
      date: '2026-12-31T20:00:00.000Z',
      location: 'Porto',
      max_guests: 120
    })
  })

  assert.equal(create.status, 201, 'event creation should succeed')
  assert.ok(create.body.id, 'event should have an id')

  const list = await request('/events', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  })

  assert.equal(list.status, 200, 'listing events should succeed')
  assert.ok(Array.isArray(list.body), 'events should be returned as an array')

  console.log('Event flow test passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
