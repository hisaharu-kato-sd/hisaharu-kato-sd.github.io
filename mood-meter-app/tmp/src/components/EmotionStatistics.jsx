import React from 'react';
import { CalculateAverage, CalculateStandardDeviation } from './ui/common';

const EmotionStatistics = ({ selectedEmotions, remoteUsers, myUserId }) => {
  const calculateStatistics = () => {
    // 自分の選択
    const mySelections = selectedEmotions;

    // 重複排除のため、一時的なマップを使用
    const uniqueSelectionMap = new Map();

    // 自分の選択を追加
    mySelections.forEach(selection => {
      const key = `${myUserId}-${selection.row}-${selection.col}`;
      uniqueSelectionMap.set(key, selection);
    });

    // リモートユーザーの選択を追加
    Object.entries(remoteUsers).forEach(([userId, userData]) => {
      if (userId === myUserId) return;

      if (userData.selections && Array.isArray(userData.selections)) {
        userData.selections.forEach(selection => {
          const key = `${userId}-${selection.row}-${selection.col}`;
          uniqueSelectionMap.set(key, selection);
        });
      }
    });

    // マップから値だけを取得
    const allUniqueSelections = Array.from(uniqueSelectionMap.values());

    // 選択がなければ計算しない
    if (allUniqueSelections.length === 0) {
      return {
        avgEnergy: 0,
        avgPleasantness: 0,
        stdDevEnergy: 0,
        stdDevPleasantness: 0,
        totalCount: 0,
      };
    }

    // エネルギーと快適度の計算
    const energyValues = allUniqueSelections.map(e => 10 - e.row); // エネルギー値（1〜10）
    const pleasantnessValues = allUniqueSelections.map(e => e.col + 1); // 快適度値（1〜10）

    // 平均値と標準偏差の計算
    const avgEnergy = CalculateAverage(energyValues);
    const avgPleasantness = CalculateAverage(pleasantnessValues);
    const stdDevE = CalculateStandardDeviation(energyValues);
    const stdDevP = CalculateStandardDeviation(pleasantnessValues);

    return {
      avgEnergy: avgEnergy.toFixed(1),
      avgPleasantness: avgPleasantness.toFixed(1),
      stdDevEnergy: stdDevE.toFixed(1),
      stdDevPleasantness: stdDevP.toFixed(1),
      totalCount: allUniqueSelections.length
    };
  };

  const stats = calculateStatistics();

  // 自分の選択数
  const mySelectionsCount = selectedEmotions.length;

  // リモートユーザーの選択数
  const remoteSelectionsCount = Object.entries(remoteUsers).reduce((count, [userId, user]) => {
    if (userId === myUserId) return count;
    const selectionsLength = Array.isArray(user.selections) ? user.selections.length : 0;
    return count + selectionsLength;
  }, 0);

  return (
    <div className="text-center mb-4">
      <div>
        <strong>チーム統計</strong> (全{stats.totalCount}選択中)
      </div>
      <div className="mt-4 font-bold">平均エネルギー: {stats.avgEnergy} (標準偏差: {stats.stdDevEnergy}) / 平均快適度: {stats.avgPleasantness} (標準偏差: {stats.stdDevPleasantness})</div>
    </div>
  );
};

export default EmotionStatistics;
