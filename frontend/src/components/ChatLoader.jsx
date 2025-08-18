import { LoaderIcon } from "lucide-react";

function ChatLoader() {
    return (
        <div>
            <LoaderIcon className="animate-spin size-10 text-primary" />
            <p className="mt-4 text-center text-lg font-mono">Connecting to chat...</p>
        </div>
    );
}

export default ChatLoader;