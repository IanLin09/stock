import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch(`${process.env.AWS_API_URL}/daily`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AWS_TOKEN}`,
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
