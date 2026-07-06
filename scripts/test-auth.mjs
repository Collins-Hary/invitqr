import crypto from 'crypto'

const base = 'http://localhost:3000/api/auth'

function createJwt(payload, secret, options = {}) {
    const header = { alg: 'HS256', typ: 'JWT' }
    const now = Math.floor(Date.now() / 1000)
    const body = {
        ...payload,
        iat: now,
        ...options,
    }
    const encHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
    const encPayload = Buffer.from(JSON.stringify(body)).toString('base64url')
    const signingInput = `${encHeader}.${encPayload}`
    const signature = crypto.createHmac('sha256', secret).update(signingInput).digest('base64url')
    return `${signingInput}.${signature}`
}
const testEmail = 'test-auth@example.com'
const testPassword = 'password123'

async function request(path, options = {}) {
    const res = await fetch(`${base}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
    })
    const text = await res.text()
    let body = text
    try { body = JSON.parse(text) } catch {}
    return { status: res.status, body }
}

async function main() {
    console.log('--- REGISTER (valid) ---')
    const reg = await request('/register', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test User', email: testEmail, password: testPassword }),
    })
    console.log(reg)

    console.log('--- REGISTER (duplicate) ---')
    const dup = await request('/register', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test User', email: testEmail, password: testPassword }),
    })
    console.log(dup)

    console.log('--- REGISTER (short password) ---')
    const short = await request('/register', {
        method: 'POST',
        body: JSON.stringify({ name: 'Short', email: 'short@example.com', password: '123' }),
    })
    console.log(short)

    console.log('--- LOGIN (correct) ---')
    const login = await request('/login', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail, password: testPassword }),
    })
    console.log(login)

    console.log('--- LOGIN (incorrect) ---')
    const badLogin = await request('/login', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail, password: 'wrongpass' }),
    })
    console.log(badLogin)

    const token = login.body && login.body.token ? login.body.token : null
    console.log('--- /me with valid token ---')
    const me = token ?
        await request('/me', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }) : { status: 0, body: 'No token from login' }
    console.log(me)

    console.log('--- /me with invalid token ---')
    const invalidMe = await request('/me', {
        method: 'GET',
        headers: { Authorization: 'Bearer invalid.token.here' },
    })
    console.log(invalidMe)

    console.log('--- /me with expired token ---')
    const expiredToken = createJwt({ userId: 'fake-user', exp: Math.floor(Date.now() / 1000) - 10 }, 'sua_chave_secreta_bem_longa_aqui_min_32_caracteres_desenvolvimento')
    const expiredMe = await request('/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${expiredToken}` },
    })
    console.log(expiredMe)

    console.log('--- TESTS COMPLETED ---')
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})