import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ColorScheme } from './ui/common';
import { useMoodMeterSocket } from './useMoodMeterSocket';
import { useWindowManager } from './WindowManager';
import EmotionGrid from './EmotionGrid';
import UserList from './UserList';
import EmotionStatistics from './EmotionStatistics';

const MoodMeter = () => {
  // WindowManagerからの機能を取得
  const { remainingTime, formatTime, isDevMode } = useWindowManager();

  // ユーザー名管理のための状態
  const [userName, setUserName] = useState('');
  const [hasSetName, setHasSetName] = useState(false);

  // 初期値の取得
  const getInitialEmotions = () => {
    try {
      const storedSelections = sessionStorage.getItem('moodMeterSelections');
      if (storedSelections) {
        const parsedSelections = JSON.parse(storedSelections);
        if (Array.isArray(parsedSelections) && parsedSelections.length > 0) {
          return parsedSelections;
        }
      }
      return [];
    } catch (err) {
      console.error('初期選択の復元エラー:', err);
      return [];
    }
  };

  const [selectedEmotions, setSelectedEmotions] = useState(getInitialEmotions());

  // カスタムフックからWebSocket関連の状態と機能を取得
  const {
    myUserId,
    connectedClients,
    connectedUsers,
    remoteUsers,
    remoteSelections,
    mySelections,  // ここで選択情報を受け取る
    sendEmotionUpdate,
    sendEmotionClear
  } = useMoodMeterSocket(selectedEmotions, userName); // 初期選択を渡す

  // コンポーネントマウント時にlocalStorageからユーザー名を読み込む
  useEffect(() => {
    const storedName = localStorage.getItem('moodMeterUserName');
    if (storedName) {
      setUserName(storedName);
      setHasSetName(true);
    }
  }, []);

  // useMoodMeterSocketから返された選択情報と同期
  useEffect(() => {
    if (mySelections && mySelections.length > 0) {
      console.log('カスタムフックから選択情報を同期:', mySelections);
      setSelectedEmotions(mySelections);
    }
  }, [mySelections]);

  // 感情選択ハンドラ
  const handleEmotionSelect = (emotion, row, col) => {
    const newSelection = { emotion, row, col };
    const updatedSelections = [newSelection]; // 単一選択モード

    // 状態を更新
    setSelectedEmotions(updatedSelections);

    // WebSocketで選択データを送信
    sendEmotionUpdate(updatedSelections);

    console.log(`選択された感情: ${emotion}、位置: (${row}, ${col})`);

    // カスタムイベントの発行
    const event = new CustomEvent('emotionSelected', {
      detail: { emotion, row, col, user: myUserId }
    });
    document.dispatchEvent(event);
  };

  // 選択クリアハンドラ
  const handleClearSelections = () => {
    setSelectedEmotions([]);
    sendEmotionClear();
  };

  // デバッグ情報の表示
  useEffect(() => {
    console.log('MoodMeter: 現在の選択状態', selectedEmotions);
    console.log('接続ユーザー:', connectedUsers);
    console.log('リモートユーザー:', remoteUsers);
  }, [selectedEmotions, connectedUsers, remoteUsers]);

  // ユーザー名を保存する関数
  const handleSaveName = () => {
    if (userName.trim()) {
      localStorage.setItem('moodMeterUserName', userName);
      setHasSetName(true);
    }
  };

  // ユーザー名の入力を処理する関数
  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  return (
    <div>
      {!hasSetName && (
        <div id="user-name-box" className="w-full max-w-4xl mx-auto p-4">
          <h3>あなたの名前</h3>
          <input 
            type="text" 
            value={userName} 
            onChange={handleNameChange}
            className="p-2 border border-gray-300 rounded mr-2" 
          />
          <button 
            onClick={handleSaveName} 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            保存
          </button>
        </div>
      )}   
      {hasSetName && ( 
        <div id="mood-meter-box" className="w-full max-w-4xl mx-auto p-4">
          {(() => {
            const myColorIdx = parseInt(myUserId || '0', 10) % ColorScheme.length;
            const userColor = ColorScheme[myColorIdx] || { textColor: "text-gray-600" };
            return (
              <>
                <h2 className={`text-2xl font-bold mb-4 text-center ${userColor.textColor}`}>
                  チームの気分メーター
                </h2>
                <div className={`text-center mb-4 ${remainingTime < 300 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                  ようこそ！ {userName} さん
                </div>
                {!isDevMode && (
                  <div className={`text-center mb-4 ${remainingTime < 300 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                    ウィンドウが閉じるまでの残り時間: {formatTime(remainingTime)}
                  </div>
                )}
                {isDevMode && (
                  <div className="text-center mb-4 text-blue-600">
                    開発モード: カウントダウンは無効です
                  </div>
                )}
              </>
            );
          })()}

          {/* 接続ユーザーリスト */}
          <UserList myUserId={myUserId} connectedUsers={connectedUsers} userName={userName} />

          {/* 統計情報 */}
          <EmotionStatistics
            selectedEmotions={selectedEmotions}
            remoteUsers={remoteUsers}
            myUserId={myUserId}
          />

          <div className="flex">
            <div className="flex flex-col justify-between mr-2 text-sm">
              <div>高エネルギー</div>
              <div>低エネルギー</div>
            </div>
            <div className="flex-1">
              <EmotionGrid
                selectedEmotions={selectedEmotions}
                remoteSelections={remoteSelections}
                myUserId={myUserId}
                onEmotionSelect={handleEmotionSelect}
              />
            </div>
          </div>

          <button
            onClick={handleClearSelections}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            選択をクリア
          </button>

          {selectedEmotions.length > 0 && (
            <Alert className="mt-4">
              <AlertTitle>
                あなたの気分：
              </AlertTitle>
              <AlertDescription>
                {selectedEmotions.map((emotion, index) => {
                  const myColorIdx = parseInt(myUserId || '0', 10) % ColorScheme.length;
                  const userColor = ColorScheme[myColorIdx] || {
                    textColor: "text-gray-600",
                    color: "bg-gray-200"
                  };
                  return (
                    <div key={index} className={`mb-2 p-2 ${userColor.color || 'bg-gray-200'} bg-opacity-20 ${userColor.textColor || 'text-gray-600'}`}>
                      {userName || '名前取得失敗'}： {emotion.emotion} | エネルギー: {10 - emotion.row}/10 | 快適度: {emotion.col + 1}/10
                    </div>
                  );
                })}
              </AlertDescription>
            </Alert>
          )}

          {remoteSelections.length > 0 && (
            <div className="mt-6 border-l-4 p-4 bg-gray-100 border-gray-500">
              <h3 className="font-bold">他のユーザーの選択:</h3>
              <ul className="list-disc pl-5">
                {remoteSelections
                  .filter(sel => sel.userId !== myUserId)
                  .map((sel, idx) => {
                    const colorIdx = (sel.colorIndex !== undefined ? sel.colorIndex : idx) % ColorScheme.length;
                    const userColor = ColorScheme[colorIdx] || {
                      name: "不明",
                      textColor: "text-gray-600",
                      color: "bg-gray-200"
                    };
                    return (
                      <li key={idx} className={`${userColor.textColor || 'text-gray-600'}`}>
                        <span className="font-semibold">{userColor.name || '不明'}:</span> {sel.emotion}
                        (エネルギー: {10 - sel.row}/10, 快適度: {sel.col + 1}/10)
                      </li>
                    );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoodMeter;
