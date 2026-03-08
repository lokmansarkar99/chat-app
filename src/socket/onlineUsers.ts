//

const onlineUsers = new Map<string, string>();


export const addUser = (userId: string, socketId: string): void => {
  onlineUsers.set(userId, socketId);
  console.log(
    `✅ [onlineUsers] User added → userId: ${userId} | socketId: ${socketId} | Total online: ${onlineUsers.size}`
  );
};


export const removeUser = (userId: string): void => {
  onlineUsers.delete(userId);
  console.log(
    `❌ [onlineUsers] User removed → userId: ${userId} | Total online: ${onlineUsers.size}`
  );
};


export const getSocketId = (userId: string): string | undefined => {
  return onlineUsers.get(userId);
};


export const isOnline = (userId: string): boolean => {
  return onlineUsers.has(userId);
};


export const getAllOnlineUserIds = (): string[] => {
  return Array.from(onlineUsers.keys());
};


export const getOnlineCount = (): number => {
  return onlineUsers.size;
};
