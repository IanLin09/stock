import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range');
  const symbol = searchParams.get('symbol');

  const res = await fetch(
    `${process.env.AWS_API_URL}/indicators/range?range=${range}&symbol=${symbol}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AWS_TOKEN}`,
      },
    }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
