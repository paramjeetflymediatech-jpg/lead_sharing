import { NextResponse } from 'next/server';
import { User } from '@/models/User';
import { TradespersonProfile } from '@/models/TradespersonProfile';
import { hashPassword, signAuthToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/serverAuth';

export async function POST(req) {
  const body = await req.json();
  const { name, email, password, role, companyName } = body;

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
