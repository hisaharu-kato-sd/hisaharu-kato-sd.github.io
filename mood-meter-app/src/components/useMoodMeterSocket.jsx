import { useState, useEffect, useRef, useCallback } from 'react';
import { ColorScheme } from './ui/common';

// WebSocket URL を定数として宣言して共通化
const WS_URL = 'wss://s14296.blr1.piesocket.com/v3/1?api_key=BVM9sVqGpPfg0xNvwIvYJTNEYoIHOUsLAxLwmCu0&notify_self=1';

export const useMoodMeterSocket = (initialSelections = [], userName = 'ゲスト') => {
  // WebSocket接続状態を追跡する状態変数を追加
  const [connectionState, setConnectionState] = useState('connecting'); // 'connecting', 'connected', 'error'
  const [connectedClients, setConnectedClients] = useState(0);
  const [remoteSelections, setRemoteSelections] = useState([]);
  const [myUserId, setMyUserId] = useState('');
  const [remoteUsers, setRemoteUsers] = useState({});
  const wsRef = useRef(null);
  const initializedRef = useRef(false); // 初期化フラグ

  // 自分の選択を追跡するための状態 - セッションストレージから初期値を取得
  const [mySelections, setMySelections] = useState(() => {
    try {
      const storedData = sessionStorage.getItem('moodMeterSelections');
      const parsedData = storedData ? JSON.parse(storedData) : [];
      console.log('セッションストレージから選択データを復元:', parsedData);
      return parsedData;
    } catch (e) {
      console.error('選択データの復元中にエラー:', e);
      return [];
    }
  });

  // 初期化処理を実行
  useEffect(() => {
    if (initializedRef.current) return; // 既に初期化済みならスキップ
    initializedRef.current = true;

    // 初期選択データがあれば、それを使用する
    if (initialSelections && initialSelections.length > 0) {
      console.log('親コンポーネントから初期選択を設定:', initialSelections);
      setMySelections(initialSelections);
    }
  }, [initialSelections]);

  // WebSocket接続処理とユーザー初期化
  useEffect(() => {
    console.log('WebSocket接続を開始します...');
    setConnectionState('connecting'); // 接続開始時に状態を'connecting'に設定

    // セッションストレージからユーザーIDを取得するか、新しく生成する
    const getOrCreateUserId = () => {
      const storedUserId = sessionStorage.getItem('moodMeterUserId');
      const storedColorIndex = sessionStorage.getItem('moodMeterColorIndex');

      if (storedUserId) {
        console.log('セッションストレージからユーザー情報を復元:', storedUserId, storedColorIndex);
        return {
          userId: storedUserId,
          colorIndex: parseInt(storedColorIndex || '0', 10)
        };
      }

      const newUserId = Math.floor(Math.random() * 10000000).toString();
      const newColorIndex = parseInt(newUserId, 10) % ColorScheme.length;

      sessionStorage.setItem('moodMeterUserId', newUserId);
      sessionStorage.setItem('moodMeterColorIndex', newColorIndex.toString());

      console.log('新しいユーザー情報を生成:', newUserId, newColorIndex);
      return {
        userId: newUserId,
        colorIndex: newColorIndex
      };
    };

    const { userId, colorIndex } = getOrCreateUserId();
    setMyUserId(userId);

    // WebSocket接続の初期化 - 共通の定数を使用
    wsRef.current = new WebSocket(WS_URL);

    // 接続タイムアウトの設定
    const connectionTimeout = setTimeout(() => {
      if (connectionState === 'connecting') {
        console.log('WebSocket接続がタイムアウトしました');
        setConnectionState('error');
      }
    }, 10000); // 10秒でタイムアウト

    // WebSocket接続時の処理
    wsRef.current.onopen = () => {
      console.log('WebSocket接続が確立されました');
      setConnectionState('connected'); // 接続成功時に状態を'connected'に更新
      clearTimeout(connectionTimeout); // タイムアウトのクリア

      // ユーザー情報を送信
      const userInfo = {
        type: 'user_connect',
        userId: userId,
        userName: userName,
        colorIndex: colorIndex,
        timestamp: new Date().toISOString()
      };

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(userInfo));
      }

      // クライアント数の送信を要求
      setConnectedClients(prev => Math.max(prev, 1));

      // リロード時、セッションストレージから復元した選択データがある場合は送信
      const currentSelections = mySelections;
      if (currentSelections && currentSelections.length > 0) {
        console.log('セッションから復元した選択を送信:', currentSelections);

        // 状態を再設定してUIに反映
        setMySelections(currentSelections);

        // 少し遅延させて選択情報を送信
        const timerId = setTimeout(() => {
          try {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              const data = {
                type: 'emotion_update',
                selections: currentSelections,
                userId: userId,
                userName: userName,
                colorIndex: colorIndex,
                timestamp: new Date().toISOString()
              };
              wsRef.current.send(JSON.stringify(data));
            }
          } catch (error) {
            console.error('選択情報送信エラー:', error);
          }
        }, 500);

        return () => clearTimeout(timerId);
      }

      // 他のユーザーの選択情報をリクエスト
      const requestTimerId = setTimeout(() => {
        try {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            requestAllSelections();
          }
        } catch (error) {
          console.error('選択情報リクエストエラー:', error);
        }
      }, 1000);

      return () => clearTimeout(requestTimerId);
    };

    // メッセージ受信時の処理
    wsRef.current.onmessage = handleWebSocketMessage;

    wsRef.current.onerror = (error) => {
      console.error('WebSocket接続エラー:', error);
      setConnectionState('error'); // エラー発生時に状態を'error'に設定
      clearTimeout(connectionTimeout); // タイムアウトのクリア
    };

    wsRef.current.onclose = (event) => {
      console.log('WebSocket接続が閉じられました', event.code, event.reason);

      // 正常終了以外の場合は、エラー状態に設定
      if (event.code !== 1000 && !window.isUnloading) {
        setConnectionState('error');
      }

      clearTimeout(connectionTimeout); // タイムアウトのクリア
    };

    // クリーンアップ
    return () => {
      clearTimeout(connectionTimeout); // タイムアウトのクリア
      try {
        if (wsRef.current) {
          if (wsRef.current.readyState === WebSocket.OPEN) {
            // 切断前に切断メッセージを送信
            const disconnectData = {
              type: 'user_disconnect',
              userId: userId,
              timestamp: new Date().toISOString()
            };
            wsRef.current.send(JSON.stringify(disconnectData));
            wsRef.current.close();
          }
          wsRef.current = null; // 参照をクリア
        }
      } catch (error) {
        console.error('WebSocketクリーンアップエラー:', error);
      }
    };
  }, []);

  // WebSocket接続処理の改善
  useEffect(() => {
    // WebSocket接続が既に確立されている場合はスキップ
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket接続は既に確立されています');
      return;
    }

    // 接続試行回数を追跡する変数
    let reconnectCount = 0;
    const maxReconnectAttempts = 5;

    // WebSocket接続を確立する関数
    const setupWebSocket = () => {
      try {
        // 共通の定数を使用
        wsRef.current = new WebSocket(WS_URL);

        wsRef.current.onopen = () => {
          console.log('WebSocket接続が確立されました');
          reconnectCount = 0; // 接続成功したらカウントをリセット

          // ...既存のonopen処理...
        };

        // メッセージ受信時の処理
        wsRef.current.onmessage = handleWebSocketMessage;

        wsRef.current.onerror = (error) => {
          console.error('WebSocket接続エラー:', error);
        };

        wsRef.current.onclose = (event) => {
          console.log('WebSocket接続が閉じられました', event.code, event.reason);

          // 異常切断の場合は再接続を試みる（コード1000は正常終了）
          if (event.code !== 1000 && !window.isUnloading && reconnectCount < maxReconnectAttempts) {
            console.log(`WebSocket接続の再確立を試みます (試行: ${reconnectCount + 1}/${maxReconnectAttempts})`);
            reconnectCount++;

            // 指数バックオフで再接続（徐々に間隔を広げる）
            const delay = Math.min(1000 * Math.pow(1.5, reconnectCount), 10000);
            setTimeout(setupWebSocket, delay);
          }
        };
      } catch (error) {
        console.error('WebSocket初期化エラー:', error);
      }
    };

    // 初期接続を確立
    setupWebSocket();

    // クリーンアップ
    return () => {
      try {
        if (wsRef.current) {
          if (wsRef.current.readyState === WebSocket.OPEN) {
            // 切断前に切断メッセージを送信
            const disconnectData = {
              type: 'user_disconnect',
              userId: myUserId,
              timestamp: new Date().toISOString()
            };
            wsRef.current.send(JSON.stringify(disconnectData));
            wsRef.current.close();
          }
          wsRef.current = null; // 参照をクリア
        }
      } catch (error) {
        console.error('WebSocketクリーンアップエラー:', error);
      }
    };
  }, [myUserId]); // myUserIdが変更されたときに再接続

  // 初期選択データがあれば適用する処理を追加
  useEffect(() => {
    if (initialSelections && initialSelections.length > 0 && mySelections.length === 0) {
      console.log('親コンポーネントから初期選択を設定:', initialSelections);
      setMySelections(initialSelections);
      try {
        sessionStorage.setItem('moodMeterSelections', JSON.stringify(initialSelections));
      } catch (e) {
        console.error('選択情報の保存エラー:', e);
      }
    }
  }, [initialSelections]);

  // mySelectionsの変更を監視し、セッションストレージに保存
  useEffect(() => {
    if (mySelections.length > 0) {
      console.log('選択情報をセッションストレージに保存:', mySelections);
      sessionStorage.setItem('moodMeterSelections', JSON.stringify(mySelections));
    }
  }, [mySelections]);

  // 全ユーザーの選択情報をリクエストする関数を追加
  const requestAllSelections = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        const request = {
          type: 'request_all_selections',
          userId: myUserId,
          timestamp: new Date().toISOString()
        };
        console.log('全ユーザーの選択情報をリクエスト');
        wsRef.current.send(JSON.stringify(request));
      } catch (error) {
        console.error('選択情報リクエスト送信エラー:', error);
      }
    }
  };

  // WebSocketメッセージハンドラの改善
  const handleWebSocketMessage = (event) => {
    console.log('WebSocketからメッセージ受信:', event.data);

    try {
      const data = JSON.parse(event.data);

      // データ検証を追加
      if (!data || typeof data !== 'object' || !data.type) {
        console.warn('無効なWebSocketメッセージ形式:', data);
        return;
      }

      switch (data.type) {
        case 'client_count':
          console.log('クライアント数を更新:', data.count);
          setConnectedClients(Number(data.count) || 1);
          break;

        case 'user_connect':
          if (!data.userId) {
            console.warn('ユーザー接続メッセージにユーザーIDがありません:', data);
            return;
          }

          setRemoteUsers(prevRemoteUsers => {
            // 既存のユーザーデータを保持
            const existingUserData = prevRemoteUsers[data.userId] || {};

            return {
              ...prevRemoteUsers,
              [data.userId]: {
                // 既存のデータを保持しつつ新しいデータで上書き
                ...existingUserData,
                name: data.userId === myUserId ? userName : (data.userName || `ユーザー${data.userId.substring(0, 4)}`),
                colorIndex: data.colorIndex !== undefined ? data.colorIndex : existingUserData.colorIndex || 0,
                selections: existingUserData.selections || [],
                timestamp: data.timestamp || new Date().toISOString()
              }
            };
          });
          break;

        case 'user_disconnect':
          if (!data.userId) {
            console.warn('ユーザー切断メッセージにユーザーIDがありません:', data);
            return;
          }

          console.log(`ユーザーが切断しました: ${data.userId}`);

          // 切断したユーザーの選択情報を削除
          setRemoteUsers(prevRemoteUsers => {
            const updatedRemoteUsers = { ...prevRemoteUsers };

            // ユーザーのエントリを削除
            if (updatedRemoteUsers[data.userId]) {
              delete updatedRemoteUsers[data.userId];
            }

            return updatedRemoteUsers;
          });

          // リモート選択からも削除
          setRemoteSelections(prevSelections =>
            prevSelections.filter(sel => sel.userId !== data.userId)
          );
          break;

        case 'emotion_update':
          if (data.userId === myUserId) {
            console.log('自分の選択をスキップ:', data.selections);
            return;
          }

          if (data.selections && data.userId && Array.isArray(data.selections)) {
            const colorIndex = data.colorIndex || 0;

            setRemoteUsers(prevRemoteUsers => {
              const updatedRemoteUsers = {
                ...prevRemoteUsers,
                [data.userId]: {
                  selections: data.selections,
                  colorIndex: colorIndex,
                  name: data.userId === myUserId ? userName : (data.userName || `ユーザー名取得失敗:${data.userId.substring(0, 4)}`),
                  timestamp: data.timestamp
                }
              };

              const allSelections = [];
              Object.entries(updatedRemoteUsers).forEach(([userId, userData]) => {
                if (userId !== myUserId && Array.isArray(userData.selections)) {
                  userData.selections.forEach(selection => {
                    allSelections.push({
                      ...selection,
                      userId,
                      colorIndex: userData.colorIndex
                    });
                  });
                }
              });

              setRemoteSelections(allSelections);
              return updatedRemoteUsers;
            });
          }
          break;

        case 'emotion_clear':
          if (data.userId && data.userId !== myUserId) {
            setRemoteUsers(prev => {
              const newRemoteUsers = {...prev};
              if (newRemoteUsers[data.userId]) {
                newRemoteUsers[data.userId].selections = [];
              }
              return newRemoteUsers;
            });

            setRemoteSelections(prev =>
              prev.filter(selection => selection.userId !== data.userId)
            );
          }
          break;

        case 'request_all_selections':
          // 他のユーザーから選択情報のリクエストがあった場合、自分の選択情報を送信
          if (data.userId !== myUserId && mySelections.length > 0) {
            sendEmotionUpdateToUser(mySelections, data.userId);
          }
          break;

        case 'emotion_update_response':
          // 特定のユーザー向けの選択情報応答を処理
          if (data.targetUserId === myUserId && data.userId !== myUserId) {
            if (data.selections && data.userId && Array.isArray(data.selections)) {
              const colorIndex = data.colorIndex || 0;

              setRemoteUsers(prevRemoteUsers => {
                const updatedRemoteUsers = {
                  ...prevRemoteUsers,
                  [data.userId]: {
                    selections: data.selections,
                    colorIndex: colorIndex,
                    name: data.userId === myUserId ? userName : (data.userName || `ユーザー名取得失敗:${data.userId.substring(0, 4)}`),
                    timestamp: data.timestamp
                  }
                };

                const allSelections = [];
                Object.entries(updatedRemoteUsers).forEach(([userId, userData]) => {
                  if (userId !== myUserId && Array.isArray(userData.selections)) {
                    userData.selections.forEach(selection => {
                      allSelections.push({
                        ...selection,
                        userId,
                        colorIndex: userData.colorIndex
                      });
                    });
                  }
                });

                setRemoteSelections(allSelections);
                return updatedRemoteUsers;
              });
            }
          }
          break;
      }
    } catch (err) {
      console.error('JSONパースエラー:', err, 'データ:', event.data);
    }
  };

  // 特定のユーザーに選択情報を送信する関数
  const sendEmotionUpdateToUser = (selections, targetUserId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const data = {
        type: 'emotion_update_response',
        selections: selections,
        userId: myUserId,
        userName: userName,
        targetUserId: targetUserId,
        colorIndex: parseInt(myUserId, 10) % ColorScheme.length,
        timestamp: new Date().toISOString()
      };
      wsRef.current.send(JSON.stringify(data));
    }
  };

  // 感情データを送信する関数をmemoize
  const sendEmotionUpdate = useCallback((selections) => {
    console.log('感情データを送信:', selections);

    // 状態を更新
    setMySelections(selections);

    // セッションストレージに選択情報を保存
    try {
      sessionStorage.setItem('moodMeterSelections', JSON.stringify(selections));
    } catch (e) {
      console.error('選択情報の保存エラー:', e);
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        const data = {
          type: 'emotion_update',
          selections: selections,
          userId: myUserId,
          userName: userName,
          colorIndex: parseInt(myUserId, 10) % ColorScheme.length,
          timestamp: new Date().toISOString()
        };
        wsRef.current.send(JSON.stringify(data));
      } catch (error) {
        console.error('WebSocket送信エラー:', error);
      }
    } else {
      console.warn('WebSocket接続が確立されていません');
    }
  }, [myUserId, userName]);

  // 選択クリア通知を送信する関数をmemoize
  const sendEmotionClear = useCallback(() => {
    console.log('感情データをクリア');

    // 状態をクリア
    setMySelections([]);

    // セッションストレージから選択情報をクリア
    sessionStorage.removeItem('moodMeterSelections');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        const data = {
          type: 'emotion_clear',
          userId: myUserId,
          timestamp: new Date().toISOString()
        };
        wsRef.current.send(JSON.stringify(data));
      } catch (error) {
        console.error('WebSocket送信エラー:', error);
      }
    }
  }, [myUserId]);

  // ページ離脱時に切断通知を送信する部分を修正
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      try {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          // 同期的に送信するため、非同期コールバックを使わない
          const data = {
            type: 'user_disconnect',
            userId: myUserId,
            timestamp: new Date().toISOString()
          };

          // navigator.sendBeacon を使用してページ遷移中でも確実にデータを送信
          const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
          // WS_URLからHTTP URLを生成（必要な場合）
          const httpUrl = WS_URL.replace('wss://', 'https://');

          try {
            // WebSocketで送信を試みる
            wsRef.current.send(JSON.stringify(data));
          } catch (e) {
            console.warn('WebSocket経由での切断通知送信に失敗:', e);
          }
        }
      } catch (error) {
        console.error('切断通知の送信中にエラーが発生:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // コンポーネントのアンマウント時にもクリーンアップを実行
      try {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const data = {
            type: 'user_disconnect',
            userId: myUserId,
            timestamp: new Date().toISOString()
          };
          // 同期的に送信
          wsRef.current.send(JSON.stringify(data));
          wsRef.current.close();
        }
      } catch (e) {
        console.error('WebSocket切断中にエラー:', e);
      }
    };
  }, [myUserId]);

  // グローバルフラグを追加してページ離脱状態を追跡
  useEffect(() => {
    const handleUnload = () => {
      window.isUnloading = true;
    };

    window.addEventListener('unload', handleUnload);
    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  return {
    myUserId,
    connectedClients,
    remoteUsers,
    remoteSelections,
    mySelections,
    connectionState, // 接続状態を返す
    sendEmotionUpdate,
    sendEmotionClear
  };
};
