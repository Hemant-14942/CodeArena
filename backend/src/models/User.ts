import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. UPDATED INTERFACE
export interface IUser extends Document {
    // Identity
    username: string;
    email: string;
    password: string;
    isAdmin: boolean;
    
    // Profile (Social)
    avatar?: string; // URL to image (e.g., Cloudinary, ImageKit)
    bio?: string;
    links?: {
        github?: string;
        linkedin?: string;
        website?: string;
    };

    // Progression (The "LeetCode" Logic)
    solvedProblems: mongoose.Types.ObjectId[]; // Keep this for fast lookups (O(1) checks)
    
    // We separate logic by difficulty for the "Stats Circle"
    stats: {
        easySolved: number;
        mediumSolved: number;
        hardSolved: number;
        totalSolved: number;
    };

    // Activity Graph (The Heatmap)
    // We store dates here to render the green squares on profile
    submissionHistory: {
        date: Date;
        count: number;
    }[];

    // Gamification
    streak: {
        current: number;    // e.g., 5 days
        max: number;        // e.g., 12 days
        lastActiveDate: Date;
    };

    // Bookmarks (Watchlist)
    savedProblems: mongoose.Types.ObjectId[];

    createdAt: Date;
}

const userSchema: Schema = new Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isAdmin: { type: Boolean, default: false },

        // Optional Profile Fields
        avatar: { 
            type: String, 
            default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" 
        },
        bio: { type: String, maxlength: 200 },
        links: {
            github: String,
            linkedin: String,
            website: String
        },

        // Fast Lookup for "Has user solved this?"
        solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],

        // Performance Optimization: 
        // Instead of calculating these every time page loads, we update them on submission.
        stats: {
            easySolved: { type: Number, default: 0 },
            mediumSolved: { type: Number, default: 0 },
            hardSolved: { type: Number, default: 0 },
            totalSolved: { type: Number, default: 0 }
        },

        // Activity Log (Simplified for Heatmap)
        submissionHistory: [
            {
                date: { type: Date },
                count: { type: Number, default: 1 }
            }
        ],

        streak: {
            current: { type: Number, default: 0 },
            max: { type: Number, default: 0 },
            lastActiveDate: { type: Date, default: Date.now }
        },

        savedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }]
    },
    { timestamps: true }
);

// ... (Keep your existing Pre-save Hash Middleware here) ...
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;