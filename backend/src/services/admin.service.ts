import User from "../models/user";
export const checkIfUserIsAdmin = async(userID: string): Promise<boolean>  => {
    // Implement your logic to check if the user is an admin
    const check = await User.findById(userID).select('isAdmin');
    if(check && check.isAdmin){
        return true;
    }
    return false;
}