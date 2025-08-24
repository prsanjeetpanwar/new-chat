import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function SignUp(req, res) {
    const { email, password, fullName } = req.body;

    try {

        if (!email || !password || !fullName) {
            return res.status(400).json({ message: "All fields are required" });
        }


        if (password.length < 6) {
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters" });
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: "Email already exists, please use a different one" });
        }


        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iron.liara.run/public/${idx}`;


        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic: randomAvatar,
        });

        try {

            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || ""
            })
            console.log(`stream user create for ${newUser._id}`)
        }
        catch (err) {

            console.error(`Error upserting stream user: ${err}`)

        }

        if (!process.env.JWT_SECRET_KEY) {
            throw new Error("JWT_SECRET_KEY is not defined in environment");
        }

        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );


        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });


        const { password: _, ...userData } = newUser._doc;

        res.status(201).json({
            success: true,
            user: userData,
        });
    } catch (err) {
        console.error("Error in signUp controller", err);
        res.status(500).json({
            message: "Internal server error",
        });
    }
}


export async function Login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const user = await User.findOne({
            email
        })

        if (!user) return res.status(401).json({
            message: "Invalid email or password"
        })

        const isPasswordCorrect = await user.matchPassword(password)
        if (!isPasswordCorrect) return res.status(401).json({
            message: "Invalid email orw  password"
        })

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );


        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        res.status(200).json({
            success: true,
            user
        })


    }
    catch (err) {
        console.log('Error in login controller', err.message)
        res.status(500).json({ message: "Internal server error" })

    }
}


export function Logout(req, res) {
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Logout successful" })
}


export async function onboard(req, res) {
    try {
        const userId = req.user._id

        const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

        if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({
                message: "All fields are required",

                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location"
                ].filter(Boolean)
            })
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarded: true

        },
            {
                new: true
            }

        )


        if (!updatedUser) return res.status(404).json({ message: "User not found" })


        try {

            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePic || ""
            });
            console.log(`stream user updated for ${updatedUser.fullName}`)
        }
        catch (streamError) {
            console.log(`Error updating Stream user during onboarding: ${streamError.message}`)

        }

        res.status(200).json({ success: true, user: updatedUser })
    }
    catch (err) {
        console.log(`Error in onboard controller: ${err}`)
        res.status(500).json({ message: "Internal server error" })
    }
}


