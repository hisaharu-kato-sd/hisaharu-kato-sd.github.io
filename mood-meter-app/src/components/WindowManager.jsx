import { useState, useEffect } from 'react';

// 開発モードかどうかを判定する関数
const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};

// WindowManager カスタムフック
export const useWindowManager = () => {
  // カウントダウン用のステート変数
  const [remainingTime, setRemainingTime] = useState(isDevelopmentMode() ? 999999 : 1800);
  const [isDevMode] = useState(isDevelopmentMode());
  
  // 時間をフォーマットする関数
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // ウィンドウを閉じる関数
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

  // ウィンドウの可視性監視
  useEffect(() => {
    if (isDevMode) {
      console.log('開発モードのため、ウィンドウ可視性監視をスキップします');
      return;
    }
    
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
  }, [isDevMode]);

  // カウントダウンタイマーの設定
  useEffect(() => {
    if (isDevMode) {
      console.log('開発モードのため、カウントダウンタイマーをスキップします');
      return;
    }
    
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
  }, [isDevMode]);

  return {
    remainingTime,
    formatTime,
    closeWindow,
    isDevMode
  };
};

export default useWindowManager;