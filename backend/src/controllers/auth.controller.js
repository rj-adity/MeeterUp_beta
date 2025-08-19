import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js"
import jwt from "jsonwebtoken"
import crypto from "crypto"

export async function signup(req,res){
    const {email,password,fullName} = req.body;

    try {
        if(!email || !password  || !fullName){
            return res.status(400).json({message:"All fields are required to proceed"});
        }

        if(password.length < 6){
            return res.status(400).json({
                message: "Password must be atleast 6 characters"
            });
        }

        const emailRegex =/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message: "Invalid email format"});
        }
         const existingUser = await User.findOne({email});
         if(existingUser){
            return res.status(400).json({message: "Email already exists, please use a diffrent one"});
        }

        const idx= Math.floor(Math.random() * 100)+1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png `

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic : randomAvatar,
        })

        try {
            
        await upsertStreamUser({
            id: newUser._id.toString(),
            name: newUser.fullName,
        });
        console.log(`Stream user created for ${newUser.fullName}`);
        } catch (error) {
           console.log("Error in creating stream users: ", error) 
        }


        const token = jwt.sign({userId:newUser._id},process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        })

        res.cookie("jwt",token,{
            maxAge: 7*24 *60 * 60* 1000,
            httpOnly: true, // prevent XSS sattack
            sameSite : "strict", //prevent from CSRF attacks
            secure: process.env.NODE_ENV=== "production", 
        })

        res.status(201).json({success:true, user:newUser})
        
    } catch (error) {
       console.log("Error in signup controller", error);
       res.status(500).json({message: "Internal Srver Error"}); 
    }
}

export async function login(req,res){
   try {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message: "Email and password are required"});
    }
    
    const user = await User.findOne({email});
    if(!user) return res.status(401).json({message: "Invalid email or password"});

    const isPasswordCorrect = await user.matchPassword(password);

    if(!isPasswordCorrect) return res.status(401).json({message: "Invalid email or password"});

     const token = jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        })

        res.cookie("jwt",token,{
            maxAge: 7*24 *60 * 60* 1000,
            httpOnly: true, // prevent XSS sattack
            sameSite : "strict", //prevent from CSRF attacks
            secure: process.env.NODE_ENV=== "production", 
        })

        res.status(200).json({success:true, user})
   } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({message: "Internal Srver Error"}); 
    
   }
}

export function logout(req,res){
    res.clearCookie("jwt");
    res.status(200).json({success:true, message: "Sucessfully logged out"});
}

// Forgot password function
export async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // Save hashed token to user
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // In a real app, you would send this token via email
        // For now, we'll return it in the response (remove this in production)
        res.status(200).json({ 
            success: true, 
            message: "Password reset token generated successfully",
            resetToken: resetToken, // Remove this in production
            expiresIn: "10 minutes"
        });

    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Reset password function
export async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Hash the token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        // Update password and clear reset token
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: "Password reset successfully" 
        });

    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function onboard(req, res) {
    try {
       const userId = req.user._id 

       const{fullName, bio, nativeLanguage, location,} = req.body

       if(!fullName || !bio || !nativeLanguage || !location){
        return res.status(400).json({
            message: "All fields are required",
            missingFields: [
                !fullName && "fullName",
                !bio && "bio",
                !nativeLanguage && "nativeLanguage",
                !location && "location",
            ].filter(Boolean),
        });
       }

      const updatedUser = await User.findByIdAndUpdate(userId,{
        ...req.body,
        isOnboarded: true,
       }, {new: true})

       if(!updatedUser) return res.status(400).json({message: "User not found"});

     try {
          await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",  
      })
      console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
     } catch (StreamError) {
        console.log("Error updating Stream user during onboarding: ", StreamError.message);
     }

        res.status(200).json({success: true, user: updatedUser}); 
    } catch (error) {
        console.error("Onboarding error: ", error);
        res.status(500).json({message: "Internal Server Error"});
    }
}