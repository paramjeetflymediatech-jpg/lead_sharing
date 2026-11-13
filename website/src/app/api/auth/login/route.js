import { NextResponse } from 'next/server';
import { User } from '@/models/User';
import { verifyPassword, signAuthToken, hashPassword } from '@/lib/auth';
import { setAuthCookie } from '@/lib/serverAuth';
import pool from '@/../config/db.js';
import fs from 'fs';
import path from 'path';

function cleanString(val) {
  if (!val) return '';
  let s = String(val).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.trim();
}

function getAdminEnvCredentials() {
  const fileEnv = {};
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          fileEnv[key] = val;
        }
      }
    }
  } catch (e) {
    // ignore read error, fall back to process.env
  }

  const rawEmail =
    fileEnv.ADMIN_EMAIL ||
    fileEnv.ADMIN_USER ||
    fileEnv.ADMIN_ID ||
    process.env.ADMIN_EMAIL ||
    process.env.ADMIN_USER ||
    process.env.ADMIN_ID ||
    'admin@leadsharing.com';

  const rawUsername =
    fileEnv.ADMIN_USERNAME ||
    process.env.ADMIN_USERNAME ||
    'admin';

  const rawPass =
    fileEnv.ADMIN_PASSWORD ||
    fileEnv.ADMIN_PASS ||
    fileEnv.PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_PASS ||
    process.env.PASSWORD ||
    'admin@123';

  return {
    email: cleanString(rawEmail).toLowerCase(),
    username: cleanString(rawUsername).toLowerCase(),
    password: cleanString(rawPass),
  };
}

async function syncAdminUser(targetEmail, newPlainPass) {
  try {
    const hashedPassword = await hashPassword(newPlainPass);

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? OR role = 'ADMIN' OR email = 'admin@leadsharing.com' LIMIT 1",
      [targetEmail]
    );

    if (rows && rows.length > 0) {
      const existingId = rows[0].id;
      await pool.query(
        "UPDATE users SET password = ?, email = ?, role = 'ADMIN' WHERE id = ?",
        [hashedPassword, targetEmail, existingId]
      );
      console.log(`[Auth] Automatically updated admin password in DB for: ${targetEmail}`);
      const [updatedRows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [existingId]);
      const row = updatedRows[0];
      return {
        ...row,
        _id: row.id,
        id: row.id,
        role: 'ADMIN',
      };
    } else {
      const [result] = await pool.query(
        "INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, 'ADMIN')",
        [targetEmail, hashedPassword, 'Super Admin']
      );
      console.log(`[Auth] Created new admin user in DB for: ${targetEmail}`);
      return {
        _id: result.insertId,
        id: result.insertId,
        email: targetEmail,
        name: 'Super Admin',
        role: 'ADMIN',
      };
    }
  } catch (err) {
    console.warn('[Auth] Database sync warning:', err?.message || err);
    return null;
  }
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  let { email, password, deviceId, deviceType } = body;

  const inputEmail = cleanString(email).toLowerCase();
  const inputPass = cleanString(password);

  if (!inputEmail || !inputPass) {
    return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
  }

  const adminCreds = getAdminEnvCredentials();

  const isAdminAttempt =
    Boolean(adminCreds.password) &&
    (inputEmail === adminCreds.email ||
      inputEmail === adminCreds.username ||
      inputEmail === 'admin' ||
      inputEmail === 'admin@leadsharing.com');

  let user = null;

  if (isAdminAttempt) {
    // STRICT CHECK: Admin password must match .env ADMIN_PASSWORD!
    if (inputPass !== adminCreds.password) {
      console.warn(`[Auth] Admin login failed: Password mismatch for ${inputEmail}`);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Automatically sync/update the database hash
    user = await syncAdminUser(adminCreds.email, adminCreds.password);
    if (!user) {
      return NextResponse.json({ message: 'Failed to synchronize admin user' }, { status: 500 });
    }
    console.log(`[Auth] Admin login successful for ${user.email} (synced to database)`);
  } else {
    user = await User.findOne({ email: inputEmail });
    if (!user) {
      console.log("Login failed: User not found", inputEmail);
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }

    const isValid = await verifyPassword(inputPass, user.password);
    console.log("Login check:", inputEmail, "Valid:", isValid);
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
  }

  const token = signAuthToken({ userId: user._id.toString(), role: user.role, phone: user.phone });
  await setAuthCookie(token);

  // Save token to database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Matches 7d from signAuthToken
  try {
    await User.saveAuthToken(user._id, token, expiresAt, { deviceId, deviceType });
  } catch (err) {
    console.warn('[Auth] Token save warning:', err?.message || err);
  }

  // Get verification status for tradesperson
  let verificationStatus = "NOT_STARTED";
  if (user.role === "TRADESPERSON") {
    try {
      const { TradespersonProfile } = await import("@/models/TradespersonProfile");
      const profile = await TradespersonProfile.findOne({ user: user._id });
      if (profile) {
        verificationStatus = profile.verificationStatus || profile.verification_status || "NOT_STARTED";
      }
    } catch (err) {
      // ignore
    }
  }

  return NextResponse.json(
    {
      token,
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      phoneVerified: !!user.phone_verified,
      phone: user.phone,
      verificationStatus,
    },
    { status: 200 }
  );
}
