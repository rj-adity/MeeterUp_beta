import { Link, useLocation, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { 
  PandaIcon, 
  LayoutDashboard, 
  Users, 
  Bell, 
  UserPlus 
} from "lucide-react"; 
import { useMessageStore } from "../store/useMessageStore";
import { useQuery } from "@tanstack/react-query";
import { getUserConversations } from "../lib/api";
import { useState } from "react";
import CreateGroupModal from "../components/CreateGroupModal";

const Sidebar = () => {
  const { authUser, isLoading: isLoadingAuthUser } = useAuthUser();
  const { totalUnread } = useMessageStore();
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ["conversations", authUser?._id],
    queryFn: () => getUserConversations(authUser._id),
    enabled: !!authUser && !isLoadingAuthUser,
  });

  return (
    <>
      <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
        {/* Logo/Header */}
        <div className="p-5 border-b border-base-300">
          <Link to="/" className="flex items-center gap-2.5">
            <PandaIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              MeeterUp
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <ul className="menu bg-base-200 w-56 rounded-box">
            <li>
              <Link to="/">
                <LayoutDashboard className="size-4" /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/friends">
                <Users className="size-4" /> Friends
              </Link>
            </li>
            <li>
              <Link to="/notification">
                <Bell className="size-4" /> Notifications
                {totalUnread > 0 && (
                  <span className="badge badge-error ml-2">{totalUnread}</span>
                )}
              </Link>
            </li>
            <li>
              <button
                onClick={() => setIsGroupModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-base-300 rounded-lg"
              >
                <UserPlus className="size-4" /> Create Group
              </button>
            </li>
          </ul>

          {/* Conversations List */}
          <div className="border-t border-base-300 mt-4 pt-4">
            <h4 className="px-4 text-sm font-semibold mb-2">Chats</h4>
            {isLoadingAuthUser || isLoadingConversations ? (
              <div className="flex justify-center">
                <span className="loading loading-spinner loading-sm" />
              </div>
            ) : (
              <ul className="space-y-1">
                {Array.isArray(conversations) &&
                  conversations.map((conversation) => (
                    <li key={conversation.id}>
                      <Link
                        to={`/chat/${conversation.type}/${conversation.id}`}
                        className={`btn btn-ghost w-full justify-start ${
                          currentPath ===
                          `/chat/${conversation.type}/${conversation.id}`
                            ? "btn-active"
                            : ""
                        }`}
                      >
                        {conversation.isGroup
                          ? conversation.name
                          : conversation.otherParticipant?.fullName ||
                            "Direct Message"}
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-base-300 mt-auto">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{authUser?.fullName}</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="size-2 rounded-full bg-success inline-block" />
                Online
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Group Modal */}
      {isGroupModalOpen && (
        <CreateGroupModal onClose={() => setIsGroupModalOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;
