import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
import { useMessageStore } from "../store/useMessageStore";
import { getLanguageFlag } from "../utils/languageUtils.jsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blockUser, unblockUser, unfriend, getBlockedUsers } from "../lib/api";
import { useEffect, useState } from "react";

const FriendCard = ({friend}) => {
  const { notifications } = useMessageStore();
  const queryClient = useQueryClient();
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const blocked = await getBlockedUsers();
        if (mounted) {
          setIsBlocked(Boolean(blocked?.some?.((u) => u._id === friend._id)));
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, [friend._id]);

  const { mutate: unfriendMut, isPending: unfriending } = useMutation({
    mutationFn: () => unfriend(friend._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    }
  });

  const { mutate: blockMut, isPending: blocking } = useMutation({
    mutationFn: () => blockUser(friend._id),
    onSuccess: () => {
      setIsBlocked(true);
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    }
  });

  const { mutate: unblockMut, isPending: unblocking } = useMutation({
    mutationFn: () => unblockUser(friend._id),
    onSuccess: () => {
      setIsBlocked(false);
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    }
  });
  
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

            <div className="grid grid-cols-3 gap-2">
              <Link to= {`/chat/${friend._id}`} className="btn btn-outline btn-sm col-span-2" >
                Message
              </Link>
              <button className="btn btn-outline btn-error btn-sm" disabled={unfriending} onClick={() => unfriendMut()}>
                Unfriend
              </button>
              {!isBlocked ? (
                <button className="btn btn-outline btn-warning btn-sm col-span-3" disabled={blocking} onClick={() => blockMut()}>
                  Block
                </button>
              ) : (
                <button className="btn btn-outline btn-success btn-sm col-span-3" disabled={unblocking} onClick={() => unblockMut()}>
                  Unblock
                </button>
              )}
            </div>
        </div>
    </div>
  )
};

export default FriendCard;