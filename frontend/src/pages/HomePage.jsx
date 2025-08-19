import { useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getOutgoingFriendReqs, getRecommendedUsers, getUserFriends, sendFriendRequest, cancelFriendRequest } from "../lib/api";
import {Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, User, UserPlusIcon, UsersIcon} from "lucide-react";
import FriendCard from "../components/FriendCard";
import { getLanguageFlag } from "../utils/languageUtils.jsx";
import NoFriendsFound from "../components/NoFriendsFound";
import { useMessageStore } from "../store/useMessageStore";


const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set())
  const [outgoingRequestsMap, setOutgoingRequestsMap] = useState({})

  const {data: friends=[], isLoading: loadingFriends} = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  })

  const {data: recommendedUsers=[], isLoading: loadUsers} = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });


  const {data: outgoingFriendReqs} = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const {mutate: sendRequestMutation, isPending} = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({queryKey: ["outgoingFriendReqs"]}),
  })

  useEffect(() => {
    const outgoingIds = new Set();
    const map = {};
    if(outgoingFriendReqs && outgoingFriendReqs.length > 0 ) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id)
        map[req.recipient._id] = req._id;
      });
      setOutgoingRequestsIds(outgoingIds);
      setOutgoingRequestsMap(map);
    }
  },[outgoingFriendReqs])
  const { mutate: cancelRequestMutation, isPending: canceling } = useMutation({
    mutationFn: cancelFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });
  const { notifications } = useMessageStore();

  return (
    <div className="p-4 sm:p-6 lg:p-8" >
      <div className="container mx-auto space-y-10"  >
        {/* Notifications preview */}
        {notifications.length > 0 && (
          <div className="card bg-base-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Recent notifications</h3>
              <Link to="/notification" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            <ul className="space-y-2">
              {notifications.slice(0, 3).map((n) => (
                <li key={n.id} className="text-sm text-base-content/80 truncate">
                  <span className="font-medium">{n.senderName}:</span> {n.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" >Your Friends</h2>
          <Link to="/notification" className="btn btn-outline btn-sm" >
          <UsersIcon className="mr-2 size-4" />
          Friend Requests
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12" >
            <span className="loading loading-spinner loading-lg"  />
          </div>
        ): friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" >
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8" >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" >Meet New Friends</h2>
                <p className="opacity-70" >
                  Discover perfect story exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadUsers ? (
            <div className="flex justify-center py-12" >
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center" >
              <h3 className="font-semibold text-lg mb-2" >No recommendations avilable</h3>
              <p>
                Check back later for new story partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" >
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                return (
                  <div key={user._id}
                  className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  
                  >
                    <div className="card-body p-5 space-y-4" >
                      <div className="flex items-center gap-3" >
                        <div className="avatar size-16 rounded-full" >
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg" >{user.fullName}</h3>
                          {user.location  && (
                            <div className="flex items-center text-xs opacity-70 mt-1" >
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Languages with flags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitalize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline" >
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitalize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && <p className="text-sm opacity-70" >{user.bio}</p>}

                      {/* Action Button */}
                      {!hasRequestBeenSent ? (
                        <button
                          className="btn btn-primary w-full mt-2"
                          onClick={()=> sendRequestMutation(user._id)}
                          disabled={isPending}
                        >
                          <UserPlusIcon className="size-4 mr-2" />
                          Send Friend Request
                        </button>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="btn btn-ghost btn-disabled">
                            <CheckCircleIcon className="size-4 mr-2" />
                            Sent
                          </div>
                          <button
                            className="btn btn-outline"
                            onClick={() => cancelRequestMutation(outgoingRequestsMap[user._id])}
                            disabled={canceling}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) }
        </section>
      </div>
    </div>
  )
};

export default HomePage;

export const capitalize = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};
