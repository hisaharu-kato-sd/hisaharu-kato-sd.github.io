import React from 'react';


const Emotions = [
    ['激怒', 'パニック', '欲求不満', 'ショック', '茫然', '活気', 'スリル', '歓喜', '陶酔', '有頂天'],
    ['激昂', '恐怖', 'イライラ', '心配', '苛立ち', '前向き', '親密', '喜び', '熱中', '歓喜'],
    ['怒り', '恐れ', '怒り', '緊張', '懸念', '嬉しい', 'インスパイア', '幸せ', '意欲的', '興奮'],
    ['憤怒', '不安', '動揺', '不確か', '疎外感', '楽しい', '集中', '陽気', '誇り', '驚き'],
    ['嫌悪', '恐れ', '悩み', '落ち着かない', '不安', '満足', '喜ば', '希望的', '楽観的', '活発'],
    ['不安', '恥ずかしい', '罪悪感', '萎縮', '自己満足', '気楽', '安全', 'リラックス', '尊敬', '幸運'],
    ['不機嫌', '憂鬱', '落胆', '落胆', '退屈', 'くつろぎ', '安心', '満足', '感謝', '充実'],
    ['疲労困憊', '疲れ', '悲しい', '惨め', '悲観的', '思慮深い', '冷静', '平穏', '感謝', '安らか'],
    ['疎外感', '憂鬱', '失望', '疲れ', '混乱', '穏やか', '平和', 'バランス', 'くつろぎ', '落ち着き'],
    ['絶望', '慰めようがない', '苦悩', '絶望的', '孤独', '無気力', '眠い', '休息', '快適', '静寂']
  ];

const ColorScheme = [
    { color: 'bg-red-600', borderColor: 'border-red-600', textColor: 'text-red-600' },
    { color: 'bg-orange-600', borderColor: 'border-orange-600', textColor: 'text-orange-600' },
    { color: 'bg-yellow-500', borderColor: 'border-yellow-500', textColor: 'text-yellow-600' },
    { color: 'bg-green-600', borderColor: 'border-green-600', textColor: 'text-green-600' },
    { color: 'bg-blue-600', borderColor: 'border-blue-600', textColor: 'text-blue-600' },
    { color: 'bg-purple-600', borderColor: 'border-purple-600', textColor: 'text-purple-600' },
    { color: 'bg-pink-600', borderColor: 'border-pink-600', textColor: 'text-pink-600' },
    { color: 'bg-rose-600', borderColor: 'border-rose-600', textColor: 'text-rose-600' },
    { color: 'bg-sky-600', borderColor: 'border-sky-600', textColor: 'text-sky-600' },
    { color: 'bg-emerald-600', borderColor: 'border-emerald-600', textColor: 'text-emerald-600' },
    { color: 'bg-lime-600', borderColor: 'border-lime-600', textColor: 'text-lime-600' },
    { color: 'bg-stone-600', borderColor: 'border-stone-600', textColor: 'text-stone-600' },
];

// ヘルパー関数の実装（コンポーネント外部に記述）
// -5から5の範囲にスケール変換する関数
const NormalizeToScale = (value, min, max) => {
  const gridSize = 10; // 10x10グリッド
  return min + (value / (gridSize - 1)) * (max - min);
};

// 平均値計算
const CalculateAverage = (values) => {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

// 標準偏差計算
const CalculateStandardDeviation = (values) => {
  if (values.length <= 1) return 0;
  const avg = CalculateAverage(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = CalculateAverage(squareDiffs);
  return Math.sqrt(avgSquareDiff);
};

export { Emotions, ColorScheme, NormalizeToScale,CalculateAverage,CalculateStandardDeviation };
