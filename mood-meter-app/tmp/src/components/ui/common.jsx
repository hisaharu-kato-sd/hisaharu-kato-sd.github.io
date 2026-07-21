import React from 'react';


const Emotions = [
  ['Engaged 忙しい','Panicked うろたえる','Stressed ストレスが強い','Jittery 神経質','Shocked 衝撃的','Surprised 驚いている','Upbeat 陽気','Festive お祭り気分','Exhilarated ウキウキする','Ecstatic 有頂天'],
  ['Livid 激怒','Furious 青ざめる','Frustrated 落胆した','Tense 張り詰めた','Stunned あ然とする','Hyper 興奮状態','Cheerful 愉快','Motivated やる気がある','Inspired 触発された','Elated 大喜び'],
  ['Fuming 怒りで爆発する', 'Frightened おびえる', 'Angry 怒り', 'Nervous 神経が高ぶる', 'Restless 落ち着かない', 'Energized 精力的', 'Lively 生き生きとした', 'Excited 興奮した', 'Optimistic 楽観的', 'Enthusiastic 熱狂的'],
  ['Anxious 気が気でない・緊張', 'Apprehensive 危惧する', 'Worried 心配する', 'Imitated うわついた', 'Annoyed いらいらする', 'Pleased うれしい', 'Focused 集中', 'Happy 幸せ', 'Proud 誇りに思う', 'Thrilled (興奮で)ぞくぞくする'],
  ['Repulsed 嫌悪感を抱く', 'Troubled 当惑する・困る', 'Concerned 憂慮する', 'Uneasy そわそわする', 'Peeved もどかしい', 'Pleasant 快適', 'Joyful 楽しい', 'Hopeful 希望に満ちた', 'Playful 遊び心のある', 'Blissful 至福'],
  ['Disgusted うんざりする', 'Glum ふさぎこむ', 'Disappointed 期待を裏切られた', 'Down 落ち込む', 'Apathetic 無感情', 'At Ease 気楽', 'Easygoing のんびり', 'Content 満足している', 'Loving 愛情のある', 'Fulfilled 充実している'],
  ['Pessimistic 悲観的', 'Morose 気難しい', 'Discouraged 気を落とす', 'Sad 悲しい', 'Bored つまらない', 'Calm 穏やか', 'Secure 安心している', 'Satisfied 満ち足りている', 'Grateful ありがたい', 'Touched 感動する'],
  ['Alienated 疎外される', 'Miserable 悲惨', 'Lonely 孤独', 'Disheartened がっかりする', 'Tired 疲れている', 'Relaxed リラックスしている', 'Chill ゆっくりする', 'Restful 心が休まる', 'Blessed 恵まれている', 'Balanced バランスがとれている'],
  ['Despondent しょげ返った', 'Depressed 意気消沈', 'Sullen 不機嫌', 'Exhausted 疲労困憊', 'Fatigued 疲労・倦怠感', 'Mellow 落ち着いている','Thoghtful 思いにふける', 'Peaceful 平然とした', 'Comfortable 心地良い', 'Carefree のんき'],
  ['Despairing 絶望', 'Hopeless 望みがない', 'Desolate みじめ', 'Spent 失望する', 'Drained 疲れ切っている', 'Sleepy 眠たい', 'Complacent 無関心', 'Tranquil 冷静', 'Cozy くつろいでいる', 'Serene 平穏'],
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
