import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";
import FriendRequest from "../models/FriendRequest.js";
import streamClient from "../lib/stream.js"; // Assuming streamClient is exported
import Conversation from "../models/Conversation.js"; // Assuming Conversation model exists

export async function getRecommendedUsers(req, res) {
    try {
      const currentUserId= req.user.id;
      const currentUser = req.user

      const recommendedUsers = await User.find({
        $and: [
            {_id: {$ne: currentUserId}}, //excluding logged in user from getting into recommendations list
            {_id: {$nin: currentUser.friends}}, //excluding the current users friend list which are already friend
            {isOnboarded: true},
            // exclude users I have blocked
            {_id: { $nin: currentUser.blockedUsers || [] }},
            // exclude users who have blocked me
            { blockedUsers: { $ne: currentUserId } },
        ]
      })
      res.status(200).json(recommendedUsers)
    } catch (error) {
        console.error("Error is getRecommendedUsers controller", error.message);

        res.status(500).json({message: "Internal Server Error"});
    }
}

export async function getMyFriends(req,res) {
    try {
        const user = await User.findById(req.user.id)
        .select("friends")
        .populate("friends","fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(user.friends);

    } catch (error) {
        console.error("Error in getMyFriends controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}


export async function sendFriendRequest(req, res){
    try {
        const myId = req.user.id;
        const {id: recipientId}=  req.params;

        // prevent sending request to the logged in account
        if(myId === recipientId){
            return res.status(400).json({message: "You can't send friend request to yurself "});
        }

        const recipient = await User.findById(recipientId)
        if(!recipient){
            return res.status(404).json({message: "Recipient not found in database"});
        }

        // checking whther the user is already friend.
        if(recipient.friends.includes(myId)){
            return res.status(400).json({message: "You are already friends with this user"});
        }

        // block checks
        const iBlockedRecipient = (req.user.blockedUsers || []).some((u) => u.toString() === recipientId);
        const recipientBlockedMe = (recipient.blockedUsers || []).some((u) => u.toString() === myId);
        if (iBlockedRecipient || recipientBlockedMe) {
            return res.status(403).json({ message: "Cannot send friend request due to blocking" });
        }

        //checking if a PENDING request is already made or not.
        const existingRequest = await FriendRequest.findOne({
            status: "pending",
            $or: [
                {sender:myId, recipient:recipientId},
                {sender: recipientId, recipient:myId}
            ],
        });
        if(existingRequest){
            return res
            .status(400)
            .json({message: "A pending friend request already exists between you and this user"});
        }

        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId,
        });

        res.status(200).json(friendRequest)

    } catch (error) {
        console.error("Error in sendFriendRequest controller ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const{id: requestId}= req.params
        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest){
            return res.status(404).json({message: "Friend request not "});
        }

        // verifying the current user is in the recipient in the database.
        if(friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({message: "You are not authorized to accept this request"});
        }

        // Ensure neither side has blocked the other
        const [senderUser, recipientUser] = await Promise.all([
            User.findById(friendRequest.sender).select("blockedUsers"),
            User.findById(friendRequest.recipient).select("blockedUsers"),
        ]);
        const blockedEitherWay = (senderUser.blockedUsers || []).some((u) => u.toString() === friendRequest.recipient.toString())
           || (recipientUser.blockedUsers || []).some((u) => u.toString() === friendRequest.sender.toString());
        if (blockedEitherWay) {
            return res.status(403).json({ message: "Cannot accept request due to blocking" });
        }

        friendRequest.status=  "accepted";
        await friendRequest.save();

        //adding each user to the other's friends array in database.
        // $addToSet: adds element
        await User.findByIdAndUpdate(friendRequest.sender,{
            $addToSet: {friends: friendRequest.recipient},
        });

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: {friends: friendRequest.sender},
        });

        res.status(200).json({message: "Friend request accepted"});

    } catch (error) {
        console.log("Error in acceptFriendRequest controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
        
    }
}

// Return my blocked users list
export async function getBlockedUsers(req, res) {
    try {
        const user = await User.findById(req.user.id)
            .select("blockedUsers")
            .populate("blockedUsers", "fullName profilePic");
        return res.status(200).json(user.blockedUsers || []);
    } catch (error) {
        console.error("Error in getBlockedUsers controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getUserConversations(req, res) {
    try {
        const userId = req.user.id;
        const streamUserId = userId; // Stream User ID is the same as MongoDB User ID

        // 1. Fetch group conversations from MongoDB
        const groupConversations = await Conversation.find({
            members: userId,
            isGroup: true,
        }).populate("members", "fullName profilePic"); // Populate members to get user details

        // Format MongoDB group conversations
        const formattedGroupConversations = groupConversations.map(convo => ({
            id: convo._id.toString(),
            type: 'group',
            name: convo.name,
            image: convo.groupImage,
            members: convo.members.map(member => ({
                userId: member._id.toString(),
                fullName: member.fullName,
                profilePic: member.profilePic
            })),
            // Add other necessary group conversation properties
        }));

        // 2. Fetch one-on-one channels from Stream
        const streamChannels = await streamClient.queryChannels({
            type: 'messaging',
            members: { $in: [streamUserId] },
        }, {}, {
            watch: false, // Don't watch channels here
            state: true, // Include state to get members and last message
        });

        // Combine and format the results (basic combination, you might need more sophisticated logic)
        const allConversations = [
            ...formattedGroupConversations,
            // Add formatted Stream one-on-one channels here
            // You'll need to map streamChannels to a similar format as formattedGroupConversations
        ];
        res.status(200).json({
 conversations: allConversations
 });
    } catch (error) {
        console.error("Error in getUserConversations controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getFriendRequests(req, res) {
    try {
        const incomingReqs = await FriendRequest.find({
            recipient: req.user.id,
            status: "pending",
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

        const acceptedReqs= await FriendRequest.find({
            sender: req.user.id,
            status: "accepted",
        }).populate("recipient", "fullName profilePic");

        res.status(200).json({incomingReqs, acceptedReqs});
    } catch (error) {
        console.log("Error in getPendingFriendRequests controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export async function getOutgoingFriendReqs(req, res) {
    try {
        const outgoingReqs = await FriendRequest.find({
            sender: req.user.id,
            status: "pending",
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(outgoingReqs);
    } catch (error) {
        console.log("Error in getOutgoingFriendReqs controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

// Cancel a pending friend request by request id (only sender can cancel)
export async function cancelFriendRequest(req, res) {
    try {
        const { id: requestId } = req.params;
        const request = await FriendRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Friend request not found" });
        }
        if (request.sender.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to cancel this request" });
        }
        if (request.status !== "pending") {
            return res.status(400).json({ message: "Only pending requests can be cancelled" });
        }
        await FriendRequest.findByIdAndDelete(requestId);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error in cancelFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Remove a friend relationship for both users
export async function unfriend(req, res) {
    try {
        const myId = req.user.id;
        const { id: friendId } = req.params;

        if (myId === friendId) {
            return res.status(400).json({ message: "You cannot unfriend yourself" });
        }

        const [me, friend] = await Promise.all([
            User.findByIdAndUpdate(myId, { $pull: { friends: friendId } }, { new: true }).select("_id friends"),
            User.findByIdAndUpdate(friendId, { $pull: { friends: myId } }, { new: true }).select("_id friends"),
        ]);

        if (!friend) {
            return res.status(404).json({ message: "Friend not found" });
        }

        // Remove any friend request records between the two users (pending or accepted)
        await FriendRequest.deleteMany({
            $or: [
                { sender: myId, recipient: friendId },
                { sender: friendId, recipient: myId },
            ],
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error in unfriend controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Block a user: add to my block list and also remove from friends if present
export async function blockUser(req, res) {
    try {
        const myId = req.user.id;
        const { id: targetId } = req.params;

        if (myId === targetId) {
            return res.status(400).json({ message: "You cannot block yourself" });
        }

        const target = await User.findById(targetId).select("_id");
        if (!target) {
            return res.status(404).json({ message: "User not found" });
        }

        // Add to blockedUsers and ensure not in friends
        await Promise.all([
            User.findByIdAndUpdate(myId, {
                $addToSet: { blockedUsers: targetId },
                $pull: { friends: targetId },
            }),
            User.findByIdAndUpdate(targetId, {
                $pull: { friends: myId },
            }),
        ]);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error in blockUser controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Unblock a user
export async function unblockUser(req, res) {
    try {
        const myId = req.user.id;
        const { id: targetId } = req.params;

        await User.findByIdAndUpdate(myId, { $pull: { blockedUsers: targetId } });
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error in unblockUser controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function updateProfile(req, res) {
    try {
        const userId = req.user.id;
        const {
            fullName,
            bio,
            nativeLanguage,
            learningLanguage,
            location,
            profilePic,
        } = req.body;

        const updateDoc = {};
        if (typeof fullName === "string") updateDoc.fullName = fullName;
        if (typeof bio === "string") updateDoc.bio = bio;
        if (typeof nativeLanguage === "string") updateDoc.nativeLanguage = nativeLanguage;
        if (typeof learningLanguage === "string") updateDoc.learningLanguage = learningLanguage;
        if (typeof location === "string") updateDoc.location = location;
        if (typeof profilePic === "string") updateDoc.profilePic = profilePic;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateDoc,
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Sync Stream user profile so chat reflects latest name/image
        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
            });
        } catch (streamError) {
            console.log("Stream upsert failed in updateProfile:", streamError?.message || streamError);
        }

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.log("Error in updateProfile controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}