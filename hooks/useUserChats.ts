import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useUserChats() {
  const { data, error, mutate } = useSWR('/api/users/chats', fetcher);
  return {
    chats: data || [],
    loading: !data && !error,
    error,
    refetch: mutate,
  };
}
