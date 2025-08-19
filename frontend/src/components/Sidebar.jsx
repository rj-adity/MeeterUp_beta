import { Link, useLocation } from "react-router"
import useAuthUser from "../hooks/useAuthUser";
import {BellIcon, HousePlus, PandaIcon, ShieldUser, Settings } from "lucide-react";
import { useMessageStore } from "../store/useMessageStore";


const Sidebar = () => {
    const {authUser} = useAuthUser();
    const { totalUnread } = useMessageStore();
    const location = useLocation();
    const currentPath = location.pathname;

    console.log(currentPath);
  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0" >
        <div className="p-5 border-b border-base-300">
            <Link to="/" className="flex items-center gap-2.5">
            <PandaIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking tracking-wider" >
                MeeterUp
            </span>
            </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1" >
            <Link 
            to="/"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                currentPath === "/" ? "btn-active" : ""
            }`}
            >
            <HousePlus className="size-5 text-base-content opacity-70" />
            <span>Home</span>
            </Link>

            <Link 
            to="/friends"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                currentPath === "/friends" ? "btn-active" : ""
            }`}
            >
            <ShieldUser className="size-5 text-base-content opacity-70" />
            <span>Friends</span>
            </Link>

            <Link 
            to="/notification"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                currentPath === "/notification" ? "btn-active" : ""
            }`}
            >
            <div className="relative">
              <BellIcon className="size-5 text-base-content opacity-70" />
              {totalUnread > 0 && (
                <span className="badge badge-primary badge-xs absolute -top-2 -right-3">
                  {totalUnread}
                </span>
              )}
            </div>
            <span>Notifications</span>
            </Link>   

            <Link 
            to="/settings"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                currentPath === "/settings" ? "btn-active" : ""
            }`}
            >
            <Settings className="size-5 text-base-content opacity-70" />
            <span>Settings</span>
            </Link>
        </nav>
        
        {/* Create Group Button */}
        <div className="p-4">
            <Link
                to="/create-group" // Or handle this with a modal
                className="btn btn-primary w-full normal-case"
            >Create Group
            </Link>
        </div>

        {/* USER PROFILE SECTION */}
        <div className="p-4 border-t border-base-300 mt-auto" >  
            <div className="flex items-center gap-3">
               <div className="avatar">
                <div className="w-10 rounded-full">
                    <img src={authUser?.profilePic} alt="User Avatar"/>
                </div>
               </div>
               <div className="flex-1" >
                <p className="font-semibold text-sm" >{authUser?.fullName}</p>
                <p className="text-xs text-sucess flex items-center gap-1" >
                    <span className="size-2 rounded-full bg-success inline-block" />
                    Online
                </p>
               </div>
            </div>
        </div>
    </aside>
  )
}

export default Sidebar