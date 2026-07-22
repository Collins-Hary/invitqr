import assert from 'node:assert/strict'

const base = 'http://localhost:3000/api'
let token = ''
let eventId = ''
let tableId = ''
let guestId = ''

async function request(path, options = {}) {
  const { headers: extraHeaders, ...rest } = options
  const res = await fetch(`${base}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(extraHeaders || {})
    }
  })

  const text = await res.text()
  let body = text
  try {
    body = JSON.parse(text)
  } catch {}

  return { status: res.status, body }
}

async function main() {
  // 1. Registar/autenticar
  const register = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Table Tester',
      email: 'tables-tester@example.com',
      password: 'password123'
    })
  })

  if (register.status === 201) {
    token = register.body.token
  } else {
    // Login if already exists
    const login = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'tables-tester@example.com',
        password: 'password123'
      })
    })
    assert.equal(login.status, 200, 'login should succeed')
    token = login.body.token
  }

  // 2. Criar evento
  const event = await request('/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Test Tables Event',
      date: '2026-12-31T20:00:00.000Z',
      location: 'Lisboa',
      max_guests: 50
    })
  })
  if (event.status !== 201) {
    console.error('Event creation failed:', event.status, JSON.stringify(event.body))
    process.exit(1)
  }
  assert.equal(event.status, 201, 'event creation should succeed')
  eventId = event.body.id

  // 3. Criar mesa
  const table = await request(`/events/${eventId}/tables`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Mesa VIP',
      capacity: 8
    })
  })
  assert.equal(table.status, 201, 'table creation should succeed')
  tableId = table.body.id
  assert.equal(table.body.name, 'Mesa VIP')
  assert.equal(table.body.capacity, 8)

  // 4. Criar segunda mesa
  const table2 = await request(`/events/${eventId}/tables`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Mesa 2',
      capacity: 4
    })
  })
  assert.equal(table2.status, 201, 'second table creation should succeed')

  // 5. Listar mesas
  const list = await request(`/events/${eventId}/tables`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  assert.equal(list.status, 200, 'listing tables should succeed')
  assert.ok(Array.isArray(list.body), 'tables should be an array')
  assert.ok(list.body.length >= 2, 'should have at least 2 tables')
  assert.ok('guestCount' in list.body[0], 'tables should include guestCount')

  // 6. Editar mesa
  const updated = await request(`/events/${eventId}/tables/${tableId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Mesa VIP Atualizada', capacity: 10 })
  })
  assert.equal(updated.status, 200, 'table update should succeed')
  assert.equal(updated.body.name, 'Mesa VIP Atualizada')
  assert.equal(updated.body.capacity, 10)

  // 7. Criar convidado para testar assign-table
  const guest = await request(`/events/${eventId}/guests`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'João Convidado', email: 'joao@test.com' })
  })
  assert.equal(guest.status, 201, 'guest creation should succeed')
  guestId = guest.body.id

  // 8. Atribuir convidado à mesa
  const assigned = await request(`/events/${eventId}/guests/${guestId}/assign-table`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ table_id: tableId })
  })
  assert.equal(assigned.status, 200, 'assign guest to table should succeed')
  assert.equal(assigned.body.table_id, tableId)

  // 9. Remover convidado da mesa
  const unassigned = await request(`/events/${eventId}/guests/${guestId}/assign-table`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ table_id: null })
  })
  assert.equal(unassigned.status, 200, 'unassign guest from table should succeed')
  assert.equal(unassigned.body.table_id, null)

  // 10. Obter detalhes da mesa (com convidados)
  const detail = await request(`/events/${eventId}/tables/${tableId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  assert.equal(detail.status, 200, 'get table detail should succeed')
  assert.ok('guests' in detail.body, 'should include guests array')

  // 11. Eliminar mesa
  const deleted = await request(`/events/${eventId}/tables/${tableId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  assert.equal(deleted.status, 200, 'table delete should succeed')

  // 12. Validação: tentar criar mesa sem nome
  const noName = await request(`/events/${eventId}/tables`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ capacity: 5 })
  })
  assert.equal(noName.status, 400, 'should reject table without name')

  // 13. Validação: tentar criar mesa com capacidade inválida
  const badCap = await request(`/events/${eventId}/tables`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Teste', capacity: 0 })
  })
  assert.equal(badCap.status, 400, 'should reject table with invalid capacity')

  console.log('✅ All tables tests passed!')
}

main().catch((error) => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})
