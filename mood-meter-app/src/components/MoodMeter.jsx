import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ColorScheme } from './ui/common';
import { useMoodMeterSocket } from './useMoodMeterSocket';
import EmotionGrid from './EmotionGrid';
import UserList from './UserList';
import EmotionStatistics from './EmotionStatistics';

const MoodMeter = () => {
  // ウィンドウの可視性監視を追加
  useEffect(() => {
    // ロード直後の誤検出を防ぐための猶予時間（3秒）
    const initialGracePeriod = setTimeout(() => {
      // ウィンドウの可視性変更を監視
      const handleVisibilityChange = () => {
        if (document.hidden) {
          console.log('ウィンドウが非アクティブになりました。ウィンドウを閉じます。');
          try {
            closeWindow();
          } catch (e) {
            console.error('ウィンドウを閉じられませんでした:', e);
            // ブラウザによっては自動的に閉じられないので、エラーメッセージを非表示にする
          }
        }
      };

      // 可視性変更イベントのリスナーを追加
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // クリーンアップ関数
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, 3000); // 3秒の猶予時間

    return () => clearTimeout(initialGracePeriod);
  }, []);

  // 改良されたウィンドウを閉じる関数
  const closeWindow = () => {
    try {
      // まずwindow.closeを試す（ポップアップウィンドウなら動作する）
      window.close();
      
      // タブの場合は以下の代替手段を使用
      // 少し時間をおいてチェック（window.closeが効かなかった場合）
      setTimeout(() => {
        if (!window.closed) {
          // 1. 空白ページにリダイレクト
          window.location.href = 'about:blank';
          
          // 2. ページの内容を空にする
          document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: sans-serif;">
              <h1>セッションが終了しました</h1>
              <p>このタブは閉じても安全です。</p>
              <button onclick="window.close()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
                タブを閉じる
              </button>
            </div>
          `;
          
          // 3. タイトルを変更
          document.title = "セッション終了 - 気分メーター";
        }
      }, 300);
    } catch (e) {
      console.error('ウィンドウを閉じられませんでした:', e);
    }
  };
  
  // カウントダウン用のステート変数を追加
  const [remainingTime, setRemainingTime] = useState(10);

  // 時間をフォーマットする関数
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // 30分のカウントダウンタイマーを設定
  useEffect(() => {
    // 初期時間を設定
    const totalSeconds = 1800; // 30分 = 1800秒
    setRemainingTime(totalSeconds);
    
    // 1秒ごとにカウントダウンを更新
    const intervalId = setInterval(() => {
      setRemainingTime(prevTime => {
        if (prevTime <= 0) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000); // 1秒ごと
    
    // 5分前に警告表示
    const warningTimeout = setTimeout(() => {
      alert('あと5分でウィンドウを閉じます。');
    }, totalSeconds * 1000 * 0.833); // 25分後（30分 - 5分）
    
    // 30分後にウィンドウを閉じる
    const closeTimeout = setTimeout(() => {
      try {
        closeWindow();
      } catch (e) {
        console.error('ウィンドウを閉じられませんでした:', e);
        alert('セッション時間が終了しました。このページを閉じてください。');
      }
    }, totalSeconds * 1000); // 30分後
    
    // クリーンアップ関数
    return () => {
      clearInterval(intervalId);
      clearTimeout(warningTimeout);
      clearTimeout(closeTimeout);
    };
  }, []);


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
  } = useMoodMeterSocket(selectedEmotions); // 初期選択を渡す

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

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {(() => {
        const myColorIdx = parseInt(myUserId || '0', 10) % ColorScheme.length;
        const userColor = ColorScheme[myColorIdx] || { name: "ゲスト", textColor: "text-gray-600" };
        return (
          <>
            <h2 className={`text-2xl font-bold mb-4 text-center ${userColor.textColor}`}>
              {userColor.name}の気分メーター
            </h2>
            <div className={`text-center mb-4 ${remainingTime < 300 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
              ウィンドウが閉じるまでの残り時間: {formatTime(remainingTime)}
            </div>
          </>
        );
      })()}

      {/* 接続ユーザーリスト */}
      <UserList myUserId={myUserId} connectedUsers={connectedUsers} />

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
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            あなたの気分：
          </AlertTitle>
          <AlertDescription>
            {selectedEmotions.map((emotion, index) => {
              const myColorIdx = parseInt(myUserId || '0', 10) % ColorScheme.length;
              const userColor = ColorScheme[myColorIdx] || {
                name: "ゲスト",
                textColor: "text-gray-600",
                color: "bg-gray-200"
              };
              return (
                <div key={index} className={`mb-2 p-2 ${userColor.color || 'bg-gray-200'} bg-opacity-20 ${userColor.textColor || 'text-gray-600'}`}>
                  {userColor.name || 'ゲスト'}： {emotion.emotion} | エネルギー: {10 - emotion.row}/10 | 快適度: {emotion.col + 1}/10
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
  );
};


export default MoodMeter;
