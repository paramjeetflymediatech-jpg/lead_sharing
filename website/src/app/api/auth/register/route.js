import { NextResponse } from 'next/server';
import { User } from '@/models/User';
import { TradespersonProfile } from '@/models/TradespersonProfile';
import { hashPassword, signAuthToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/serverAuth';

export async function POST(req) {
  const body = await req.json();
  let { name, email, password, role, companyName, phone } = body;

  if (email) email = email.toLowerCase();

  if (!name || !email || !password || !role || !phone) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ message: 'Email already in use' }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  // Save to pending_users instead of users table
  const user = await User.createPending({
    name,
    email,
    password: passwordHash,
    role,
    phone,
    companyName: role === 'TRADESPERSON' ? companyName : null
  });

  // Tokens are not needed yet since user isn't fully created
  // const token = signAuthToken({ userId: user._id.toString(), role });
  // Removed setAuthCookie(token) - User must verify OTP and login manually

  return NextResponse.json(
    {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      phoneVerified: false,
    },
    { status: 201 }
  );
}
