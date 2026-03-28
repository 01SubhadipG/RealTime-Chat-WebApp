import { useEffect } from "react";
import { useChatStore } from "../Store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import Navbar from "../components/Navbar";

const HomePage = () => {
  const { 
    selectedUser, 
    selectedGroup, 
    getMessages, 
    getGroupMessages, 
    subscribeToMessages, 
    unsubscribeFromMessages 
  } = useChatStore();

  const isChatOpen = Boolean(selectedUser || selectedGroup);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    } else if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
    }
  }, [selectedUser, selectedGroup, getMessages, getGroupMessages]);

  useEffect(() => {
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  return (
    <div className="h-screen bg-base-200">
      <Navbar/>
      <div className="flex items-center justify-center pt-10 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <div className={`${isChatOpen ? "hidden" : "block"} mobile:block w-full mobile:w-auto h-full`}>
              <Sidebar />
            </div>
            <div className={`${isChatOpen ? "block" : "hidden"} mobile:block w-full h-full`}>
              {!isChatOpen ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;