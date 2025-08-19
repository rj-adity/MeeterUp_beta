import { useEffect, useRef, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { useMessageStore } from '../store/useMessageStore';
import useAuthUser from './useAuthUser';
import { useQuery } from '@tanstack/react-query';
import { getStreamToken } from '../lib/api';
import { useThemeStore } from '../store/useThemeStore';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export const useStreamClient = () => {
  const { authUser } = useAuthUser();
  const { incrementChannelUnread, setUnreadFromServer, addNotification } = useMessageStore();
  const { theme } = useThemeStore();
  const clientRef = useRef(null);
  const [connectedClient, setConnectedClient] = useState(null);

  const { data: tokenData } = useQuery({
    queryKey: ['streamToken'],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!authUser || !tokenData?.token) return;

    let isMounted = true;
    const client = StreamChat.getInstance(STREAM_API_KEY);
    clientRef.current = client;

    const connect = async () => {
      // Avoid reconnect if already connected as the same user
      if (client.userID === authUser._id) {
        setConnectedClient(client);
        return;
      }

      console.log("Connecting to Stream with user:", { id: authUser._id, name: authUser.fullName });
      await client.connectUser(
        { id: authUser._id, name: authUser.fullName },
        tokenData.token
      );

      console.log("Successfully connected to Stream in useStreamClient");

      // Prefetch unread counts per channel
      const filters = { type: 'messaging', members: { $in: [authUser._id] } };
      const sort = [{ last_message_at: -1 }];
      const channels = await client.queryChannels(filters, sort, { limit: 30 });
      const channelIdToCount = {};
      channels.forEach((ch) => {
        channelIdToCount[ch.id] = ch.countUnread();
      });
      if (isMounted) setUnreadFromServer(channelIdToCount);

      // Listen for new messages
      client.off('message.new');
      client.on('message.new', async (event) => {
        const channelId = event?.cid?.split(':')[1];
        const messageUserId = event?.user?.id;
        const messageText = event?.message?.text;
        
        if (!channelId || messageUserId === authUser._id) return;
        
        incrementChannelUnread(channelId, 1);

        // Get sender info for notification
        try {
          const sender = event?.user;
          if (sender) {
            const notification = {
              id: Date.now() + Math.random(),
              channelId,
              senderId: sender.id,
              senderName: sender.name || 'Unknown User',
              senderImage: sender.image || '',
              message: messageText || 'Sent a message',
              timestamp: new Date().toISOString(),
              isRead: false
            };
            addNotification(notification);
          }
        } catch (error) {
          console.log('Error creating notification:', error);
        }
      });
      setConnectedClient(client);
    };

    connect();

    // Do not disconnect on theme change; only when app truly unmounts
    return () => {
      isMounted = false;
      // Intentionally not disconnecting here to avoid tearing down global client
    };
  }, [authUser?._id, tokenData?.token]);

  return connectedClient;
};


