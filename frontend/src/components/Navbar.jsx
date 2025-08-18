import { Link, useLocation } from "react-router"
import useAuthUser from "../hooks/useAuthUser"
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { logout } from "../lib/api";
import { BellIcon, LogOutIcon, PandaIcon } from "lucide-react";
import { useMessageStore } from "../store/useMessageStore";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import MobileNav from "./MobileNav";

const Navbar = () => {
    const {authUser } = useAuthUser();
    const location = useLocation();
    const isChatPage = location.pathname?.startsWith("/chat");

    const{logoutMutation} =  useLogout();
  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center" >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`flex items-center w-full ${isChatPage ? 'justify-between' : 'justify-end'}`} >
                {/* LOGO */}
                {isChatPage && (
                    <div className="flex items-center gap-2.5">
                        <Link to="/" className="flex items-center gap-2.5">
                        <PandaIcon className="size-9 text-primary" />
                        <span className="text-2xl sm:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider" >
                         MeeterUp
                        </span>
                        </Link>
                    </div>
                )}

                {/* Mobile Navigation */}
                <div className="lg:hidden">
                    <MobileNav />
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-3 sm:gap-4 ml-auto">
                    {/* Unread badge over bell */}
                    <UnreadBell />
                    <Link to ={"/notification"} >
                        <button className="btn btn-ghost btn-circle" >
                            <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                        </button>
                    </Link>
                    
                    <ThemeSelector  />

                    {/*  USER AVATAR */}
                    <div className="avatar" >
                        <div className="w-9 rounded-full" >
                            <img src={authUser?.profilePic} alt="User Avatar" rel= "noreferrer" />
                        </div>
                    </div>

                    {/* LOGOUT BUTTON */}
                    <button className="btn btn-ghost btn-circle" onClick={logoutMutation} >
                        <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
                    </button>
                </div>
            </div>
        </div>
    </nav>
  )
}

export default Navbar

const UnreadBell = () => {
    const { totalUnread } = useMessageStore();
    if (!totalUnread) return null;
    return (
        <span className="indicator-item badge badge-primary badge-sm translate-x-4 -translate-y-2 select-none">
            {totalUnread}
        </span>
    );
}