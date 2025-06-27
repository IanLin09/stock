export const POST = async () => {
  try {
    const symbols = ['NVDL', 'QQQ', 'TQQQ'];

    const responses = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API}/indicators/latest`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
        },
        body: JSON.stringify({ symbol: 'QQQ' }),
      }),
      fetch(`${process.env.NEXT_PUBLIC_API}/daily/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
        },
      }),
      ...symbols.map((symbol) =>
        fetch(`${process.env.NEXT_PUBLIC_API}/intraday/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AWSTOKEN}`,
          },
          body: JSON.stringify({ symbol }),
        })
      ),
    ]);

    const results = await Promise.all(responses.map((res) => res.json()));

    if (process.env.NODE_ENV === 'development') {
      console.log('Cron complete:', results);
    }

    return new Response('Synced all APIs successfully', { status: 200 });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Sync failed:', e);
    }
    return new Response('Failed to sync', { status: 500 });
  }
};
