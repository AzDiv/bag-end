// src/lib/api.ts

export async function requestPasswordReset(email: string) {
  const res = await fetch('http://localhost:3000/api/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function resetPassword(token: string, password: string) {
  const res = await fetch('http://localhost:3000/api/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  return res.json();
}
