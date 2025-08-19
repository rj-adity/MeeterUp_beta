import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useStreamClient } from "../hooks/useStreamClient";
import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import toast from "react-hot-toast";
import { useThemeStore } from "../store/useThemeStore";

const ChatPage = () => {
  const {id: targetUserId} = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeStore();

  const {authUser} = useAuthUser();
  const globalClient = useStreamClient();

  useEffect(()=> {
    const initChat = async () => {
      // Wait for auth and global client to be ready and connected
      if(!authUser || !globalClient || globalClient.userID !== authUser._id) {
        console.log("Waiting for global Stream client connection", {
          hasAuthUser: !!authUser,
          hasClient: !!globalClient,
          userId: globalClient?.userID
        });
        return;
      }

      try {
        console.log("Initialising channel on existing Stream client...")

        const channelId = [authUser._id, targetUserId].sort().join("_");

        //Create a channel 
        const currChannel = globalClient.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });
        
        await currChannel.watch();
        
        setChatClient(globalClient);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing stream chat client", error);
        toast.error("Could not connect to chat. Please try again later.")
      } finally {
        setLoading(false);
      }
    }
    initChat();
    
    // Cleanup: do not disconnect the global client; just stop using channel
    return () => {
      // no-op; Stream handles channel listeners internally when component unmounts
    };
  },[authUser, targetUserId, globalClient]);

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
    <div className="min-h-screen p-2 sm:p-4 flex items-center justify-center" style={{ backgroundColor: `hsl(var(--b2))` }}>
      <div className="w-full max-w-4xl bg-base-100 rounded-none sm:rounded-lg shadow-none sm:shadow-lg flex flex-col h-[100vh] sm:h-[85vh]">
        {/* Custom Header - Outside of Stream Chat components */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-base-300 shrink-0 bg-base-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center">
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
              <h2 className="font-semibold text-base sm:text-lg text-base-content">
                {channel?.state?.members?.[targetUserId]?.user?.name || 
                 `User ${targetUserId?.slice(-4) || ''}`}
              </h2>
              <p className="text-xs sm:text-sm text-base-content/70">2 members, 2 online</p>
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
                <MessageList messageActions={['react', 'reply']} />
                <MessageInput focus disableVoiceRecording grow type="text" Input={undefined} />
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