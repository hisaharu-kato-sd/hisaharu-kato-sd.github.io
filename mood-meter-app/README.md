# Mood Meter App

## 概要
Mood Meter Appは、ユーザーが感情を選択し、チームの平均エネルギーや快適度を計算するためのインタラクティブなアプリケーションです。このアプリは、感情の選択を視覚的に表現し、選択された感情に基づいて統計情報を提供します。

## セットアップ手順

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/yourusername/mood-meter-app.git
   cd mood-meter-app
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

4. **ブラウザでアプリケーションを表示**
   開発サーバーが起動したら、ブラウザで `http://localhost:3000` にアクセスします。

## 使用技術
- **React**: ユーザーインターフェースを構築するためのライブラリ。
- **Vite**: 高速なビルドツールと開発サーバー。
- **Tailwind CSS**: ユーザーインターフェースのスタイリングに使用されるユーティリティファーストCSSフレームワーク。

## デプロイ
このプロジェクトはGitHub Pagesを使用してデプロイされます。デプロイの設定は`.github/workflows/deploy.yml`に記載されています。

## ライセンス
このプロジェクトはMITライセンスの下でライセンスされています。詳細はLICENSEファイルを参照してください。