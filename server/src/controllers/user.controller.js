
import { response } from "express";
import User from "../models/User.js";
import FriendRequest from "../models/FriendsRequests.js";


export async function getRecommendedUsers(req, res) {

    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } },
                { $if: { $nin: currentUser.friends } },
                { isOnboarded: true }
            ]
        })
        res.status(200).json(recommendedUsers)
    }
    catch (err) {
        console.error(`Error in getRecommendedUsers controllers`, error.message)
        res.status(500).json({ message: 'Internal server Error' })
    }

}

export async function getMyFriends(req, tes) {
    try {
        const user = await User.findById(req.user.id).select('friends').populate('friends', 'fullName profilePic  nativeLanguage learningLanguage')
        res.status(200).json(user.friends)
    }
    catch (err) {
        console.log(`Error in getMyFriends controllers`, error.message)
        res.status(500).json({ message: 'Internal server Error' })

    }
}

export async function sendFriendRequest(req, res) {
    try {
        const myId = req.user.id;
        const { id: recipientId } = req.params

        if (myId === recipientId) {
            return res.status(400).json({
                message: "You can't friends request to yourself"
            })
        }

        const recipient = await User.findById(recipientId)
        if (!recipient) {
            return res.status(404).json(
                {
                    message: "Recipient not found"
                }
            )
        }
        if (recipient.friends.includes(myId)) {
            return res.status(400).json({
                message: "You are already friends with this user"
            })
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
                {
                    sender: myId, recipient: recipient
                },
                {
                    sender: recipient, recipient: myId
                }
            ]

        })

        if (existingRequest) {
            return res.status(400)
                .json({ message: "A friend request already exists between you and this user" })
        }

        const friendRequest = await friendRequest.create({
            sender: myId,
            recipient: recipientId
        })

        res.status(201).json(friendRequest)
    }

    catch (err) {
        console.log(`Error in sendFriendRequest controllers`, error.message)
        res.status(500).json({ message: 'Internal server Error' })

    }
}


export async function acceptFriendRequest(req, res) {


    try {
        const { id: requestId } = req.params
        const friendRequest = await FriendRequest.findById(requestId)
        if (!friendRequest) {
            return res.status(404).json({
                message: "friend request not found"
            })
        }

        if (friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not authorized to accept this request"
            })
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: {
                friends: friendRequest.recipient
            }
        })

        await User.findByIdAndUpdate(friendRequest.recipient,{
            $addToSet:{
                friends:friendRequest.sender
            }
        })


    }
    catch (err) {
         console.log(`Error in acceptFriendRequest controllers`, error.message)
        res.status(500).json({ message: 'Internal server Error' })
    }
}