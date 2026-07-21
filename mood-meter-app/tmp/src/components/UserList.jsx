import React from 'react';
import { ColorScheme } from './ui/common';

const UserList = ({ myUserId, connectedUsers, userName = 'ゲスト' }) => {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2">
        <h3 className="font-bold">接続中のユーザー:</h3>
        {/* 自分自身 */}
        {(() => {
          const myColorIdx = parseInt(myUserId || '0', 10) % ColorScheme.length;
          const userColor = ColorScheme[myColorIdx] || { textColor: "text-gray-600", color: "bg-gray-200" };
          return (
            <div className={`px-3 py-1 rounded-full ${userColor.color} ${userColor.textColor} font-semibold text-white`}>
              {userName || 'ゲスト'} (あなた)
            </div>
          );
        })()}

        {/* 他のユーザー */}
        {Object.entries(connectedUsers).map(([userId, userData]) => {
          if (userId !== myUserId) {
            const colorIdx = (userData.colorIndex || 0) % ColorScheme.length;
            const userColor = ColorScheme[colorIdx] || { name: "不明", textColor: "text-gray-600", color: "bg-gray-200" };
            return (
              <div key={userId} className={`px-3 py-1 rounded-full ${userColor.color} font-semibold text-white`}>
                {userData.name || userColor.name || "不明"}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default UserList;
