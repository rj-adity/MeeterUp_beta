import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  const { id: targetUserId } = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeStore();

  const { authUser } = useAuthUser();
  const globalClient = useStreamClient();
  const { resetChannelUnread, clearNotificationsBySender } = useMessageStore();
  const [isBlocked, setIsBlocked] = useState(false);

  // Recording state
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  useEffect(() => {
    const initChat = async () => {
      if (!authUser || !globalClient || globalClient.userID !== authUser._id) return;
      try {
        const channelId = [authUser._id, targetUserId].sort().join("_");
        const currChannel = globalClient.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });
        await currChannel.watch();
        setChatClient(globalClient);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing Stream chat client", error);
        toast.error("Could not connect to chat. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    initChat();
  }, [authUser, targetUserId, globalClient]);

  useEffect(() => {
    if (!channel || !targetUserId) return;
    resetChannelUnread(channel.id);
    clearNotificationsBySender(targetUserId);
  }, [channel, targetUserId, resetChannelUnread, clearNotificationsBySender]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const blocked = await getBlockedUsers();
        if (mounted) setIsBlocked(Boolean(blocked?.some((u) => u._id === targetUserId)));
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [targetUserId]);

  // Video call logic (header button)
  const handleVideoCall = () => {
    if (!channel) return;
    const callUrl = `${window.location.origin}/call/${channel.id}`;
    channel.sendMessage({
      text: `I have started a video call. Join me here: ${callUrl}`,
    });
    toast.success("Video call link sent!");
  };

  // Audio recording logic
  const startRecordingAudio = async () => {
    if (!channel) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
          const upload = await channel.sendFile(file);
          await channel.sendMessage({
            text: "",
            attachments: [
              { type: "audio", asset_url: upload?.file, title: file.name, mime_type: blob.type },
            ],
          });
          toast.success("Voice message sent");
        } catch (err) {
          console.error("Error sending voice message", err);
          toast.error("Failed to send voice message");
        } finally {
          setIsRecordingAudio(false);
          setAudioChunks([]);
          setMediaRecorder(null);
          try { stream.getTracks().forEach((t) => t.stop()); } catch {}
          setAudioStream(null);
        }
      };
      recorder.start();
      setAudioChunks(chunks);
      setAudioStream(stream);
      setMediaRecorder(recorder);
      setIsRecordingAudio(true);
    } catch (err) {
      console.error("Mic permission / recording error", err);
      toast.error("Microphone not available");
    }
  };

  const stopRecordingAudio = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
  };

  const startVideoRecording = async () => {
    toast("Video-recording not implemented yet");
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  const streamTheme = {
    light: "light",
    dark: "dark",
    forest: "dark",
    synthwave: "dark",
    cyberpunk: "dark",
    retro: "light",
    valentine: "light",
    aqua: "light",
    dracula: "dark",
    night: "dark",
    coffee: "dark",
    winter: "light",
  };

  return (
    <div className="min-h-[100dvh] p-2 sm:p-4 flex items-center justify-center" style={{ backgroundColor: "hsl(var(--b2))" }}>
      <div className="w-full max-w-4xl bg-base-100 rounded-none sm:rounded-lg shadow-none sm:shadow-lg flex flex-col h-[100dvh] sm:h-[85vh]">
        
        {/* Header */}
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
                  {channel?.state?.members?.[targetUserId]?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-base sm:text-lg text-base-content">
                {channel?.state?.members?.[targetUserId]?.user?.name || `User ${targetUserId?.slice(-4)}`}
              </h2>
              <p className="text-xs sm:text-sm text-base-content/70">2 members, 2 online</p>
            </div>
          </div>

          {/* Right side: video call button */}
          <CallButton handleVideoCall={handleVideoCall} />
        </div>

        {/* Chat Content */}
        <div className="flex-1 min-h-0">
          <Chat client={chatClient} theme={streamTheme[theme] || "light"}>
            <Channel channel={channel}>
              <Window>
                <MessageList messageActions={["react", "reply"]} />

                {!isBlocked ? (
                  <div className="p-3 border-t border-base-300 bg-base-100 relative">
                    <MessageInput
                      focus
                      type="text"
                      grow
                      placeholder="Type a message..."
                      className="pr-24"
                    />

                    <div className="absolute flex items-center gap-2 z-20" style={{ right: 10, bottom: 6 }}>
                      {!isRecordingAudio ? (
                        <button
                          className="btn btn-ghost btn-sm p-2 rounded-full"
                          onClick={startRecordingAudio}
                          title="Send voice message"
                        >
                          <Mic className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          className="btn btn-error btn-sm p-2 rounded-full"
                          onClick={stopRecordingAudio}
                          title="Stop recording"
                        >
                          <Square className="h-5 w-5" />
                        </button>
                      )}

                      <button
                        className="btn btn-ghost btn-sm p-2 rounded-full"
                        onClick={startVideoRecording}
                        title="Record video (not implemented)"
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
  );
};

export default ChatPage;
