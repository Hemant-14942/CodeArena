import mongoose from 'mongoose';
 const connectDB = async (): Promise<void> => {
    try{     
        let connectstr = process.env.MONGO_URI;
        if(!connectstr){
            throw new Error('MONGO_URI is not defined');
        }
        const conn = await mongoose.connect(connectstr);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch(error){
        // 4. In TS, 'error' is of type 'unknown' by default.
        // We cast it to 'Error' to safely access .message
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
        } else {
            console.error(`Unknown Error: ${error}`);
        }
        // Stop the program because something went wrong.
        process.exit(1);
    }
 }

 export default connectDB