import { NextResponse } from 'next/server';
import { User } from '@/models/User';
import { verifyPassword, signAuthToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/serverAuth';

export async function POST(req) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
  }

  const user = await User.findOne({ email });
  if (!user) {
    console.log("Login failed: User not found", email);
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const isValid = await verifyPassword(password, user.password);
  console.log("Login check:", email, "Valid:", isValid);
  if (!isValid) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const token = signAuthToken({ userId: user._id.toString(), role: user.role });
  await setAuthCookie(token);

  return NextResponse.json(
    {
      token,
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    },
    { status: 200 }
  );
}
