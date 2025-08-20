import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserFriends } from '../lib/api'; // Assuming getUserFriends is in this location

const CreateGroupModal = ({ isOpen, onClose, onCreateGroup }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]); // Placeholder for selected friends
  const handleCreateGroup = () => {
    // TODO: Implement logic to handle selected friends
    onCreateGroup({ groupName, members: selectedFriends });
    setGroupName('');
    setSelectedFriends([]);
    onClose();
  };

  // Fetch friends
  const { data: friends, isLoading, isError } = useQuery({
    queryKey: ['friends'],
    queryFn: getUserFriends,
  });

  // Handle friend selection
  const handleFriendSelect = (friendId) => {
    setSelectedFriends((prevSelected) =>
      prevSelected.includes(friendId)
        ? prevSelected.filter((id) => id !== friendId)
        : [...prevSelected, friendId]
    );
  };
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
        <div className="mb-4">
          <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">Group Name</label>
          <input
            type="text"
            id="groupName"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Select Friends</label>
          <div className="mt-1 p-4 border rounded-md bg-gray-50 h-32 overflow-y-auto">
            {isLoading && <p>Loading friends...</p>}
            {isError && <p className="text-red-500">Error loading friends.</p>}
            {friends && friends.length === 0 && <p>No friends found.</p>}
            {friends && friends.length > 0 && (
              <ul>
                {friends.map((friend) => (
                  <li key={friend._id} className="flex items-center justify-between py-1">
                    <span>{friend.fullName}</span>
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend._id)}
                      onChange={() => handleFriendSelect(friend._id)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            className="mr-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleCreateGroup}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;