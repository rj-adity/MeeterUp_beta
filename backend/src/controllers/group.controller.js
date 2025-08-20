import Conversation from '../models/Conversation.js'; // Assuming you have a Conversation model
import { streamClient } from '../lib/stream.js'; // Assuming Stream client is initialized here

export const createGroup = async (req, res) => {
  try {
    const { groupName, members } = req.body;

    if (!groupName || !members || !Array.isArray(members) || members.length < 2) {
      return res.status(400).json({ error: 'Invalid group data provided' });
    }

    const newGroupConversation = new Conversation({
      name: groupName,
      members: members, // members should be an array of user IDs
      isGroup: true, // Assuming a flag to differentiate group chats
    });

    // Save the group conversation to MongoDB first
    await newGroupConversation.save();

    // Create a corresponding channel in Stream
    // Stream user IDs should match your MongoDB user IDs (as strings) for consistency
    const streamMembers = members.map(memberId => memberId.toString()); // Ensure member IDs are strings for Stream
    const channelId = newGroupConversation._id.toString(); // Use MongoDB _id as Stream channel ID

    const channel = streamClient.channel('messaging', channelId, {
      name: groupName,
      members: streamMembers,
      created_by_id: req.user._id.toString(), // Assuming authenticated user's ID
    });

    await channel.create();

    // Return the new group conversation details including the channel ID
    res.status(201).json({ ...newGroupConversation.toObject(), streamChannelId: channelId });
  } catch (error) {
    console.error('Error creating group:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};