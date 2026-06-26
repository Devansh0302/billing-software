import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/staff - Get all staff
export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      select: { id: true, name: true, email: true, role: true, pin: true, is_active: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(staff);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

// POST /api/staff - Create new staff (ADMIN only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role, pin } = body;

    const hashedPassword = await bcrypt.hash(password || 'password123', 12);

    const staff = await prisma.staff.create({
      data: { name, email, password: hashedPassword, role: role || 'WAITER', pin: pin || '0000' },
      select: { id: true, name: true, email: true, role: true, is_active: true },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}

// PATCH /api/staff - Update staff (ADMIN only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }

    const staff = await prisma.staff.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, is_active: true },
    });

    return NextResponse.json(staff);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}
