import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers(req, res) {
    try {
      const currentUserId= req.user.id;
      const currentUser = req.user

      const recommendedUsers = await User.find({
        $and: [
            {_id: {$ne: currentUserId}}, //excluding logged in user from getting into recommendations list
            {$id: {$nin: currentUser.friends}}, //excluding the current users friend list which are already friend
            {isOnboarded: true}
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

        //checking if a request is already made or not.
        const existingRequest = await FriendRequest.findOne({
            $or: [
                {sender:myId, recipient:recipientId},
                {sender: recipientId, recipient:myId}
            ],
        });
        if(existingRequest){
            return res
            .status(400)
            .json({message: "A Friend request already exists between you and this user"});
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

        friendRequest.status=  "accepted";
        await friendRequest.save();

        //adding each user to the other's friends array in database.
        await User.findByIdAndUpdate(friendRequest.sender,{
            $addToSet: {friends: friendRequest.recipient},
        });

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: {friends: friendRequest.sender},
        });

    } catch (error) {
        
    }
}