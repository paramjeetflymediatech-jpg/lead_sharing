import { NextResponse } from 'next/server';
import { User } from '@/models/User';
import { TradespersonProfile } from '@/models/TradespersonProfile';
import { hashPassword, signAuthToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/serverAuth';

export async function POST(req) {
  const body = await req.json();
  let { name, email, password, role, companyName } = body;

  if (email) email = email.toLowerCase();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ message: 'Email already in use' }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: passwordHash,
    role,
  });

  if (role === 'TRADESPERSON') {
    if (!companyName) {
      return NextResponse.json(
        { message: 'companyName is required for tradesperson' },
        { status: 400 }
      );
    }

    await TradespersonProfile.create({
      user: user._id,
      companyName,
      serviceAreas: [],
      skills: [],
      credits: 0,
    });
  }

  const token = signAuthToken({ userId: user._id.toString(), role });
  await setAuthCookie(token);

  // Save token to database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Matches 7d from signAuthToken
  await User.saveAuthToken(user._id, token, expiresAt);

  return NextResponse.json(
    {
      token,
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    },
    { status: 201 }
  );
}
