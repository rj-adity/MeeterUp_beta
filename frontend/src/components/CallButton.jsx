import { VideoIcon } from "lucide-react";

function CallButton({
    handleVideoCall
}) {
    return (
        <button 
            onClick={handleVideoCall} 
            className="btn btn-success btn-sm text-white flex items-center justify-center"
        >
            <VideoIcon className="size-4" />
        </button>
    );
}

export default CallButton;