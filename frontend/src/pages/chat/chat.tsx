import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getMessages, sendMessage } from '@/lib/mockChatApi.ts';
import BubbleMessage from '@/components/chat/BubbleMessage.tsx';
import BubbleSpinner from '@/components/chat/BubbleSpinner.tsx';
import MessageInputGroup from '@/components/chat/MessageInputGroup.tsx';
import ChatSkeleton from '@/components/skeletons/ChatSkeleton.tsx';
import type { Message as ChatMessage } from '@/types/Chat.ts';

export default function Chat() {
  const { conversationId: conversationIdParam } = useParams<{ conversationId: string }>();
  const conversationId = conversationIdParam ? Number(conversationIdParam) : null;

  const { data: seedMessages, isLoading: loading } = useQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: ({ signal }) => getMessages(conversationId as number, signal),
    enabled: conversationId !== null,
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMutation = useMutation({
    mutationFn: ({ content, signal }: { content: string; signal: AbortSignal }) =>
      sendMessage(conversationId ?? 0, content, signal),
    onSuccess: (reply, { signal }) => {
      if (!signal.aborted) {
        setMessages((prev) => [...prev, reply]);
      }
    },
    onError: (error, { signal }) => {
      if (!signal.aborted && error.name !== 'AbortError') {
        console.error(error);
      }
    },
  });
  const sending = sendMutation.isPending;

  useEffect(() => {
    if (conversationId === null) {
      setMessages([]);
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId !== null && seedMessages) {
      setMessages(seedMessages);
    }
  }, [seedMessages, conversationId]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  function handleSend() {
    const content = input.trim();
    if (!content || sending) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: (prev.at(-1)?.id ?? 0) + 1,
        conversationId: conversationId ?? 0,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      },
    ]);
    setInput('');

    const controller = new AbortController();
    abortRef.current = controller;

    sendMutation.mutate({ content, signal: controller.signal });
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto py-4">
        {loading ? (
          <ChatSkeleton />
        ) : messages.length === 0 && !sending ? (
          <p className="text-sm text-muted-foreground">Start the conversation below.</p>
        ) : (
          <>
            {messages.map((message) => (
              <BubbleMessage key={message.id} message={message} />
            ))}
            {sending && <BubbleSpinner />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInputGroup
        value={input}
        onChange={setInput}
        onSubmit={handleSend}
        sending={sending}
      />
    </div>
  );
}
