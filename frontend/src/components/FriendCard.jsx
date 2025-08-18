import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
import { useMessageStore } from "../store/useMessageStore";
import { getLanguageFlag } from "../utils/languageUtils.jsx";

const FriendCard = ({friend}) => {
  const { notifications } = useMessageStore();
  
  // Count notifications for this specific friend
  const friendNotifications = notifications.filter(
    notification => notification.senderId === friend._id
  );
  const unreadCount = friendNotifications.length;

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow relative" >
        <div className="card-body p-4" >
            {/* USER INFO */}
            <div className="flex items-center gap-3 mb-3" >
                <div className="avatar relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img src={friend.profilePic} alt={friend.fullName} />
                    </div>
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 badge badge-primary badge-sm min-w-[20px] h-5">
                        {unreadCount}
                      </div>
                    )}
                </div>
                <h3 className="font-semibold truncate" >{friend.fullName}</h3>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-1.5 mb-3" >
                <span className="badge badge-secondary text-xs">
                    {getLanguageFlag(friend.nativeLanguage)}
                    Learning: {friend.nativeLanguage}
                </span>
                <span className="badge badge-outline text-xs" >
                    {getLanguageFlag(friend.learningLanguage)}
                    Learning: {friend.learningLanguage}
                </span>
            </div>

            <Link to= {`/chat/${friend._id}`} className="btn btn-outline w-full" >
            Message
            </Link>
        </div>
    </div>
  )
};

export default FriendCard;