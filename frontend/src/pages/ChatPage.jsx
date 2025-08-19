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
import { useMessageStore } from "../store/useMessageStore";
import { getBlockedUsers } from "../lib/api";
import { Mic, Square, Video as VideoIcon } from "lucide-react";

const ChatPage = () => {
  const {id: targetUserId} = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeStore();

  const {authUser} = useAuthUser();
  const globalClient = useStreamClient();
  const { resetChannelUnread, clearNotificationsBySender } = useMessageStore();
  const [isBlocked, setIsBlocked] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);

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

  // When on a chat, clear unread counts and notifications for that sender
  useEffect(() => {
    if (!channel || !targetUserId) return;
    const channelId = channel.id;
    resetChannelUnread(channelId);
    clearNotificationsBySender(targetUserId);
  }, [channel, targetUserId, resetChannelUnread, clearNotificationsBySender]);

  // Check if target user is blocked by me
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const blocked = await getBlockedUsers();
        if (mounted) {
          setIsBlocked(Boolean(blocked?.some?.((u) => u._id === targetUserId)));
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, [targetUserId]);

  const handleVideoCall = () => {
    if(channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I have started a video call. Join me here: ${callUrl}`,
      })

      toast.success("Video call link sent successfully!")
    }
  }

  const startRecording = async () => {
    try {
      if (!channel) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Pick the most compatible mime type available
      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/ogg;codecs=opus",
        "audio/mp4",
        "audio/mpeg",
      ];
      let selectedMime = "";
      for (const t of preferredTypes) {
        try {
          if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
            selectedMime = t;
            break;
          }
        } catch {}
      }
      const recorder = selectedMime ? new MediaRecorder(stream, { mimeType: selectedMime }) : new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        try {
          const blobType = selectedMime || "audio/webm";
          const blob = new Blob(chunks, { type: blobType });
          let ext = "webm";
          if (blobType.includes("ogg")) ext = "ogg";
          else if (blobType.includes("mp4")) ext = "m4a";
          else if (blobType.includes("mpeg")) ext = "mp3";
          const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: blobType });
          // Upload to Stream CDN
          const upload = await channel.sendFile(file);
          const fileUrl = upload?.file;
          await channel.sendMessage({
            text: "",
            attachments: [
              {
                type: "audio",
                asset_url: fileUrl,
                title: file.name,
                mime_type: blobType,
              },
            ],
          });
          toast.success("Voice message sent");
        } catch (err) {
          console.error("Error sending voice message", err);
          toast.error("Failed to send voice message");
        } finally {
          setIsRecording(false);
          setAudioChunks([]);
          setMediaRecorder(null);
          try { stream.getTracks().forEach((t) => t.stop()); } catch {}
          setAudioStream(null);
        }
      };
      setAudioStream(stream);
      setAudioChunks(chunks);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic permission / recording error", err);
      toast.error("Microphone not available");
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    } catch {}
  };

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
    <div className="min-h-[100dvh] p-2 sm:p-4 flex items-center justify-center" style={{ backgroundColor: `hsl(var(--b2))` }}>
      <div className="w-full max-w-4xl bg-base-100 rounded-none sm:rounded-lg shadow-none sm:shadow-lg flex flex-col h-[100dvh] sm:h-[85vh]">
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
                {!isBlocked ? (
                  <div className="relative">
                    <MessageInput focus disableVoiceRecording grow type="text" />
                    <div className="absolute right-2 bottom-2 flex items-center gap-2">
                      {!isRecording ? (
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Send voice message"
                          onClick={startRecording}
                        >
                          <Mic className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          className="btn btn-error btn-sm"
                          title="Stop recording"
                          onClick={stopRecording}
                        >
                          <Square className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Start video call"
                        onClick={handleVideoCall}
                      >
                        <VideoIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-center text-sm text-base-content/70 border-t border-base-300">
                    You have blocked this user. Unblock to send messages.
                  </div>
                )}
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