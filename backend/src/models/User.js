import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email:{
        type:String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    bio:{
        type:String,
        default: "",
    },
    profilePic: {
        type:String,
        default:"",
    },
    nativeLanguage: {
        type: String,
        default: "",
    },
    learningLanguage:{
        type:String,
        default: "",
    },
    location:{
        type:String,
        default: "",
    },
    isOnboarded: {
        type: Boolean,
        default: false,
    },
    // Password reset fields
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },

    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    // Users that this user has blocked
    blockedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ]

},{timestamps:true});

//createdAt, updatedAt

//Pre hook (pree hook needs brief introduction before informing it to interviewer)
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    try {
       const salt = await bcrypt.genSalt(10);
       this.password = await bcrypt.hash(this.password, salt);

       next();

    } catch (error) {
      next(error)  
    }
});

userSchema.methods.matchPassword = async function(eneteredPassword){
    const isPasswordCorrect = await bcrypt.compare(eneteredPassword,this.password);
    return isPasswordCorrect;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;
