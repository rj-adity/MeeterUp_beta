import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import toast from "react-hot-toast";
import { useThemeStore } from "../store/useThemeStore";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY

const ChatPage = () => {
  const {id: targetUserId} = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeStore();

  const {authUser} = useAuthUser();

  const {data : tokenData} = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser // this will run only when authUser is available
  });

  useEffect(()=> {
    const initChat = async () => {
      if(!tokenData?.token  || !authUser) {
        console.log("Waiting for token or authUser:", { hasToken: !!tokenData?.token, hasAuthUser: !!authUser });
        return;
      }

      try {
        console.log("Initialising stream chat client...")

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser({
          id: authUser._id,
          name: authUser.fullName,
        }, tokenData.token);

        const channelId = [authUser._id, targetUserId].sort().join("_");

        //Create a channel 
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });
        
        await currChannel.watch();
        
        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing stream chat client", error);
        toast.error("Could not connect to chat. Please try again later.")
      } finally {
        setLoading(false);
      }
    }
    initChat();
    
    // Cleanup function to disconnect client when component unmounts
    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  },[tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if(channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I have started a video call. Join me here: ${callUrl}`,
      })

      toast.success("Video call link sent successfully!")
    }
  }

  if(loading || !chatClient || !channel ) return <ChatLoader />;

  // Stream Chat theme configuration based on current theme
  const streamTheme = {
    'light': 'light',
    'dark': 'dark',
    'forest': 'dark',
    'synthwave': 'dark',
    'cyberpunk': 'dark',
    'retro': 'light',
    'valentine': 'light',
    'aqua': 'light',
    'dracula': 'dark',
    'night': 'dark',
    'coffee': 'dark',
    'winter': 'light'
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center" style={{ backgroundColor: `hsl(var(--b2))` }}>
      <div className="w-full max-w-4xl bg-base-100 rounded-lg shadow-lg flex flex-col h-[80vh]">
        {/* Custom Header - Outside of Stream Chat components */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 shrink-0 bg-base-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
              {channel?.state?.members?.[targetUserId]?.user?.image ? (
                <img 
                  src={channel.state.members[targetUserId].user.image} 
                  alt="User avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-white font-semibold">
                  {channel?.state?.members?.[targetUserId]?.user?.name?.charAt(0)?.toUpperCase() || 
                   targetUserId?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-lg text-base-content">
                {channel?.state?.members?.[targetUserId]?.user?.name || 
                 `User ${targetUserId?.slice(-4) || ''}`}
              </h2>
              <p className="text-sm text-base-content/70">2 members, 2 online</p>
            </div>
          </div>
          <div className="flex items-center">
            <CallButton handleVideoCall={handleVideoCall} />
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 min-h-0">
          <Chat client={chatClient} theme={streamTheme[theme] || 'light'}>
            <Channel channel={channel}>
              <Window>
                <MessageList />
                <MessageInput focus disableVoiceRecording />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        </div>
      </div>
    </div>
  )
}

export default ChatPage