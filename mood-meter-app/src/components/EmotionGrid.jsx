import React from 'react';
import { Emotions, ColorScheme } from './ui/common';

const EmotionGrid = ({ selectedEmotions, remoteSelections, myUserId, onEmotionSelect }) => {
  // 各セルに対するリモート選択をフィルタリングする関数
  const getCellSelections = (row, col) => {
    if (!remoteSelections || !Array.isArray(remoteSelections)) return [];
    return remoteSelections.filter(
      sel => sel.row === row && sel.col === col && sel.userId !== myUserId
    );
  };

  // セルが選択されているかどうかをチェックする関数
  const isCellSelected = (row, col) => {
    return selectedEmotions.some(emotion => emotion.row === row && emotion.col === col);
  };

  // クリック処理
  const handleCellClick = (row, col) => {
    const emotion = Emotions[row][col];
    onEmotionSelect(emotion, row, col);
  };

  // 感情カテゴリに基づく背景色を取得
  const getEmotionBackground = (row, col) => {
    // 行と列のインデックスに基づいて感情の種類を判定
    // 左上: 赤系 (怒り、恐怖など)
    if (row < 5 && col < 5) return "bg-red-200";
    // 右上: 黄色系 (喜び、興奮など)
    if (row < 5 && col >= 5) return "bg-yellow-200";
    // 左下: 青系 (悲しみ、憂鬱など)
    if (row >= 5 && col < 5) return "bg-blue-200";
    // 右下: 緑系 (平和、リラックスなど)
    return "bg-green-200";
  };

  // グリッドを生成
  const renderGrid = () => {
    const allCells = [];

    Emotions.forEach((rowEmotions, rowIdx) => {
      rowEmotions.forEach((emotion, colIdx) => {
        const cellRemoteSelections = getCellSelections(rowIdx, colIdx);
        const isSelected = isCellSelected(rowIdx, colIdx);
        const backgroundClass = getEmotionBackground(rowIdx, colIdx);

        // 基本セルスタイル
        let cellStyle = `w-full h-full ${backgroundClass} cursor-pointer flex items-center justify-center text-xs font-semibold relative text-gray-800 border-2 border-white text-center`;

        // 選択された場合のスタイル（オプション）
        if (isSelected) {
          const myColorIndex = parseInt(myUserId, 10) % ColorScheme.length;
          const myColor = ColorScheme[myColorIndex] || {
            color: 'bg-gray-200',
            borderColor: 'border-gray-400'
          };
          cellStyle = `w-full h-full ${myColor.color} cursor-pointer flex items-center justify-center text-xs font-semibold relative text-gray-800 border-2 text-center ${myColor.borderColor}`;
        }

        allCells.push(
          <div
            key={`cell-${rowIdx}-${colIdx}`}
            className={cellStyle}
            onClick={() => handleCellClick(rowIdx, colIdx)}
            title={emotion}
          >
            {emotion}

            {/* リモート選択のインジケーター（必要に応じて） */}
            {cellRemoteSelections.length > 0 && (
              <div className="absolute top-0 right-0 flex flex-wrap justify-end max-w-full p-0.5">
                {cellRemoteSelections.map((sel, idx) => {
                  const colorIdx = (sel.colorIndex !== undefined ? sel.colorIndex : idx) % ColorScheme.length;
                  const userColor = ColorScheme[colorIdx] || {
                    color: 'bg-gray-400'
                  };
                  return (
                    <div
                      key={`remote-${idx}`}
                      className={`${userColor.color || 'bg-gray-400'} w-2.5 h-2.5 rounded-full ml-0.5`}
                      title={ColorScheme[colorIdx]?.name || '不明なユーザー'}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      });
    });

    return allCells;
  };

  return (
    <div className="w-full aspect-square mb-2 grid grid-cols-10 grid-rows-10 gap-0.5 bg-white p-0.5">
      {renderGrid()}
    </div>
  );
};

export default EmotionGrid;
