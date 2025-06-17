'use client';
export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { NewsDTO } from '@/utils/dto';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useEffect } from 'react';
import { handleError } from '@/utils/error';
import { getNews } from '@/utils/api';


const NewsData = () => {
  const [limit, setLimit] = useState(9);
  const {
    data: allNews,
    isLoading,
    error,
  } = useQuery<NewsDTO[], Error>({
    queryKey: ['newsData'],
    queryFn: () => getNews(),
  });

  useEffect(() => {
    if (error) {
      handleError(error, { context: 'Data Fetch' });
    }
  }, [error]);
  if (isLoading) return <p>Loading...</p>;

  const visibleNews = allNews?.slice(0, limit);
  return (
    <>
      <div className="p-4 grid grid-cols-3 gap-4">
        {visibleNews &&
          visibleNews.map((news) => (
            <div key={news.id} className="">
              <a href={news.url} target="_blank">
                <Card className="h-90 rounded-xl shadow-md p-6 transition-transform transform hover:-translate-y-2 hover:shadow-xl">
                  <CardHeader>
                    <img src={news.image}></img>
                  </CardHeader>
                  <CardContent>
                    <p>{news.headline}</p>
                  </CardContent>
                </Card>
              </a>
            </div>
          ))}
      </div>
      {allNews && limit < allNews?.length && (
        <div className="flex justify-center mt-6">
          <Button onClick={() => setLimit((prev) => prev + 9)}>
            Load More
          </Button>
        </div>
      )}
    </>
  );
};

export default NewsData;

