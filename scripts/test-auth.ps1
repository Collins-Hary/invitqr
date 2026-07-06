$base = 'http://localhost:3000/api/auth'

Write-Output '--- REGISTER (valid) ---'
try {
  $body = @{ name = 'Test User'; email = 'test@example.com'; password = 'password123' } | ConvertTo-Json
  $reg = Invoke-RestMethod -Uri "$base/register" -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
  $reg | ConvertTo-Json -Depth 5
  $token_registered = $reg.token
} catch {
  Write-Output "ERROR: $($_.Exception.Message)"
}

Write-Output '--- REGISTER (duplicate) ---'
try {
  $body = @{ name = 'Test User'; email = 'test@example.com'; password = 'password123' } | ConvertTo-Json
  $reg2 = Invoke-RestMethod -Uri "$base/register" -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
  $reg2 | ConvertTo-Json
} catch {
  Write-Output "EXPECTED ERROR: $($_.Exception.Message)"
}

Write-Output '--- REGISTER (short password) ---'
try {
  $body = @{ name = 'Short'; email = 'short@example.com'; password = '123' } | ConvertTo-Json
  $r = Invoke-RestMethod -Uri "$base/register" -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
  $r | ConvertTo-Json
} catch {
  Write-Output "EXPECTED ERROR: $($_.Exception.Message)"
}

Write-Output '--- LOGIN (correct) ---'
try {
  $body = @{ email = 'test@example.com'; password = 'password123' } | ConvertTo-Json
  $login = Invoke-RestMethod -Uri "$base/login" -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
  $login | ConvertTo-Json -Depth 5
  $token_login = $login.token
} catch {
  Write-Output "ERROR: $($_.Exception.Message)"
}

Write-Output '--- LOGIN (incorrect) ---'
try {
  $body = @{ email = 'test@example.com'; password = 'wrongpass' } | ConvertTo-Json
  $l = Invoke-RestMethod -Uri "$base/login" -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
  $l | ConvertTo-Json
} catch {
  Write-Output "EXPECTED ERROR: $($_.Exception.Message)"
}

Write-Output '--- /me with valid token ---'
if ($token_login) {
  try {
    $me = Invoke-RestMethod -Uri "$base/me" -Method Get -Headers @{ Authorization = "Bearer $token_login" } -ErrorAction Stop
    $me | ConvertTo-Json -Depth 5
  } catch {
    Write-Output "ERROR: $($_.Exception.Message)"
  }
} else { Write-Output 'No token from login' }

Write-Output '--- /me with invalid token ---'
try {
  $me2 = Invoke-RestMethod -Uri "$base/me" -Method Get -Headers @{ Authorization = 'Bearer invalid.token.here' } -ErrorAction Stop
  $me2 | ConvertTo-Json
} catch {
  Write-Output "EXPECTED ERROR: $($_.Exception.Message)"
}

Write-Output '--- /me with expired token ---'
try {
  $secret = 'sua_chave_secreta_bem_longa_aqui_min_32_caracteres_desenvolvimento'
  $expired = npx -y -p jsonwebtoken node -e "console.log(require('jsonwebtoken').sign({userId:'fakeid'}, '$secret', {expiresIn:-10}))"
  $expired = $expired.Trim()
  $me3 = Invoke-RestMethod -Uri "$base/me" -Method Get -Headers @{ Authorization = "Bearer $expired" } -ErrorAction Stop
  $me3 | ConvertTo-Json
} catch {
  Write-Output "EXPECTED ERROR (expired token): $($_.Exception.Message)"
}

Write-Output '--- TESTS COMPLETED ---'
