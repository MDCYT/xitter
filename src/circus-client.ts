// The Amazing Digital Circus - Custom 2016 Twitter-Style Client
// Built 100% from scratch with Twitter Bootstrap 3 aesthetics.
// Zero proprietary Twitter React/Webpack bundles, free from legal risk.

import type { User, Viewer } from "./auth";
import { PUBLIC_ORIGIN } from "./config";
import { settings } from "./settings";

export function circusClientHtml(opts: {
	viewer: Viewer | null;
	instanceName: string;
	origin: string;
}): string {
	const user = opts.viewer
		? {
				id: opts.viewer.id,
				screen_name: opts.viewer.screen_name,
				name: opts.viewer.name,
				avatar_url: opts.viewer.avatar_url,
				bio: opts.viewer.bio ?? "",
				verified_type: opts.viewer.verified_type,
			}
		: null;

	const name = opts.instanceName || "Digital Circus";

	return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} - Inicio</title>
<link rel="icon" type="image/png" href="/public/favicon.png">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css">
<style>
/* ==========================================================================
   TWITTER 2016 + DIGITAL CIRCUS THEME (BOOTSTRAP 3 BASED)
   ========================================================================== */
:root {
  --circus-red: #e63946;
  --circus-dark-red: #c1121f;
  --circus-yellow: #ffd166;
  --circus-blue: #118ab2;
  --circus-twitter-blue: #1da1f2;
  --bg-page: #e6ecf0;
  --border-color: #e1e8ed;
  --text-main: #14171a;
  --text-muted: #657786;
  --text-light: #8899a6;
}

body {
  background-color: var(--bg-page);
  color: var(--text-main);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 18px;
  padding-top: 54px;
  margin: 0;
  overflow-y: scroll;
}

a {
  color: var(--circus-blue);
  text-decoration: none;
}
a:hover, a:focus {
  color: var(--circus-red);
  text-decoration: underline;
}

/* Navbar (Twitter 2016 Fixed Top) */
.navbar-circus {
  background-color: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  min-height: 46px;
  height: 46px;
  margin-bottom: 0;
  z-index: 1030;
}
.navbar-circus .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 46px;
  padding: 0 15px;
}
.nav-links {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  height: 46px;
}
.nav-item {
  height: 46px;
  display: flex;
  align-items: center;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 46px;
  padding: 0 14px;
  color: var(--text-muted);
  font-weight: bold;
  font-size: 13px;
  border-bottom: 4px solid transparent;
  transition: border-color 0.15s, color 0.15s;
  text-decoration: none !important;
}
.nav-link:hover {
  color: var(--circus-red);
  border-bottom-color: var(--circus-red);
}
.nav-link.active {
  color: var(--circus-red);
  border-bottom-color: var(--circus-red);
}
.nav-icon {
  width: 19px;
  height: 19px;
  fill: currentColor;
}

/* Circus Tent Logo */
.circus-logo-link {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none !important;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.circus-logo-link:hover {
  transform: scale(1.1) rotate(-3deg);
}
.circus-tent-svg {
  width: 32px;
  height: 32px;
}

/* Nav Right */
.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.search-form {
  position: relative;
}
.search-input {
  background-color: #f5f8fa;
  border: 1px solid #e6ecf0;
  border-radius: 21px;
  color: var(--text-main);
  font-size: 12px;
  height: 32px;
  padding: 0 32px 0 14px;
  width: 200px;
  transition: all 0.2s;
  outline: none;
}
.search-input:focus {
  background-color: #ffffff;
  border-color: var(--circus-red);
  width: 230px;
}
.search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  color: var(--text-muted);
  cursor: pointer;
}
.nav-avatar-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
.nav-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color);
}
.btn-tweet-nav {
  background: linear-gradient(135deg, var(--circus-red), var(--circus-dark-red));
  border: none;
  border-radius: 100px;
  color: #ffffff;
  font-weight: bold;
  font-size: 13px;
  padding: 6px 16px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  transition: all 0.15s;
}
.btn-tweet-nav:hover {
  background: linear-gradient(135deg, #f04e5c, var(--circus-red));
  transform: translateY(-1px);
  color: #ffffff;
}

/* Switch Client Banner */
.beta-pill {
  background-color: var(--circus-yellow);
  color: #593e00;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

/* Main Layout Grid */
.circus-main-container {
  max-width: 1190px;
  margin: 14px auto 30px;
  padding: 0 15px;
}

/* Cards */
.module-card {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 12px;
  overflow: hidden;
}

/* Left Mini Profile Card (2016 Style) */
.profile-card-header {
  height: 95px;
  background: linear-gradient(135deg, #c1121f 25%, #780000 25%, #780000 50%, #c1121f 50%, #c1121f 75%, #780000 75%, #780000 100%);
  background-size: 40px 40px;
  position: relative;
}
.profile-card-content {
  padding: 0 14px 12px;
  position: relative;
}
.profile-card-avatar-link {
  display: inline-block;
  margin-top: -36px;
  border: 3px solid #ffffff;
  border-radius: 50%;
  background: #ffffff;
}
.profile-card-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}
.profile-card-user {
  margin-top: 6px;
}
.profile-card-name {
  font-weight: bold;
  font-size: 17px;
  line-height: 20px;
  color: var(--text-main);
  display: block;
}
.profile-card-name:hover {
  text-decoration: underline;
}
.profile-card-handle {
  color: var(--text-muted);
  font-size: 12px;
}
.profile-stats-table {
  display: flex;
  margin-top: 10px;
  border-top: 1px solid #f0f3f5;
  padding-top: 8px;
}
.profile-stat-box {
  flex: 1;
  text-align: left;
  text-decoration: none !important;
  cursor: pointer;
}
.profile-stat-label {
  color: var(--text-muted);
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
}
.profile-stat-value {
  color: var(--circus-red);
  font-size: 18px;
  font-weight: bold;
  line-height: 22px;
}

/* Guest Login Card */
.guest-login-card {
  padding: 16px;
}
.guest-login-title {
  font-size: 16px;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 12px;
}
.guest-login-form .form-group {
  margin-bottom: 10px;
}
.guest-login-btn {
  background-color: var(--circus-red);
  border: none;
  border-radius: 100px;
  font-weight: bold;
  color: #ffffff;
  width: 100%;
  padding: 8px;
}
.guest-login-btn:hover {
  background-color: var(--circus-dark-red);
  color: #ffffff;
}

/* Trends Card */
.trends-card {
  padding: 14px;
}
.trends-header {
  font-size: 17px;
  font-weight: bold;
  margin: 0 0 10px 0;
}
.trend-item {
  margin-bottom: 10px;
  display: block;
}
.trend-tag {
  font-weight: bold;
  color: var(--circus-red);
  display: block;
  font-size: 14px;
  cursor: pointer;
}
.trend-tag:hover {
  text-decoration: underline;
}
.trend-count {
  font-size: 12px;
  color: var(--text-muted);
}

/* Middle Column Composer Box (2016 Style) */
.composer-box {
  background: #fbf7ee;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 10px;
  padding: 10px 12px 10px 12px;
}
.composer-top {
  display: flex;
  gap: 10px;
}
.composer-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.composer-input-wrapper {
  flex: 1;
}
.composer-textarea {
  width: 100%;
  border: 1px solid #d2dbe0;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
  line-height: 18px;
  resize: vertical;
  min-height: 38px;
  outline: none;
  transition: min-height 0.15s, border-color 0.15s;
  background: #ffffff;
  box-sizing: border-box;
}
.composer-textarea:focus {
  min-height: 80px;
  border-color: var(--circus-red);
}
.composer-media-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.composer-media-thumb {
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}
.composer-media-thumb img, .composer-media-thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.composer-media-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
/* Poll editor */
.poll-editor {
  margin-top: 10px;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 10px;
  display: none;
}
.poll-input-row {
  margin-bottom: 6px;
}

.composer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-left: 44px;
}
.composer-tools {
  display: flex;
  align-items: center;
  gap: 6px;
}
.tool-btn {
  background: none;
  border: none;
  color: var(--circus-red);
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tool-btn:hover {
  background-color: rgba(230, 57, 70, 0.1);
}
.composer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.char-counter {
  color: var(--text-muted);
  font-size: 12px;
}
.char-counter.warning {
  color: #f77f00;
  font-weight: bold;
}
.char-counter.danger {
  color: #d62828;
  font-weight: bold;
}
.btn-tweet-submit {
  background: var(--circus-red);
  border: none;
  border-radius: 100px;
  color: #ffffff;
  font-weight: bold;
  font-size: 13px;
  padding: 6px 18px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-tweet-submit:hover:not(:disabled) {
  background: var(--circus-dark-red);
}
.btn-tweet-submit:disabled {
  opacity: 0.5;
  cursor: default;
}

/* Feed Tabs */
.stream-header-tabs {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-bottom: none;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  display: flex;
  padding: 0 10px;
}
.stream-tab {
  padding: 12px 16px;
  font-weight: bold;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 3px solid transparent;
}
.stream-tab:hover {
  color: var(--circus-red);
}
.stream-tab.active {
  color: var(--circus-red);
  border-bottom-color: var(--circus-red);
}

/* Stream / Tweet Cards */
.tweet-stream {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
.tweet-card {
  padding: 12px 14px;
  border-bottom: 1px solid #e1e8ed;
  transition: background-color 0.1s;
  position: relative;
}
.tweet-card:hover {
  background-color: #fbfbfc;
}
.tweet-repost-header {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: 48px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.tweet-main {
  display: flex;
  gap: 10px;
}
.tweet-avatar-wrap {
  flex-shrink: 0;
}
.tweet-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}
.tweet-content {
  flex: 1;
  min-width: 0;
}
.tweet-header {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}
.tweet-author-name {
  font-weight: bold;
  color: var(--text-main);
  font-size: 14px;
  cursor: pointer;
}
.tweet-author-name:hover {
  text-decoration: underline;
}
.tweet-author-handle {
  color: var(--text-muted);
  font-size: 13px;
}
.tweet-time {
  color: var(--text-light);
  font-size: 13px;
}
.tweet-body {
  font-size: 14px;
  line-height: 20px;
  white-space: pre-wrap;
  word-break: break-word;
  color: #14171a;
}
.tweet-body a {
  color: var(--circus-blue);
}

/* Media Grid in Tweet */
.tweet-media-grid {
  margin-top: 10px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e1e8ed;
  max-height: 380px;
  display: grid;
  gap: 2px;
}
.tweet-media-grid.grid-1 {
  grid-template-columns: 1fr;
}
.tweet-media-grid.grid-2 {
  grid-template-columns: 1fr 1fr;
}
.tweet-media-grid.grid-3 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.tweet-media-grid.grid-3 .media-item:first-child {
  grid-row: span 2;
}
.tweet-media-grid.grid-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.media-item {
  width: 100%;
  height: 100%;
  min-height: 150px;
  max-height: 380px;
  object-fit: cover;
  cursor: pointer;
  background-color: #000;
  display: block;
}
.tweet-video-player {
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
  background: #000;
  margin-top: 8px;
}

/* Quote Tweet Box */
.quote-card {
  margin-top: 10px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 10px;
  background: #ffffff;
  cursor: pointer;
  transition: background-color 0.1s;
}
.quote-card:hover {
  background-color: #f7fafc;
}
.quote-header {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
}

/* Poll Box */
.tweet-poll-box {
  margin-top: 10px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 10px;
  background: #ffffff;
}
.poll-choice-btn {
  display: block;
  width: 100%;
  text-align: left;
  border: 1px solid var(--circus-blue);
  background: #ffffff;
  color: var(--circus-blue);
  font-weight: bold;
  padding: 8px 12px;
  border-radius: 100px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.poll-choice-btn:hover {
  background-color: rgba(17, 138, 178, 0.1);
}
.poll-result-bar {
  position: relative;
  height: 30px;
  background: #eef2f5;
  border-radius: 4px;
  margin-bottom: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 13px;
}
.poll-bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: #cce3ed;
  z-index: 1;
}
.poll-bar-fill.voted {
  background: #bce0fd;
}
.poll-bar-text {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  width: 100%;
}

/* Tweet Actions Row */
.tweet-actions {
  display: flex;
  gap: 28px;
  margin-top: 10px;
  color: var(--text-muted);
}
.action-btn {
  background: none;
  border: none;
  padding: 0;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  transition: color 0.15s;
}
.action-btn:hover {
  color: var(--circus-red);
}
.action-btn.reposted {
  color: #17bf63;
}
.action-btn.liked {
  color: #e0245e;
}
.action-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* Right Column (Who to follow & Info) */
.who-to-follow-card {
  padding: 14px;
}
.follow-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f3f5;
}
.follow-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.follow-info {
  flex: 1;
  min-width: 0;
}
.follow-name {
  font-weight: bold;
  font-size: 13px;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}
.follow-handle {
  color: var(--text-muted);
  font-size: 12px;
  display: block;
}
.btn-follow {
  background-color: #ffffff;
  border: 1px solid var(--circus-red);
  color: var(--circus-red);
  font-weight: bold;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-follow:hover {
  background-color: rgba(230, 57, 70, 0.1);
}
.btn-follow.following {
  background-color: var(--circus-red);
  color: #ffffff;
}
.btn-follow.following:hover {
  background-color: var(--circus-dark-red);
}

.footer-info-card {
  padding: 12px 14px;
  font-size: 12px;
  color: var(--text-light);
  line-height: 16px;
}
.footer-info-card a {
  color: var(--text-muted);
  margin-right: 6px;
}

/* Lightbox Modal */
.lightbox-modal {
  display: none;
  position: fixed;
  z-index: 2000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.lightbox-img {
  max-width: 90%;
  max-height: 90vh;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

/* Toast */
.circus-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #333333;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 100px;
  font-size: 14px;
  z-index: 3000;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
.circus-toast.show {
  opacity: 1;
}
</style>
</head>
<body>

<!-- TOP NAVBAR (2016 Style) -->
<nav class="navbar navbar-default navbar-fixed-top navbar-circus">
  <div class="container">
    <ul class="nav-links">
      <li class="nav-item">
        <a class="nav-link active" id="nav-home" onclick="circusApp.switchFeed('all')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span>Inicio</span>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" id="nav-notifs" onclick="circusApp.showNotice('Las notificaciones del Circo llegarán pronto.')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
          <span>Notificaciones</span>
        </a>
      </li>
    </ul>

    <!-- Center Logo -->
    <a class="circus-logo-link" onclick="circusApp.switchFeed('all')" title="${name}">
      <svg class="circus-tent-svg" viewBox="0 0 64 64">
        <!-- Circus Big Top Tent -->
        <path d="M32 4 L28 14 L36 14 Z" fill="#ffd166"/>
        <path d="M32 4 L44 8 L32 14 Z" fill="#e63946"/>
        <path d="M4 32 Q32 14 60 32 L56 56 L8 56 Z" fill="#c1121f"/>
        <!-- Stripes -->
        <path d="M16 28 Q32 14 32 32 L26 56 L12 56 Z" fill="#ffd166"/>
        <path d="M48 28 Q32 14 32 32 L38 56 L52 56 Z" fill="#ffd166"/>
        <!-- Entrance -->
        <path d="M26 56 Q32 40 38 56 Z" fill="#14171a"/>
        <!-- Roof valance -->
        <path d="M4 32 Q8 36 12 32 Q16 36 20 32 Q24 36 28 32 Q32 36 36 32 Q40 36 44 32 Q48 36 52 32 Q56 36 60 32 L60 30 Q32 12 4 30 Z" fill="#ffd166"/>
      </svg>
    </a>

    <!-- Nav Right -->
    <div class="nav-right">
      <div class="search-form">
        <input type="text" class="search-input" id="circus-search-input" placeholder="Buscar en el Circo..." onkeydown="if(event.key==='Enter') circusApp.searchPosts(this.value)">
        <button class="search-btn" onclick="circusApp.searchPosts(document.getElementById('circus-search-input').value)">
          <svg style="width:14px;height:14px;fill:currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        </button>
      </div>

      ${
				user
					? `
        <div class="dropdown">
          <button class="nav-avatar-btn dropdown-toggle" data-toggle="dropdown" id="userMenuDropdown">
            <img class="nav-avatar" src="${user.avatar_url || "/public/icon-dark.png"}" alt="${user.screen_name}">
          </button>
          <ul class="dropdown-menu dropdown-menu-right">
            <li class="dropdown-header"><b>${user.name}</b><br><span style="color:#657786">@${user.screen_name}</span></li>
            <li role="separator" class="divider"></li>
            <li><a href="javascript:void(0)" onclick="circusApp.viewProfile('${user.screen_name}')">Ver mi perfil</a></li>
            <li><a href="/?beta=0">Salir de Beta (Cliente Moderno)</a></li>
            <li role="separator" class="divider"></li>
            <li><a href="javascript:void(0)" onclick="circusApp.logout()">Cerrar sesión</a></li>
          </ul>
        </div>
        <button class="btn-tweet-nav" onclick="circusApp.focusComposer()">Twittear</button>
      `
					: `
        <a href="/" class="btn btn-default btn-sm" style="font-weight:bold">Iniciar sesión</a>
      `
			}
    </div>
  </div>
</nav>

<!-- MAIN CONTAINER (3 Columns) -->
<div class="container circus-main-container">
  <div class="row">
    <!-- LEFT COLUMN (290px) -->
    <div class="col-md-3">
      <div id="left-profile-container"></div>
      
      <!-- Trends Card -->
      <div class="module-card trends-card">
        <h4 class="trends-header">Tendencias para ti</h4>
        <div id="trends-list">
          <div class="trend-item"><span class="trend-tag" onclick="circusApp.searchPosts('#CircoDigital')">#CircoDigital</span><span class="trend-count">El show principal</span></div>
          <div class="trend-item"><span class="trend-tag" onclick="circusApp.searchPosts('#Pomni')">#Pomni</span><span class="trend-count">Aventuras</span></div>
          <div class="trend-item"><span class="trend-tag" onclick="circusApp.searchPosts('#Caine')">#Caine</span><span class="trend-count">Anuncios</span></div>
        </div>
      </div>
    </div>

    <!-- MIDDLE COLUMN (590px) -->
    <div class="col-md-6">
      <!-- Composer Box (If signed in) -->
      <div id="composer-container"></div>

      <!-- Feed Switcher Tabs -->
      <div class="stream-header-tabs">
        <div class="stream-tab active" id="tab-feed-all" onclick="circusApp.switchFeed('all')">Para ti (Circo)</div>
        <div class="stream-tab" id="tab-feed-following" onclick="circusApp.switchFeed('following')">Siguiendo</div>
      </div>

      <!-- Stream of Tweets -->
      <div class="tweet-stream" id="tweet-stream">
        <div style="padding:40px;text-align:center;color:#657786" id="stream-loading">
          <p style="font-size:16px;font-weight:bold;margin-bottom:8px">Cargando el Circo...</p>
          <p>Preparando los mejores actos del día.</p>
        </div>
      </div>
      
      <div style="text-align:center;margin:15px 0" id="load-more-wrap">
        <button class="btn btn-default" id="load-more-btn" onclick="circusApp.loadMore()" style="display:none;font-weight:bold;border-radius:100px;padding:8px 24px">Cargar más posts</button>
      </div>
    </div>

    <!-- RIGHT COLUMN (290px) -->
    <div class="col-md-3">
      <!-- Who to Follow -->
      <div class="module-card who-to-follow-card">
        <h4 class="trends-header" style="margin-bottom:12px">A quién seguir</h4>
        <div id="suggestions-list">
          <p style="color:#657786;font-size:12px">Buscando personajes...</p>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="module-card footer-info-card">
        <p style="margin-bottom:8px">
          <a href="/tos">Términos</a>
          <a href="/privacy">Privacidad</a>
          <a href="/rules">Reglas</a>
          <a href="/?beta=0" style="color:var(--circus-red);font-weight:bold">Modo Moderno</a>
        </p>
        <p style="margin:0">© 2026 ${name}. Cliente clásico inspirado en 2016.</p>
      </div>
    </div>
  </div>
</div>

<!-- Lightbox Modal -->
<div class="lightbox-modal" id="lightbox-modal" onclick="this.style.display='none'">
  <img class="lightbox-img" id="lightbox-img" src="" alt="Vista previa">
</div>

<!-- Toast -->
<div class="circus-toast" id="circus-toast"></div>

<!-- Bootstrap JS & jQuery for Dropdowns -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/js/bootstrap.min.js"></script>

<script>
/* ==========================================================================
   CIRCUS 2016 CLIENT APPLICATION LOGIC
   ========================================================================== */
window.__VIEWER__ = ${JSON.stringify(user)};

const circusApp = {
  viewer: window.__VIEWER__,
  feedType: 'all',
  nextCursor: null,
  isLoading: false,
  composerMediaIds: [],
  composerPollActive: false,

  init() {
    this.renderLeftColumn();
    this.renderComposer();
    this.loadTimeline();
    this.loadTrends();
    this.loadSuggestions();
  },

  showNotice(msg) {
    const toast = document.getElementById('circus-toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  },

  renderLeftColumn() {
    const el = document.getElementById('left-profile-container');
    if (this.viewer) {
      el.innerHTML = \`
        <div class="module-card">
          <div class="profile-card-header"></div>
          <div class="profile-card-content">
            <a class="profile-card-avatar-link" onclick="circusApp.viewProfile('\${this.viewer.screen_name}')">
              <img class="profile-card-avatar" src="\${this.viewer.avatar_url || '/public/icon-dark.png'}" alt="\${this.viewer.screen_name}">
            </a>
            <div class="profile-card-user">
              <a class="profile-card-name" onclick="circusApp.viewProfile('\${this.viewer.screen_name}')">\${this.escape(this.viewer.name)}</a>
              <span class="profile-card-handle">@\${this.escape(this.viewer.screen_name)}</span>
            </div>
            <div class="profile-stats-table" id="my-profile-stats">
              <a class="profile-stat-box" onclick="circusApp.viewProfile('\${this.viewer.screen_name}')">
                <span class="profile-stat-label">Posts</span>
                <span class="profile-stat-value" id="stat-posts">-</span>
              </a>
              <a class="profile-stat-box" onclick="circusApp.viewProfile('\${this.viewer.screen_name}')">
                <span class="profile-stat-label">Siguiendo</span>
                <span class="profile-stat-value" id="stat-following">-</span>
              </a>
              <a class="profile-stat-box" onclick="circusApp.viewProfile('\${this.viewer.screen_name}')">
                <span class="profile-stat-label">Seguidores</span>
                <span class="profile-stat-value" id="stat-followers">-</span>
              </a>
            </div>
          </div>
        </div>
      \`;
      this.fetchUserStats(this.viewer.screen_name);
    } else {
      el.innerHTML = \`
        <div class="module-card guest-login-card">
          <h4 class="guest-login-title">¿Tienes una cuenta?</h4>
          <form class="guest-login-form" onsubmit="circusApp.handleLogin(event)">
            <div class="form-group">
              <input type="text" class="form-control input-sm" id="login-user" placeholder="Usuario o correo" required>
            </div>
            <div class="form-group">
              <input type="password" class="form-control input-sm" id="login-pass" placeholder="Contraseña" required>
            </div>
            <button type="submit" class="guest-login-btn">Iniciar sesión</button>
          </form>
          <p style="margin-top:12px;font-size:12px;color:#657786;text-align:center">
            ¿Nuevo en el Circo? <a href="/?staff=1">Regístrate aquí</a>
          </p>
        </div>
      \`;
    }
  },

  async fetchUserStats(handle) {
    try {
      const res = await fetch('/api/v1/users/' + encodeURIComponent(handle));
      const json = await res.json();
      if (json.data && json.data.counts) {
        document.getElementById('stat-posts').textContent = json.data.counts.posts ?? 0;
        document.getElementById('stat-following').textContent = json.data.counts.following ?? 0;
        document.getElementById('stat-followers').textContent = json.data.counts.followers ?? 0;
      }
    } catch {}
  },

  renderComposer() {
    const el = document.getElementById('composer-container');
    if (!this.viewer) {
      el.innerHTML = \`
        <div class="module-card" style="padding:16px;background:#fff;border-left:4px solid var(--circus-red)">
          <h4 style="margin-top:0;font-weight:bold;color:var(--circus-red)">🎪 ¡Bienvenido a Digital Circus!</h4>
          <p style="margin-bottom:12px;color:#657786">Entérate de lo que está sucediendo en el Circo ahora mismo y conversa con otros personajes.</p>
          <a href="/?staff=1" class="btn btn-primary btn-sm" style="font-weight:bold;background:var(--circus-red);border:none;border-radius:100px;padding:6px 18px">Únete a la función</a>
        </div>
      \`;
      return;
    }

    el.innerHTML = \`
      <div class="composer-box">
        <div class="composer-top">
          <img class="composer-avatar" src="\${this.viewer.avatar_url || '/public/icon-dark.png'}" alt="\${this.viewer.screen_name}">
          <div class="composer-input-wrapper">
            <textarea class="composer-textarea" id="tweet-textarea" placeholder="¡¿Qué está pasando en el Circo?!" oninput="circusApp.onComposerInput(this)"></textarea>
            
            <div class="composer-media-previews" id="composer-media-previews"></div>

            <div class="poll-editor" id="poll-editor">
              <div class="poll-input-row"><input type="text" class="form-control input-sm poll-choice" placeholder="Opción 1" maxlength="25"></div>
              <div class="poll-input-row"><input type="text" class="form-control input-sm poll-choice" placeholder="Opción 2" maxlength="25"></div>
              <div class="poll-input-row"><input type="text" class="form-control input-sm poll-choice" placeholder="Opción 3 (opcional)" maxlength="25"></div>
              <div class="poll-input-row"><input type="text" class="form-control input-sm poll-choice" placeholder="Opción 4 (opcional)" maxlength="25"></div>
            </div>
          </div>
        </div>

        <div class="composer-toolbar">
          <div class="composer-tools">
            <input type="file" id="media-file-input" style="display:none" accept="image/*,video/mp4" multiple onchange="circusApp.handleMediaUpload(this.files)">
            <button class="tool-btn" onclick="document.getElementById('media-file-input').click()" title="Añadir fotos o video">
              <svg style="width:20px;height:20px;fill:currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z"/></svg>
            </button>
            <button class="tool-btn" onclick="circusApp.togglePollEditor()" title="Crear encuesta">
              <svg style="width:20px;height:20px;fill:currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/></svg>
            </button>
          </div>
          <div class="composer-actions">
            <span class="char-counter" id="char-counter">280</span>
            <button class="btn-tweet-submit" id="btn-submit-tweet" disabled onclick="circusApp.submitTweet()">Twittear</button>
          </div>
        </div>
      </div>
    \`;
  },

  focusComposer() {
    const txt = document.getElementById('tweet-textarea');
    if (txt) {
      txt.focus();
      txt.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  onComposerInput(textarea) {
    const len = textarea.value.length;
    const remaining = 280 - len;
    const counter = document.getElementById('char-counter');
    const btn = document.getElementById('btn-submit-tweet');

    counter.textContent = remaining;
    counter.className = 'char-counter' + (remaining < 0 ? ' danger' : remaining < 20 ? ' warning' : '');
    btn.disabled = (len === 0 && this.composerMediaIds.length === 0) || remaining < 0;
  },

  togglePollEditor() {
    this.composerPollActive = !this.composerPollActive;
    const editor = document.getElementById('poll-editor');
    if (editor) editor.style.display = this.composerPollActive ? 'block' : 'none';
  },

  async handleMediaUpload(files) {
    if (!files || !files.length) return;
    for (const file of Array.from(files)) {
      if (this.composerMediaIds.length >= 4) {
        this.showNotice('Máximo 4 imágenes por post.');
        break;
      }
      const formData = new FormData();
      formData.set('media', file);
      this.showNotice('Subiendo archivo...');
      try {
        const res = await fetch('/api/v1/media', { method: 'POST', body: formData });
        const json = await res.json();
        if (json.data && json.data.media_id) {
          const mediaId = json.data.media_id;
          this.composerMediaIds.push(mediaId);
          
          const previewWrap = document.getElementById('composer-media-previews');
          const thumb = document.createElement('div');
          thumb.className = 'composer-media-thumb';
          thumb.id = 'thumb-' + mediaId;
          const url = URL.createObjectURL(file);
          if (file.type.startsWith('video/')) {
            thumb.innerHTML = '<video src="' + url + '"></video><button class="composer-media-remove" onclick="circusApp.removeMedia(\\'' + mediaId + '\\')">×</button>';
          } else {
            thumb.innerHTML = '<img src="' + url + '"><button class="composer-media-remove" onclick="circusApp.removeMedia(\\'' + mediaId + '\\')">×</button>';
          }
          previewWrap.appendChild(thumb);
          this.onComposerInput(document.getElementById('tweet-textarea'));
        }
      } catch (err) {
        this.showNotice('Error al subir archivo.');
      }
    }
  },

  removeMedia(id) {
    this.composerMediaIds = this.composerMediaIds.filter(m => m !== id);
    const thumb = document.getElementById('thumb-' + id);
    if (thumb) thumb.remove();
    this.onComposerInput(document.getElementById('tweet-textarea'));
  },

  async submitTweet() {
    const textarea = document.getElementById('tweet-textarea');
    const text = textarea ? textarea.value.trim() : '';
    const btn = document.getElementById('btn-submit-tweet');
    if (!text && this.composerMediaIds.length === 0) return;

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const payload = {
      text,
      media_ids: this.composerMediaIds
    };

    if (this.composerPollActive) {
      const inputs = document.querySelectorAll('.poll-choice');
      const choices = Array.from(inputs).map(i => i.value.trim()).filter(Boolean);
      if (choices.length >= 2) {
        payload.poll = { choices, duration_minutes: 1440 };
      }
    }

    try {
      const res = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.data) {
        textarea.value = '';
        this.composerMediaIds = [];
        this.composerPollActive = false;
        document.getElementById('composer-media-previews').innerHTML = '';
        const pEditor = document.getElementById('poll-editor');
        if (pEditor) pEditor.style.display = 'none';
        this.onComposerInput(textarea);
        this.showNotice('¡Twitteado!');
        this.loadTimeline();
        if (this.viewer) this.fetchUserStats(this.viewer.screen_name);
      } else {
        this.showNotice(json.error || 'No se pudo publicar.');
      }
    } catch (e) {
      this.showNotice('Error al conectar.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Twittear';
    }
  },

  switchFeed(type) {
    this.feedType = type;
    document.getElementById('tab-feed-all').classList.toggle('active', type === 'all');
    document.getElementById('tab-feed-following').classList.toggle('active', type === 'following');
    this.nextCursor = null;
    this.loadTimeline();
  },

  async loadTimeline(cursor = null) {
    if (this.isLoading) return;
    this.isLoading = true;
    const stream = document.getElementById('tweet-stream');
    const loadBtn = document.getElementById('load-more-btn');

    if (!cursor) {
      stream.innerHTML = '<div style="padding:30px;text-align:center;color:#657786">Cargando posts...</div>';
    }

    try {
      const url = '/api/v1/timeline?feed=' + this.feedType + (cursor ? '&cursor=' + cursor : '');
      const res = await fetch(url);
      const json = await res.json();
      const items = json.data || [];

      if (!cursor) stream.innerHTML = '';

      if (items.length === 0 && !cursor) {
        stream.innerHTML = '<div style="padding:40px;text-align:center;color:#657786"><p style="font-size:16px;font-weight:bold">No hay posts todavía.</p><p>¡Sé el primero en compartir algo en el Circo!</p></div>';
        loadBtn.style.display = 'none';
      } else {
        items.forEach(post => {
          stream.insertAdjacentHTML('beforeend', this.renderTweetCard(post));
        });
        this.nextCursor = json.next_cursor;
        loadBtn.style.display = this.nextCursor ? 'inline-block' : 'none';
      }
    } catch (err) {
      if (!cursor) stream.innerHTML = '<div style="padding:30px;text-align:center;color:#d90429">Error al cargar posts.</div>';
    } finally {
      this.isLoading = false;
    }
  },

  loadMore() {
    if (this.nextCursor) {
      this.loadTimeline(this.nextCursor);
    }
  },

  renderTweetCard(p) {
    const author = p.author || {};
    const formattedText = this.formatTweetText(p.text);
    const timeAgo = this.formatTimeAgo(p.created_at);

    // Repost header
    let repostHtml = '';
    if (p.reposted_by) {
      repostHtml = \`
        <div class="tweet-repost-header">
          <svg style="width:14px;height:14px;fill:currentColor" viewBox="0 0 24 24"><path d="M23.615 15.477l-3.398-3.398c-.146-.146-.339-.22-.531-.22s-.385.073-.531.22c-.293.293-.293.768 0 1.061l2.119 2.119H12.25c-.414 0-.75.336-.75.75s.336.75.75.75h9.023l-2.119 2.119c-.293.293-.293.768 0 1.061.146.146.339.22.531.22s.385-.073.531-.22l3.398-3.398c.293-.293.293-.768 0-1.061zM11.75 8.25H2.727l2.119-2.119c.293-.293.293-.768 0-1.061s-.768-.293-1.061 0L.385 8.468c-.293.293-.293.768 0 1.061l3.398 3.398c.146.146.339.22.531.22s.385-.073.531-.22c.293-.293.293-.768 0-1.061L2.727 9.75h9.023c.414 0 .75-.336.75-.75s-.336-.75-.75-.75z"/></svg>
          <span>\${this.escape(p.reposted_by.name)} reposteó</span>
        </div>
      \`;
    }

    // Media
    let mediaHtml = '';
    const media = p.media || [];
    if (media.length > 0) {
      const video = media.find(m => m.type === 'video');
      if (video) {
        mediaHtml = \`<video class="tweet-video-player" src="\${video.url}" poster="\${video.poster_url || ''}" controls playsinline preload="metadata"></video>\`;
      } else {
        const count = Math.min(media.length, 4);
        mediaHtml = \`<div class="tweet-media-grid grid-\${count}">\`;
        media.slice(0, 4).forEach(m => {
          mediaHtml += \`<img class="media-item" src="\${m.url}" loading="lazy" onclick="circusApp.openLightbox('\${m.url}')">\`;
        });
        mediaHtml += \`</div>\`;
      }
    }

    // Quoted Post
    let quoteHtml = '';
    if (p.quoted) {
      const q = p.quoted;
      const qAuthor = q.author || {};
      quoteHtml = \`
        <div class="quote-card" onclick="circusApp.viewPost('\${q.id}')">
          <div class="quote-header">
            <b>\${this.escape(qAuthor.name)}</b>
            <span class="tweet-author-handle">@\${this.escape(qAuthor.screen_name)}</span>
            <span class="tweet-time">· \${this.formatTimeAgo(q.created_at)}</span>
          </div>
          <div style="font-size:13px;line-height:18px">\${this.formatTweetText(q.text)}</div>
        </div>
      \`;
    }

    // Poll
    let pollHtml = '';
    if (p.poll) {
      const poll = p.poll;
      const choices = poll.choices || [];
      const counts = poll.counts || [];
      const total = poll.total_votes || 0;
      const hasVoted = poll.voted !== null && poll.voted !== undefined;

      pollHtml = '<div class="tweet-poll-box">';
      choices.forEach((choice, idx) => {
        const choiceNum = idx + 1;
        const count = counts[idx] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        if (!hasVoted && !poll.closed && circusApp.viewer) {
          pollHtml += \`<button class="poll-choice-btn" onclick="circusApp.votePoll('\${poll.id}', \${choiceNum})">\${this.escape(choice)}</button>\`;
        } else {
          pollHtml += \`
            <div class="poll-result-bar">
              <div class="poll-bar-fill \${poll.voted === choiceNum ? 'voted' : ''}" style="width:\${pct}%"></div>
              <div class="poll-bar-text">
                <span><b>\${this.escape(choice)}</b> \${poll.voted === choiceNum ? '✓' : ''}</span>
                <span><b>\${pct}%</b> (\${count})</span>
              </div>
            </div>
          \`;
        }
      });
      pollHtml += \`<div style="font-size:12px;color:#657786;margin-top:6px">\${total} votos \${poll.closed ? '· Resultados finales' : ''}</div></div>\`;
    }

    const isLiked = p.viewer && p.viewer.liked;
    const isReposted = p.viewer && p.viewer.reposted;
    const canDelete = this.viewer && author.id === this.viewer.id;

    return \`
      <div class="tweet-card" id="tweet-\${p.id}">
        \${repostHtml}
        <div class="tweet-main">
          <div class="tweet-avatar-wrap">
            <img class="tweet-avatar" src="\${author.avatar_url || '/public/icon-dark.png'}" alt="\${author.screen_name}" onclick="circusApp.viewProfile('\${author.screen_name}')">
          </div>
          <div class="tweet-content">
            <div class="tweet-header">
              <span class="tweet-author-name" onclick="circusApp.viewProfile('\${author.screen_name}')">\${this.escape(author.name)}</span>
              <span class="tweet-author-handle">@\${this.escape(author.screen_name)}</span>
              <span class="tweet-time">· \${timeAgo}</span>
            </div>
            <div class="tweet-body" id="text-\${p.id}">\${formattedText}</div>
            \${mediaHtml}
            \${quoteHtml}
            \${pollHtml}
            
            <div class="tweet-actions">
              <button class="action-btn" onclick="circusApp.openReplyModal('\${p.id}', '\${author.screen_name}')" title="Responder">
                <svg class="action-icon" viewBox="0 0 24 24"><path d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.04-6.312v-.017c-.002-4.373-3.429-7.79-7.797-7.79zm6.297 7.788c0 1.906-.93 3.82-2.502 5.15-1.38 1.168-6.19 4.498-7.34 5.343v-2.923c0-.414-.336-.75-.75-.75-3.666-.14-6.197-2.73-6.197-6.03 0-3.55 2.77-6.302 6.3-6.302l4.147.01h.002c3.53 0 6.34 2.768 6.34 6.298v.014z"/></svg>
                <span>\${p.counts?.replies || 0}</span>
              </button>

              <button class="action-btn \${isReposted ? 'reposted' : ''}" onclick="circusApp.toggleRepost('\${p.id}', \${!!isReposted})" title="Retwittear">
                <svg class="action-icon" viewBox="0 0 24 24"><path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z"/></svg>
                <span>\${p.counts?.reposts || 0}</span>
              </button>

              <button class="action-btn \${isLiked ? 'liked' : ''}" onclick="circusApp.toggleLike('\${p.id}', \${!!isLiked})" title="Me gusta">
                <svg class="action-icon" viewBox="0 0 24 24"><path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.224c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.52-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z"/></svg>
                <span>\${p.counts?.likes || 0}</span>
              </button>

              <button class="action-btn" onclick="circusApp.translateTweet('\${p.id}')" title="Traducir">
                <svg class="action-icon" viewBox="0 0 24 24"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>
              </button>

              \${canDelete ? \`
                <button class="action-btn" onclick="circusApp.deletePost('\${p.id}')" title="Eliminar post">
                  <svg class="action-icon" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
              \` : ''}
            </div>
          </div>
        </div>
      </div>
    \`;
  },

  async toggleLike(id, currentLiked) {
    if (!this.viewer) return this.showNotice('Inicia sesión para dar Me gusta.');
    try {
      const res = await fetch('/api/v1/posts/' + id + '/like', { method: currentLiked ? 'DELETE' : 'POST' });
      const json = await res.json();
      if (json.data) {
        this.updateCardInDom(json.data);
      }
    } catch {}
  },

  async toggleRepost(id, currentReposted) {
    if (!this.viewer) return this.showNotice('Inicia sesión para retwittear.');
    try {
      const res = await fetch('/api/v1/posts/' + id + '/repost', { method: currentReposted ? 'DELETE' : 'POST' });
      const json = await res.json();
      if (json.data) {
        this.updateCardInDom(json.data);
      }
    } catch {}
  },

  async deletePost(id) {
    if (!confirm('¿Eliminar este post? No podrás recuperarlo.')) return;
    try {
      const res = await fetch('/api/v1/posts/' + id, { method: 'DELETE' });
      const json = await res.json();
      if (json.data && json.data.deleted) {
        const card = document.getElementById('tweet-' + id);
        if (card) card.remove();
        this.showNotice('Post eliminado.');
        if (this.viewer) this.fetchUserStats(this.viewer.screen_name);
      }
    } catch {}
  },

  async votePoll(pollId, choiceNum) {
    if (!this.viewer) return this.showNotice('Inicia sesión para votar.');
    try {
      const res = await fetch('/api/v1/polls/' + pollId + '/vote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ choice: choiceNum })
      });
      const json = await res.json();
      if (json.data) {
        this.showNotice('Voto registrado.');
        this.loadTimeline();
      }
    } catch {}
  },

  async translateTweet(id) {
    const textEl = document.getElementById('text-' + id);
    if (!textEl) return;
    this.showNotice('Traduciendo...');
    try {
      const res = await fetch('/api/v1/posts/' + id + '/translate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ target_lang: 'es' })
      });
      const json = await res.json();
      if (json.data && json.data.text) {
        textEl.innerHTML = '<span style="color:#657786;font-size:12px;display:block;margin-bottom:4px">🌐 Traducido del ' + json.data.source_lang + ':</span>' + this.formatTweetText(json.data.text);
      } else {
        this.showNotice('No se pudo traducir.');
      }
    } catch {
      this.showNotice('Error al traducir.');
    }
  },

  updateCardInDom(updatedPost) {
    const card = document.getElementById('tweet-' + updatedPost.id);
    if (card) {
      card.outerHTML = this.renderTweetCard(updatedPost);
    }
  },

  async loadTrends() {
    try {
      const res = await fetch('/api/v1/trends');
      const json = await res.json();
      const trends = json.data || [];
      const listEl = document.getElementById('trends-list');
      if (trends.length > 0 && listEl) {
        listEl.innerHTML = '';
        trends.forEach(t => {
          listEl.innerHTML += \`
            <div class="trend-item">
              <span class="trend-tag" onclick="circusApp.searchPosts('#\${circusApp.escape(t.tag)}')">#\${circusApp.escape(t.tag)}</span>
              <span class="trend-count">\${t.posts} posts</span>
            </div>
          \`;
        });
      }
    } catch {}
  },

  async loadSuggestions() {
    try {
      const res = await fetch('/api/v1/suggestions');
      const json = await res.json();
      const users = json.data || [];
      const listEl = document.getElementById('suggestions-list');
      if (users.length > 0 && listEl) {
        listEl.innerHTML = '';
        users.forEach(u => {
          const isFollowing = u.viewer && u.viewer.following;
          listEl.innerHTML += \`
            <div class="follow-item" id="user-suggest-\${u.id}">
              <img class="follow-avatar" src="\${u.avatar_url || '/public/icon-dark.png'}" alt="\${u.screen_name}" onclick="circusApp.viewProfile('\${u.screen_name}')">
              <div class="follow-info">
                <span class="follow-name" onclick="circusApp.viewProfile('\${u.screen_name}')">\${circusApp.escape(u.name)}</span>
                <span class="follow-handle">@\${circusApp.escape(u.screen_name)}</span>
              </div>
              <button class="btn-follow \${isFollowing ? 'following' : ''}" onclick="circusApp.toggleFollow('\${u.screen_name}', \${!!isFollowing}, '\${u.id}')">
                \${isFollowing ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>
          \`;
        });
      }
    } catch {}
  },

  async toggleFollow(handle, isFollowing, userId) {
    if (!this.viewer) return this.showNotice('Inicia sesión para seguir cuentas.');
    try {
      const res = await fetch('/api/v1/users/' + encodeURIComponent(handle) + '/follow', {
        method: isFollowing ? 'DELETE' : 'POST'
      });
      const json = await res.json();
      if (json.data) {
        this.loadSuggestions();
        if (this.viewer) this.fetchUserStats(this.viewer.screen_name);
        this.showNotice(isFollowing ? 'Dejaste de seguir a @' + handle : 'Siguiendo a @' + handle);
      }
    } catch {}
  },

  async searchPosts(query) {
    if (!query || !query.trim()) return;
    const q = query.trim();
    document.getElementById('circus-search-input').value = q;
    const stream = document.getElementById('tweet-stream');
    stream.innerHTML = '<div style="padding:30px;text-align:center;color:#657786">Buscando "' + this.escape(q) + '"...</div>';
    try {
      const res = await fetch('/api/v1/search/posts?q=' + encodeURIComponent(q));
      const json = await res.json();
      const items = json.data || [];
      stream.innerHTML = '<div style="padding:10px 14px;background:#f5f8fa;border-bottom:1px solid #e1e8ed;font-weight:bold;color:#14171a">Resultados para: ' + this.escape(q) + ' <a href="javascript:void(0)" onclick="circusApp.switchFeed(\\'all\\')" style="float:right;font-size:12px">✕ Limpiar</a></div>';
      if (items.length === 0) {
        stream.innerHTML += '<div style="padding:40px;text-align:center;color:#657786"><p style="font-weight:bold">No se encontraron resultados para esta búsqueda.</p></div>';
      } else {
        items.forEach(post => {
          stream.insertAdjacentHTML('beforeend', this.renderTweetCard(post));
        });
      }
    } catch {
      stream.innerHTML = '<div style="padding:30px;text-align:center;color:#d90429">Error al realizar la búsqueda.</div>';
    }
  },

  async viewProfile(handle) {
    const stream = document.getElementById('tweet-stream');
    stream.innerHTML = '<div style="padding:30px;text-align:center;color:#657786">Cargando perfil de @' + this.escape(handle) + '...</div>';
    try {
      const [uRes, pRes] = await Promise.all([
        fetch('/api/v1/users/' + encodeURIComponent(handle)),
        fetch('/api/v1/users/' + encodeURIComponent(handle) + '/posts')
      ]);
      const uJson = await uRes.json();
      const pJson = await pRes.json();
      const u = uJson.data;
      const posts = pJson.data || [];

      if (!u) {
        stream.innerHTML = '<div style="padding:40px;text-align:center;color:#657786">Usuario no encontrado.</div>';
        return;
      }

      const isFollowing = u.viewer && u.viewer.following;
      const isMe = this.viewer && u.id === this.viewer.id;

      stream.innerHTML = \`
        <div style="background:#ffffff;border-bottom:1px solid #e1e8ed;margin-bottom:10px">
          <div style="height:140px;background:linear-gradient(135deg,#c1121f,#780000);background-size:cover;background-position:center;\${u.banner_url ? "background-image:url('" + u.banner_url + "')" : ''}"></div>
          <div style="padding:0 16px 16px;position:relative">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:-45px;margin-bottom:10px">
              <img style="width:90px;height:90px;border-radius:50%;border:4px solid #fff;object-fit:cover;background:#fff" src="\${u.avatar_url || '/public/icon-dark.png'}">
              \${!isMe && this.viewer ? \`
                <button class="btn-follow \${isFollowing ? 'following' : ''}" style="padding:6px 18px;font-size:13px" onclick="circusApp.toggleFollow('\${u.screen_name}', \${!!isFollowing}, '\${u.id}')">
                  \${isFollowing ? 'Siguiendo' : 'Seguir'}
                </button>
              \` : ''}
            </div>
            <h3 style="margin:0;font-weight:bold">\${this.escape(u.name)}</h3>
            <div style="color:#657786;font-size:13px;margin-bottom:8px">@\${this.escape(u.screen_name)}</div>
            <p style="margin-bottom:12px;font-size:14px;line-height:20px">\${this.escape(u.bio || '')}</p>
            <div style="display:flex;gap:18px;font-size:13px;color:#657786;border-top:1px solid #eef2f5;padding-top:10px">
              <span><b style="color:#14171a">\${u.counts?.posts || 0}</b> Posts</span>
              <span><b style="color:#14171a">\${u.counts?.following || 0}</b> Siguiendo</span>
              <span><b style="color:#14171a">\${u.counts?.followers || 0}</b> Seguidores</span>
            </div>
          </div>
        </div>
      \`;

      if (posts.length === 0) {
        stream.innerHTML += '<div style="padding:30px;text-align:center;color:#657786">@' + this.escape(u.screen_name) + ' todavía no ha publicado nada.</div>';
      } else {
        posts.forEach(p => {
          stream.insertAdjacentHTML('beforeend', this.renderTweetCard(p));
        });
      }
    } catch {
      stream.innerHTML = '<div style="padding:30px;text-align:center;color:#d90429">Error al cargar perfil.</div>';
    }
  },

  openReplyModal(postId, handle) {
    this.focusComposer();
    const txt = document.getElementById('tweet-textarea');
    if (txt) {
      txt.value = '@' + handle + ' ';
      txt.focus();
      this.onComposerInput(txt);
    }
  },

  openLightbox(url) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    img.src = url;
    modal.style.display = 'flex';
  },

  async handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;
    if (!username || !password) return;

    this.showNotice('Iniciando sesión...');
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password)
      });
      if (res.ok) {
        window.location.reload();
      } else {
        this.showNotice('Usuario o contraseña incorrectos.');
      }
    } catch {
      this.showNotice('Error al conectar.');
    }
  },

  async logout() {
    window.location.href = '/logout';
  },

  formatTweetText(text) {
    if (!text) return '';
    let out = this.escape(text);
    // URLs
    out = out.replace(/(https?:\\/\\/[^\\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    // Hashtags
    out = out.replace(/#([\\w\\u00c0-\\u024f]+)/g, '<a href="javascript:void(0)" onclick="circusApp.searchPosts(\\'#$1\\')">#$1</a>');
    // Mentions
    out = out.replace(/@([a-zA-Z0-9_]+)/g, '<a href="javascript:void(0)" onclick="circusApp.viewProfile(\\'$1\\')">@$1</a>');
    return out;
  },

  formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    const now = Date.now();
    const diff = Math.floor((now - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return diff + 's';
    if (diff < 3600) return Math.floor(diff / 60) + 'm';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    return Math.floor(diff / 86400) + 'd';
  },

  escape(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
};

document.addEventListener('DOMContentLoaded', () => circusApp.init());
</script>
</body>
</html>`;
}
