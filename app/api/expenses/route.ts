import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseAmountToPaise, normalizeDate, sanitizeText, formatAmountFromPaise } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { idempotencyKey, amount, category, description, date } = body;

  if (!idempotencyKey || typeof idempotencyKey !== 'string') {
    return NextResponse.json({ error: 'idempotencyKey is required.' }, { status: 400 });
  }

  const amountPaise = parseAmountToPaise(amount);
  if (amountPaise === null || amountPaise <= 0) {
    return NextResponse.json({ error: 'Amount must be a positive number with up to 2 decimals.' }, { status: 400 });
  }

  const categoryValue = sanitizeText(category);
  const descriptionValue = sanitizeText(description);
  const dateValue = typeof date === 'string' ? normalizeDate(date) : null;

  if (!categoryValue) {
    return NextResponse.json({ error: 'Category is required.' }, { status: 400 });
  }
  if (!descriptionValue) {
    return NextResponse.json({ error: 'Description is required.' }, { status: 400 });
  }
  if (!dateValue) {
    return NextResponse.json({ error: 'Date is required and must be valid.' }, { status: 400 });
  }

  const existing = await prisma.expense.findUnique({
    where: { idempotencyKey },
  });

  if (existing) {
    return NextResponse.json(serializeExpense(existing), { status: 200 });
  }

  const created = await prisma.expense.create({
    data: {
      idempotencyKey,
      amountPaise,
      category: categoryValue,
      description: descriptionValue,
      date: dateValue,
    },
  });

  return NextResponse.json(serializeExpense(created), { status: 201 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const sort = searchParams.get('sort');

  const expenses = await prisma.expense.findMany({
    where: category ? { category } : undefined,
    orderBy: sort === 'date_desc'
      ? [{ date: 'desc' }, { createdAt: 'desc' }]
      : [{ createdAt: 'desc' }],
  });

  return NextResponse.json(expenses.map(serializeExpense));
}

function serializeExpense(expense: {
  id: string;
  idempotencyKey: string;
  amountPaise: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
}) {
  return {
    id: expense.id,
    idempotencyKey: expense.idempotencyKey,
    amount: formatAmountFromPaise(expense.amountPaise),
    amountPaise: expense.amountPaise,
    category: expense.category,
    description: expense.description,
    date: expense.date.toISOString().slice(0, 10),
    createdAt: expense.createdAt.toISOString(),
  };
}
