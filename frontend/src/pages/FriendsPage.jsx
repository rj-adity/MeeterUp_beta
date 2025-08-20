import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import CreateGroupModal from "../components/CreateGroupModal";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Assuming you have an API function for creating groups
// import { createGroup } from "../lib/api"; 

const FriendsPage = () => {
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreateGroup = async ({ groupName, members }) => {
    try {
      // Use your actual API call function here, e.g., createGroup(groupName, members)
      // For now, keeping the fetch as a placeholder, but ideally use a dedicated API function
      const response = await fetch('/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName, members }),
      });

      if (!response.ok) throw new Error("Failed to create group");
      const data = await response.json();

      navigate(`/chat/messaging/${data._id}`); // Assuming 'messaging' is the channel type and _id is the channel ID from your backend
    } catch (error) {
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        {/* Pass state and handler to the modal */}
        <CreateGroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreateGroup={handleCreateGroup} />

        {/* Button to open the modal (You might want to move this to Sidebar or Navbar) */}
      </div>
    </div>
  );
};

export default FriendsPage;


