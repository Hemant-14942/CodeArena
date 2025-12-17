import mongoose,  {Schema, Document} from 'mongoose';
import { trim } from 'zod';
export interface IProblem extends Document {
    title: string;
    slug: string;// URL-friendly ID (e.g., "two-sum")
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    order: number; // Order within the category
    starterCode: {
        javaScript: string;
        python: string;
        java?: string;
        cpp: string;
    }
    // The logic validation (Hidden from frontend, used by Judge)
    testcases:{
        input: any;
        output: any;
    }[];
    // Frontend examples (Shown in problem description)
    examples:{
        input: string;
        output: string;
        explanation?: string;
    }[];
    constraints:string[];
    // Social proof
    likes: number;
    dislikes: number;
    
    createdAt: Date;
    updatedAt: Date;

}

const problemSchema: Schema = new Schema({
    title: {
        type: String,
        required: [true," Title is required"],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'Easy', 'Medium', 'Hard'],
        required: true
    },
    category: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        unique: true,
    },
    // Structured object for multi-language support
    starterCode: {
        javaScript: { type: String, default: "" },
        python: { type: String, default: "" },
        cpp: { type: String, default: "" },
        java: { type: String, default: "" }
        },
    testcases: [
        {
        input: { type: Schema.Types.Mixed, required: true },
        output: { type: Schema.Types.Mixed, required: true }
        }
    ],
    examples: [
        {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String }
        }
    ],
    constraints: [
        { type: String }
    ],
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    }
},
{
    timestamps: true
});

const Problem = mongoose.model<IProblem>('Problem', problemSchema);
export default Problem;