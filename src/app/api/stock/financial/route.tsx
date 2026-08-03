import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const symbol = new URL(request.url).searchParams.get('symbol');

  const res = await fetch(
    `${process.env.AWS_API_URL}/indicators/financial?symbol=${symbol}`,
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
