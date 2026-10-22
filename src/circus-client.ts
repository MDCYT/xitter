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
				banner_url: opts.viewer.banner_url,
				bio: opts.viewer.bio ?? "",
				location: opts.viewer.location ?? "",
				website: opts.viewer.website ?? null,
				verified_type: opts.viewer.verified_type,
				role: opts.viewer.role ?? null,
				translator: opts.viewer.translator ?? null,
				badges: (opts.viewer.badges ?? []).map((b) => ({ id: b.id, name: b.name, url: `/public/badge-${b.id}.png` })),
				remote_badges: opts.viewer.remote_badges ?? [],
				org: opts.viewer.org ? {
					id: opts.viewer.org.id,
					name: opts.viewer.org.name,
					screen_name: opts.viewer.org.screen_name,
					avatar_url: opts.viewer.org.avatar_url,
				} : null,
				flag: opts.viewer.flag ?? null,
				language: opts.viewer.language ?? "es",
				csrf: opts.viewer.csrf || "",
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
  position: relative;
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
  position: relative;
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
  width: 180px;
  transition: all 0.2s;
  outline: none;
}
.search-input:focus {
  background-color: #ffffff;
  border-color: var(--circus-red);
  width: 210px;
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
  display: flex;
  align-items: center;
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

/* User Dropdown Menu */
.nav-user-dropdown {
  position: absolute;
  top: 44px;
  right: 0;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.175);
  min-width: 230px;
  z-index: 1050;
  display: none;
}
.nav-user-dropdown.show {
  display: block;
}
.dropdown-user-header {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-color);
}
.dropdown-user-header b {
  font-size: 14px;
  color: var(--text-main);
  display: block;
}
.dropdown-user-header small {
  color: var(--text-muted);
}
.nav-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  color: var(--text-main) !important;
  font-size: 13px;
  text-decoration: none !important;
  cursor: pointer;
  transition: background 0.15s;
}
.nav-dropdown-item:hover {
  background-color: #f5f8fa;
  color: var(--circus-red) !important;
}
.nav-dropdown-item svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex-shrink: 0;
}
.dropdown-divider {
  height: 1px;
  margin: 4px 0;
  background-color: var(--border-color);
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
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 3px;
}
.profile-card-name:hover {
  text-decoration: underline;
}
.profile-card-handle {
  color: var(--text-muted);
  font-size: 12px;
  display: block;
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
  display: block;
  line-height: 12px;
}
.profile-stat-value {
  color: var(--circus-red);
  font-size: 18px;
  font-weight: 800;
  line-height: 20px;
}

/* Badges */
.circus-badge-check {
  width: 17px;
  height: 17px;
  display: inline-block;
  vertical-align: -2px;
  margin-left: 4px;
  flex-shrink: 0;
}
.circus-badge-custom {
  width: 17px;
  height: 17px;
  border-radius: 3px;
  display: inline-block;
  vertical-align: -2px;
  margin-left: 4px;
  object-fit: cover;
  flex-shrink: 0;
}
.circus-badge-org {
  width: 17px;
  height: 17px;
  border-radius: 3px;
  display: inline-block;
  vertical-align: -2px;
  margin-left: 4px;
  object-fit: cover;
  border: 1px solid rgba(0,0,0,0.1);
  flex-shrink: 0;
}
.circus-badge-icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  vertical-align: -2px;
  margin-left: 4px;
  flex-shrink: 0;
}
.circus-badge-flag {
  width: 18px;
  height: 13px;
  display: inline-block;
  vertical-align: -1px;
  margin-left: 4px;
  border-radius: 2px;
  flex-shrink: 0;
}
.circus-label-pill {
  font-size: 11px;
  font-weight: 600;
  color: #657786;
  background-color: #f0f3f5;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  padding: 1px 6px;
  margin-left: 6px;
  display: inline-block;
  vertical-align: middle;
}

/* Composer */
.composer-box {
  background: #f5f8fa;
  border: 1px solid var(--border-color);
  border-radius: 4px 4px 0 0;
  padding: 10px 14px;
  margin-bottom: 0;
  border-bottom: 1px solid #e6ecf0;
}
.composer-top {
  display: flex;
  gap: 10px;
}
.composer-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}
.composer-input-wrapper {
  flex: 1;
}
.composer-textarea {
  width: 100%;
  border: 1px solid #cfd9de;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 18px;
  resize: vertical;
  min-height: 40px;
  max-height: 160px;
  outline: none;
  background: #ffffff;
  transition: all 0.2s;
}
.composer-textarea:focus {
  border-color: var(--circus-red);
  min-height: 75px;
}
.composer-media-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.composer-thumb-wrap {
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}
.composer-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.composer-thumb-del {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0,0,0,0.65);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  line-height: 18px;
  text-align: center;
  padding: 0;
  cursor: pointer;
}
.composer-poll-form {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 10px 12px;
  margin-top: 8px;
  display: none;
}
.composer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-left: 46px;
}
.composer-tools {
  display: flex;
  gap: 12px;
  align-items: center;
}
.composer-tool-btn {
  background: none;
  border: none;
  padding: 4px;
  color: var(--circus-red);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.composer-tool-btn:hover {
  background-color: #fee;
}
.composer-tool-icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}
.composer-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.char-counter {
  font-size: 12px;
  color: var(--text-muted);
}
.char-counter.warning {
  color: #e67e22;
  font-weight: bold;
}
.char-counter.danger {
  color: #d90429;
  font-weight: bold;
}

/* Feed Switcher Tabs */
.stream-header-tabs {
  background: #ffffff;
  border-left: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  height: 44px;
}
.stream-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 13px;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.15s;
}
.stream-tab:hover {
  background-color: #f5f8fa;
  color: var(--circus-red);
}
.stream-tab.active {
  color: var(--circus-red);
  border-bottom-color: var(--circus-red);
}

/* Tweet Stream */
.tweet-stream {
  background: #ffffff;
  border-left: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  min-height: 300px;
}
.tweet-card {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.15s;
  position: relative;
}
.tweet-card:hover {
  background-color: #f5f8fa;
}
.tweet-repost-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
  padding-left: 48px;
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
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 2px;
}
.tweet-author-name {
  font-weight: bold;
  color: var(--text-main);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}
.tweet-author-name:hover {
  text-decoration: underline;
  color: var(--circus-red);
}
.tweet-author-handle {
  color: var(--text-muted);
  font-size: 13px;
}
.tweet-time {
  color: var(--text-muted);
  font-size: 13px;
}
.tweet-body {
  font-size: 14px;
  line-height: 20px;
  color: var(--text-main);
  word-wrap: break-word;
  white-space: pre-wrap;
  margin-top: 2px;
  margin-bottom: 8px;
}
.tweet-media-grid {
  border-radius: 8px;
  overflow: hidden;
  margin-top: 8px;
  border: 1px solid var(--border-color);
  display: grid;
  gap: 2px;
  background-color: #000;
  max-height: 380px;
}
.tweet-media-grid.grid-1 { grid-template-columns: 1fr; }
.tweet-media-grid.grid-2 { grid-template-columns: 1fr 1fr; }
.tweet-media-grid.grid-3 { grid-template-columns: 1fr 1fr; }
.tweet-media-grid.grid-4 { grid-template-columns: 1fr 1fr; }
.media-item {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  display: block;
}
.tweet-video-player {
  width: 100%;
  max-height: 380px;
  border-radius: 8px;
  background-color: #000;
  margin-top: 8px;
}
.quote-card {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: 8px;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.15s;
}
.quote-card:hover {
  border-color: var(--circus-red);
}
.quote-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 13px;
  margin-bottom: 4px;
}
.tweet-poll-box {
  margin-top: 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 10px 12px;
  background-color: #fcfcfc;
}
.poll-choice-btn {
  width: 100%;
  text-align: left;
  background: #ffffff;
  border: 1px solid var(--circus-blue);
  color: var(--circus-blue);
  font-weight: bold;
  border-radius: 100px;
  padding: 6px 14px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.poll-choice-btn:hover {
  background-color: #f0f7fa;
}
.poll-result-bar {
  position: relative;
  background-color: #e6ecf0;
  border-radius: 4px;
  height: 28px;
  margin-bottom: 6px;
  overflow: hidden;
}
.poll-bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: rgba(17, 138, 178, 0.2);
}
.poll-bar-fill.voted {
  background: rgba(230, 57, 70, 0.25);
}
.poll-bar-text {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
  font-size: 13px;
}

/* Actions Row */
.tweet-actions {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-top: 8px;
  color: var(--text-muted);
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 0;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
  transition: color 0.15s;
}
.action-btn:hover {
  color: var(--circus-blue);
}
.action-btn.liked {
  color: var(--circus-red);
}
.action-btn.reposted {
  color: #2ecc71;
}
.action-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* Right Column Widgets */
.trends-card {
  padding: 12px 14px;
}
.trends-header {
  margin: 0 0 10px 0;
  font-size: 17px;
  font-weight: bold;
  color: var(--text-main);
}
.trend-item {
  padding: 6px 0;
  border-bottom: 1px solid #f5f8fa;
}
.trend-tag {
  font-weight: bold;
  color: var(--circus-red);
  cursor: pointer;
  display: block;
}
.trend-tag:hover {
  text-decoration: underline;
}
.trend-count {
  font-size: 12px;
  color: var(--text-muted);
}

.who-to-follow-card {
  padding: 12px 14px;
}
.suggest-user-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f8fa;
}
.suggest-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}
.suggest-info {
  flex: 1;
  min-width: 0;
}
.suggest-name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 3px;
}
.suggest-name {
  font-weight: bold;
  font-size: 13px;
  color: var(--text-main);
  cursor: pointer;
}
.suggest-name:hover {
  text-decoration: underline;
  color: var(--circus-red);
}
.suggest-handle {
  color: var(--text-muted);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.btn-follow {
  background: #ffffff;
  border: 1px solid var(--circus-red);
  color: var(--circus-red);
  font-weight: bold;
  font-size: 12px;
  border-radius: 100px;
  padding: 4px 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-follow:hover {
  background: #fee;
}
.btn-follow.following {
  background: var(--circus-red);
  color: #ffffff;
  border-color: var(--circus-red);
}

/* Footer Card */
.footer-info-card {
  padding: 12px 14px;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 18px;
}
.footer-info-card a {
  color: var(--text-muted);
  margin-right: 8px;
}
.footer-info-card a:hover {
  color: var(--circus-red);
}

/* ==========================================================================
   TWITTER 2016 PROFILE VIEW
   ========================================================================== */
#profile-view {
  display: none;
}
.profile-canopy {
  width: 100%;
  height: 275px;
  background-color: #c1121f;
  background: linear-gradient(135deg, #c1121f 25%, #780000 25%, #780000 50%, #c1121f 50%, #c1121f 75%, #780000 75%, #780000 100%);
  background-size: 40px 40px;
  background-position: center;
  position: relative;
}
.profile-canopy.has-banner {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
.profile-nav-bar {
  background-color: #ffffff;
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  height: 60px;
  position: relative;
  z-index: 10;
}
.profile-nav-inner {
  max-width: 1190px;
  margin: 0 auto;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}
.profile-nav-spacer {
  width: 290px;
  flex-shrink: 0;
}
.profile-nav-tabs {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  height: 60px;
}
.profile-nav-tab {
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 18px;
  cursor: pointer;
  border-bottom: 4px solid transparent;
  text-decoration: none !important;
  transition: all 0.15s;
}
.profile-nav-tab:hover {
  border-bottom-color: var(--circus-red);
}
.profile-nav-tab.active {
  border-bottom-color: var(--circus-red);
}
.profile-nav-label {
  font-size: 11px;
  font-weight: bold;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 14px;
}
.profile-nav-tab.active .profile-nav-label {
  color: var(--circus-red);
}
.profile-nav-value {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-main);
  line-height: 20px;
}
.profile-nav-tab.active .profile-nav-value {
  color: var(--circus-red);
}
.profile-nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Profile Grid */
.profile-main-grid {
  max-width: 1190px;
  margin: 15px auto 40px;
  padding: 0 15px;
  display: flex;
  gap: 20px;
}
.profile-sidebar {
  width: 290px;
  flex-shrink: 0;
}
.profile-avatar-container {
  position: relative;
  margin-top: -140px;
  margin-bottom: 15px;
  z-index: 20;
}
.profile-avatar-large {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 5px solid #ffffff;
  background-color: #ffffff;
  object-fit: cover;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.profile-details-name {
  font-size: 22px;
  font-weight: 800;
  line-height: 26px;
  color: var(--text-main);
  margin: 0 0 2px 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}
.profile-details-handle {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 12px;
}
.profile-details-bio {
  font-size: 14px;
  line-height: 20px;
  color: var(--text-main);
  margin-bottom: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}
.profile-meta-list {
  list-style: none;
  margin: 0 0 16px 0;
  padding: 0;
  font-size: 13px;
  color: var(--text-muted);
}
.profile-meta-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.profile-meta-icon {
  width: 16px;
  height: 16px;
  fill: var(--text-muted);
  flex-shrink: 0;
}
.profile-center-stream {
  width: 590px;
  flex-shrink: 0;
}
.profile-right-sidebar {
  width: 270px;
  flex-shrink: 0;
}
.btn-edit-profile {
  font-weight: bold;
  border-radius: 100px;
  padding: 6px 16px;
  color: var(--text-muted);
  background: #ffffff;
  border: 1px solid var(--border-color);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-edit-profile:hover {
  background: #f5f8fa;
  color: var(--text-main);
  border-color: #cfd9de;
}

/* Settings Modal */
.settings-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 15px;
}
.settings-tab-btn {
  padding: 10px 16px;
  border: none;
  background: none;
  font-weight: bold;
  font-size: 13px;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 3px solid transparent;
}
.settings-tab-btn.active {
  color: var(--circus-red);
  border-bottom-color: var(--circus-red);
}
.settings-card-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-bottom: 10px;
  text-decoration: none !important;
  color: var(--text-main);
  background: #ffffff;
  transition: all 0.15s;
}
.settings-card-link:hover {
  background-color: #f8fafc;
  border-color: var(--circus-red);
  transform: translateX(2px);
}
.settings-card-title {
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.settings-card-desc {
  font-size: 12px;
  color: var(--text-muted);
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
  background: rgba(0,0,0,0.85);
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}
.lightbox-img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

/* Toast */
.circus-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: rgba(20, 23, 26, 0.95);
  color: #ffffff;
  padding: 10px 22px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 3000;
  pointer-events: none;
}
.circus-toast.show {
  transform: translateX(-50%) translateY(0);
}
</style>
</head>
<body>

<!-- TOP NAVBAR (2016 Style) -->
<nav class="navbar navbar-fixed-top navbar-circus">
  <div class="container">
    <!-- Left Navigation Items -->
    <ul class="nav-links">
      <li class="nav-item">
        <a href="javascript:void(0)" class="nav-link active" id="nav-item-home" onclick="circusApp.goHome()">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span>Inicio</span>
        </a>
      </li>
      <li class="nav-item">
        <a href="javascript:void(0)" class="nav-link" onclick="circusApp.showNotice('No hay notificaciones nuevas.')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
          <span>Notificaciones</span>
        </a>
      </li>
    </ul>

    <!-- Center Tent Logo -->
    <a href="javascript:void(0)" class="circus-logo-link" onclick="circusApp.goHome()" title="${name}">
      <svg class="circus-tent-svg" viewBox="0 0 100 100">
        <polygon points="50,15 15,48 85,48" fill="#e63946"/>
        <polygon points="50,15 35,48 50,48" fill="#ffd166"/>
        <polygon points="50,15 65,48 50,48" fill="#ffd166"/>
        <polygon points="50,5 50,15 56,10" fill="#ffd166"/>
        <line x1="50" y1="5" x2="50" y2="15" stroke="#780000" stroke-width="2"/>
        <rect x="20" y="48" width="60" height="38" fill="#ffffff" stroke="#c1121f" stroke-width="2"/>
        <polygon points="20,48 35,48 35,86 20,86" fill="#c1121f"/>
        <polygon points="50,48 65,48 65,86 50,86" fill="#c1121f"/>
        <path d="M 40,86 Q 50,62 60,86 Z" fill="#14171a"/>
      </svg>
    </a>

    <!-- Right Controls -->
    <div class="nav-right">
      <form class="search-form" onsubmit="circusApp.handleSearch(event)">
        <input type="text" class="search-input" id="search-query" placeholder="Buscar en el Circo...">
        <button type="submit" class="search-btn">
          <svg style="width:13px;height:13px;fill:currentColor" viewBox="0 0 24 24"><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.532.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"/></svg>
        </button>
      </form>

      ${
				user
					? `
        <button class="nav-avatar-btn" id="nav-avatar-btn" onclick="circusApp.toggleUserDropdown(event)" title="@${user.screen_name}">
          <img class="nav-avatar" src="${user.avatar_url || "/public/icon-dark.png"}" alt="${user.screen_name}">
        </button>
        <button class="btn-tweet-nav" onclick="circusApp.focusComposer()">Twittear</button>
      `
					: `
        <a href="/" class="btn btn-default btn-sm" style="font-weight:bold;border-radius:100px;padding:5px 14px">Iniciar sesión</a>
      `
			}

      <!-- Dropdown menu -->
      <div class="nav-user-dropdown" id="user-nav-dropdown">
        ${
					user
						? `
          <div class="dropdown-user-header">
            <b>${user.name}</b>
            <small>@${user.screen_name}</small>
          </div>
          <a class="nav-dropdown-item" href="javascript:void(0)" onclick="circusApp.viewProfile('${user.screen_name}')">
            <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <span>Ver perfil</span>
          </a>
          <div class="dropdown-divider"></div>
          <a class="nav-dropdown-item" href="javascript:void(0)" onclick="circusApp.openSettingsModal('profile')">
            <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
            <span>Configuración y privacidad</span>
          </a>
          <a class="nav-dropdown-item" href="javascript:void(0)" onclick="circusApp.openSettingsModal('language')">
            <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>
            <span>Idioma de la aplicación</span>
          </a>
          <a class="nav-dropdown-item" href="/account/api">
            <svg viewBox="0 0 24 24"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
            <span>Claves de API y Tokens</span>
          </a>
          <a class="nav-dropdown-item" href="/account/import">
            <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
            <span>Importar desde X</span>
          </a>
          <a class="nav-dropdown-item" href="/account/theme">
            <svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.28 19.59 10.59 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
            <span>Temas y colores</span>
          </a>
          <a class="nav-dropdown-item" href="/account/passkeys">
            <svg viewBox="0 0 24 24"><path d="M21 10h-8.35C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H13l2 2 2-2 1 1 2-2 1 1 2-2v-2zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
            <span>Llaves de acceso (Passkeys)</span>
          </a>
          <a class="nav-dropdown-item" href="/account/apps">
            <svg viewBox="0 0 24 24"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>
            <span>Aplicaciones conectadas</span>
          </a>
          ${
						user.role === "admin" || user.role === "moderator" || user.role === "support"
							? `
            <div class="dropdown-divider"></div>
            <a class="nav-dropdown-item" href="/admin" target="_blank" style="color:var(--circus-red)!important;font-weight:bold">
              <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
              <span>Panel de administración</span>
            </a>
          `
							: ""
					}
          <div class="dropdown-divider"></div>
          <a class="nav-dropdown-item" href="javascript:void(0)" onclick="circusApp.logout()">
            <svg viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
            <span>Cerrar sesión</span>
          </a>
          <div class="dropdown-divider"></div>
          <a class="nav-dropdown-item" href="/?beta=0" style="color:#657786!important;font-size:12px">
            Volver a versión moderna
          </a>
        `
						: ""
				}
      </div>
    </div>
  </div>
</nav>

<!-- VIEW: HOME (3 Columns) -->
<div id="home-view">
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
</div>

<!-- VIEW: 2016 PROFILE (Canopy + Subnav + 3 Columns) -->
<div id="profile-view">
  <div class="profile-canopy" id="profile-canopy"></div>
  <div class="profile-nav-bar">
    <div class="profile-nav-inner">
      <div class="profile-nav-spacer"></div>
      <ul class="profile-nav-tabs">
        <li class="profile-nav-tab active" id="profile-tab-posts" onclick="circusApp.switchProfileTab('posts')">
          <span class="profile-nav-label">Posts</span>
          <span class="profile-nav-value" id="profile-stat-posts">0</span>
        </li>
        <li class="profile-nav-tab" id="profile-tab-with-replies" onclick="circusApp.switchProfileTab('replies')">
          <span class="profile-nav-label">Posts y respuestas</span>
          <span class="profile-nav-value">·</span>
        </li>
        <li class="profile-nav-tab" id="profile-tab-following" onclick="circusApp.switchProfileTab('following')">
          <span class="profile-nav-label">Siguiendo</span>
          <span class="profile-nav-value" id="profile-stat-following">0</span>
        </li>
        <li class="profile-nav-tab" id="profile-tab-followers" onclick="circusApp.switchProfileTab('followers')">
          <span class="profile-nav-label">Seguidores</span>
          <span class="profile-nav-value" id="profile-stat-followers">0</span>
        </li>
        <li class="profile-nav-tab" id="profile-tab-likes" onclick="circusApp.switchProfileTab('likes')">
          <span class="profile-nav-label">Me gusta</span>
          <span class="profile-nav-value" id="profile-stat-likes">0</span>
        </li>
      </ul>
      <div class="profile-nav-actions" id="profile-nav-actions"></div>
    </div>
  </div>

  <div class="profile-main-grid">
    <!-- Left Profile Details Column -->
    <div class="profile-sidebar">
      <div class="profile-avatar-container">
        <img class="profile-avatar-large" id="profile-large-avatar" src="/public/icon-dark.png" alt="Avatar">
      </div>
      <div class="profile-details-card">
        <h1 class="profile-details-name" id="profile-display-name"></h1>
        <div class="profile-details-handle" id="profile-display-handle"></div>
        <div id="profile-display-label"></div>
        <div class="profile-details-bio" id="profile-display-bio"></div>
        <ul class="profile-meta-list" id="profile-meta-list"></ul>
        <div id="profile-action-btn-wrap"></div>
      </div>
    </div>

    <!-- Center Profile Posts Stream -->
    <div class="profile-center-stream">
      <div class="tweet-stream" id="profile-tweet-stream">
        <div style="padding:40px;text-align:center;color:#657786">Cargando publicaciones...</div>
      </div>
      <div style="text-align:center;margin:15px 0" id="profile-load-more-wrap">
        <button class="btn btn-default" id="profile-load-more-btn" onclick="circusApp.loadMoreProfilePosts()" style="display:none;font-weight:bold;border-radius:100px;padding:8px 24px">Cargar más posts</button>
      </div>
    </div>

    <!-- Right Sidebar Suggestions -->
    <div class="profile-right-sidebar">
      <div class="module-card who-to-follow-card">
        <h4 class="trends-header" style="margin-bottom:12px">A quién seguir</h4>
        <div id="profile-suggestions-list"></div>
      </div>
      <div class="module-card footer-info-card">
        <p style="margin-bottom:8px">
          <a href="/tos">Términos</a>
          <a href="/privacy">Privacidad</a>
          <a href="/rules">Reglas</a>
          <a href="/?beta=0" style="color:var(--circus-red);font-weight:bold">Modo Moderno</a>
        </p>
        <p style="margin:0">© 2026 ${name}.</p>
      </div>
    </div>
  </div>
</div>

<!-- Settings Modal -->
<div class="modal fade" id="settings-modal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document" style="max-width:550px">
    <div class="modal-content" style="border-radius:8px;overflow:hidden">
      <div class="modal-header" style="background:linear-gradient(135deg,var(--circus-red),var(--circus-dark-red));color:#fff;padding:12px 18px">
        <button type="button" class="close" data-dismiss="modal" style="color:#fff;opacity:0.8">&times;</button>
        <h4 class="modal-title" style="font-weight:bold">⚙️ Configuración del Circo</h4>
      </div>
      <div class="modal-body" style="padding:18px">
        <div class="settings-tabs">
          <button class="settings-tab-btn active" id="tab-btn-profile" onclick="circusApp.switchSettingsTab('profile')">Perfil</button>
          <button class="settings-tab-btn" id="tab-btn-language" onclick="circusApp.switchSettingsTab('language')">Idioma</button>
          <button class="settings-tab-btn" id="tab-btn-tools" onclick="circusApp.switchSettingsTab('tools')">Herramientas y API</button>
        </div>
        
        <!-- Tab Profile -->
        <div id="settings-tab-profile">
          <form onsubmit="circusApp.saveProfileSettings(event)">
            <div class="form-group">
              <label style="font-weight:bold;font-size:12px">Nombre mostrado</label>
              <input type="text" class="form-control" id="settings-name" maxlength="50" required>
            </div>
            <div class="form-group">
              <label style="font-weight:bold;font-size:12px">Biografía</label>
              <textarea class="form-control" id="settings-bio" rows="3" maxlength="160"></textarea>
            </div>
            <div class="form-group">
              <label style="font-weight:bold;font-size:12px">Ubicación</label>
              <input type="text" class="form-control" id="settings-location" maxlength="30" placeholder="Ej. El Escenario">
            </div>
            <div class="form-group">
              <label style="font-weight:bold;font-size:12px">Sitio web</label>
              <input type="url" class="form-control" id="settings-website" maxlength="100" placeholder="https://...">
            </div>
            <button type="submit" class="btn btn-primary" style="background:var(--circus-red);border:none;font-weight:bold;border-radius:100px;padding:6px 20px">Guardar perfil</button>
          </form>
        </div>
        
        <!-- Tab Language -->
        <div id="settings-tab-language" style="display:none">
          <form onsubmit="circusApp.saveLanguageSettings(event)">
            <p style="color:#657786;font-size:13px;margin-bottom:15px">Selecciona tu idioma preferido para la interfaz y traducciones automáticas.</p>
            <div class="form-group">
              <label style="font-weight:bold;font-size:12px">Idioma de la aplicación</label>
              <select class="form-control" id="settings-language-select">
                <option value="es">Español (Spanish)</option>
                <option value="en">English (English)</option>
                <option value="pt">Português (Portuguese)</option>
                <option value="fr">Français (French)</option>
                <option value="de">Deutsch (German)</option>
                <option value="it">Italiano (Italian)</option>
                <option value="ja">日本語 (Japanese)</option>
                <option value="ru">Русский (Russian)</option>
                <option value="zh">中文 (Chinese)</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary" style="background:var(--circus-red);border:none;font-weight:bold;border-radius:100px;padding:6px 20px">Guardar idioma</button>
          </form>
        </div>
        
        <!-- Tab Tools -->
        <div id="settings-tab-tools" style="display:none">
          <p style="color:#657786;font-size:13px;margin-bottom:15px">Acceso a las herramientas avanzadas de tu cuenta:</p>
          
          <a href="/account/api" class="settings-card-link">
            <div>
              <div class="settings-card-title">🔑 Claves de API / Tokens</div>
              <div class="settings-card-desc">Crea tokens personales para bots, scripts y automatizaciones.</div>
            </div>
            <span class="glyphicon glyphicon-chevron-right" style="color:#8899a6"></span>
          </a>

          <a href="/account/import" class="settings-card-link">
            <div>
              <div class="settings-card-title">📥 Importar desde X (Twitter)</div>
              <div class="settings-card-desc">Restaura publicaciones y fotos subiendo tu archivo ZIP de X.</div>
            </div>
            <span class="glyphicon glyphicon-chevron-right" style="color:#8899a6"></span>
          </a>

          <a href="/account/passkeys" class="settings-card-link">
            <div>
              <div class="settings-card-title">🛡️ Llaves de acceso (Passkeys)</div>
              <div class="settings-card-desc">Inicia sesión con tu huella digital, Face ID o bloqueo de pantalla.</div>
            </div>
            <span class="glyphicon glyphicon-chevron-right" style="color:#8899a6"></span>
          </a>

          <a href="/account/theme" class="settings-card-link">
            <div>
              <div class="settings-card-title">🎨 Temas y Colores</div>
              <div class="settings-card-desc">Personaliza los colores de acento y aspecto visual.</div>
            </div>
            <span class="glyphicon glyphicon-chevron-right" style="color:#8899a6"></span>
          </a>

          <a href="/account/apps" class="settings-card-link">
            <div>
              <div class="settings-card-title">📱 Aplicaciones conectadas</div>
              <div class="settings-card-desc">Revisa y revoca las aplicaciones autorizadas en tu cuenta.</div>
            </div>
            <span class="glyphicon glyphicon-chevron-right" style="color:#8899a6"></span>
          </a>

          ${
						user && (user.role === "admin" || user.role === "moderator" || user.role === "support")
							? `
            <a href="/admin" target="_blank" class="settings-card-link" style="border-left:4px solid var(--circus-red)">
              <div>
                <div class="settings-card-title" style="color:var(--circus-red)">👑 Panel de administración</div>
                <div class="settings-card-desc">Modera usuarios, contenido, reportes y configuración de la instancia.</div>
              </div>
              <span class="glyphicon glyphicon-chevron-right" style="color:var(--circus-red)"></span>
            </a>
          `
							: ""
					}
        </div>
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

<!-- Bootstrap JS & jQuery -->
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
  currentProfileUser: null,
  currentProfileHandle: null,
  currentProfileTab: 'posts',
  profileNextCursor: null,

  init() {
    this.renderLeftColumn();
    this.renderComposer();
    this.loadTrends();
    this.loadSuggestions();

    // Check URL path
    const p = window.location.pathname.replace(/^\\/+/, '');
    if (p === 'settings' || p.startsWith('settings/')) {
      this.loadTimeline();
      this.openSettingsModal(p === 'settings/language' ? 'language' : 'profile');
    } else if (p && !p.includes('/') && p !== 'home' && p !== 'timeline') {
      this.viewProfile(p);
    } else {
      this.loadTimeline();
    }

    // Handle back / forward
    window.addEventListener('popstate', () => {
      const path = window.location.pathname.replace(/^\\/+/, '');
      if (path && !path.includes('/') && path !== 'home' && path !== 'timeline' && !path.startsWith('settings')) {
        this.viewProfile(path);
      } else {
        this.goHome();
      }
    });

    // Close user dropdown on click outside
    document.addEventListener('click', (e) => {
      const drop = document.getElementById('user-nav-dropdown');
      const btn = document.getElementById('nav-avatar-btn');
      if (drop && drop.classList.contains('show') && !drop.contains(e.target) && (!btn || !btn.contains(e.target))) {
        drop.classList.remove('show');
      }
    });
  },

  showNotice(msg) {
    const toast = document.getElementById('circus-toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  },

  renderBadges(u) {
    if (!u) return '';
    let html = '';

    // 1. Verified badges
    if (u.verified_type === 'business' || u.verified_type === 'gold') {
      html += '<svg class="circus-badge-check verified-gold" title="Organización verificada" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" fill="#e5a93c"/><path fill="#ffffff" d="M10.2 15.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.3-5.3 1.4 1.4z"/></svg>';
    } else if (u.verified_type === 'government' || u.verified_type === 'government_individual') {
      html += '<svg class="circus-badge-check verified-grey" title="Gobierno o figura oficial" viewBox="0 0 24 24"><path fill="#829aab" d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 10.45.7 11.82.7 13.4c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4z"/><path fill="#ffffff" d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.3-5.3 1.4 1.4z"/></svg>';
    } else if (u.verified_type === 'blue' || u.verified_type === 'legacy' || u.verified_type === true) {
      html += '<svg class="circus-badge-check verified-blue" title="Cuenta verificada" viewBox="0 0 24 24"><path fill="#1da1f2" d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 10.45.7 11.82.7 13.4c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4z"/><path fill="#ffffff" d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.3-5.3 1.4 1.4z"/></svg>';
    }

    // 2. Organization badge
    if (u.org && u.org.avatar_url) {
      html += '<a href="javascript:void(0)" onclick="event.stopPropagation();circusApp.viewProfile(\\'' + this.escape(u.org.screen_name) + '\\')" title="Afiliado a ' + this.escape(u.org.name) + ' (@' + this.escape(u.org.screen_name) + ')"><img class="circus-badge-org" src="' + this.escape(u.org.avatar_url) + '" alt="' + this.escape(u.org.name) + '"></a>';
    }

    // 3. Custom badges
    if (Array.isArray(u.badges)) {
      u.badges.forEach(b => {
        html += '<img class="circus-badge-custom" src="' + this.escape(b.url || '/public/badge-' + b.id + '.png') + '" title="' + this.escape(b.name) + '" alt="' + this.escape(b.name) + '">';
      });
    }

    // 4. Remote badges
    if (Array.isArray(u.remote_badges)) {
      u.remote_badges.forEach(rb => {
        html += '<img class="circus-badge-custom" src="' + this.escape(rb.url) + '" title="' + this.escape(rb.name) + '" alt="' + this.escape(rb.name) + '">';
      });
    }

    // 5. Translator badge
    if (u.translator) {
      html += '<svg class="circus-badge-icon" title="Traductor oficial" style="fill:#1da1f2" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';
    }

    // 6. Flag
    if (u.flag) {
      html += '<img class="circus-badge-flag" src="/public/flag-' + this.escape(u.flag) + '.svg" alt="Bandera">';
    }

    // 7. Federated Instance Globe
    if (u.instance) {
      html += '<svg class="circus-badge-icon" title="De la instancia ' + this.escape(u.instance) + '" style="fill:#657786" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';
    }

    // 8. Parody / Bot Label
    if (u.parody_label && u.parody_label !== 'None') {
      html += '<span class="circus-label-pill">' + this.escape(u.parody_label) + '</span>';
    } else if (u.label && u.label.text) {
      html += '<span class="circus-label-pill">' + this.escape(u.label.text) + '</span>';
    }

    return html;
  },

  renderLeftColumn() {
    const el = document.getElementById('left-profile-container');
    if (this.viewer) {
      const bannerStyle = this.viewer.banner_url ? "background-image:url('" + this.viewer.banner_url + "');background-size:cover;background-position:center;" : "";
      el.innerHTML = \`
        <div class="module-card">
          <div class="profile-card-header" style="\${bannerStyle}"></div>
          <div class="profile-card-content">
            <a class="profile-card-avatar-link" onclick="circusApp.viewProfile('\${this.viewer.screen_name}')">
              <img class="profile-card-avatar" src="\${this.viewer.avatar_url || '/public/icon-dark.png'}" alt="\${this.viewer.screen_name}">
            </a>
            <div class="profile-card-user">
              <a class="profile-card-name" onclick="circusApp.viewProfile('\${this.viewer.screen_name}')">
                \${this.escape(this.viewer.name)} \${this.renderBadges(this.viewer)}
              </a>
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
        <div class="module-card guest-login-card" style="padding:16px">
          <h4 style="margin-top:0;font-weight:bold;color:var(--text-main)">¿Tienes una cuenta?</h4>
          <form onsubmit="circusApp.handleLogin(event)">
            <div class="form-group" style="margin-bottom:8px">
              <input type="text" class="form-control input-sm" id="login-user" placeholder="Usuario o correo" required>
            </div>
            <div class="form-group" style="margin-bottom:10px">
              <input type="password" class="form-control input-sm" id="login-pass" placeholder="Contraseña" required>
            </div>
            <button type="submit" class="btn btn-primary btn-sm btn-block" style="background:var(--circus-red);border:none;font-weight:bold;border-radius:100px">Iniciar sesión</button>
          </form>
          <p style="margin-top:12px;margin-bottom:0;font-size:12px;color:#657786;text-align:center">
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
      if (json.data) {
        if (json.data.counts) {
          const sp = document.getElementById('stat-posts');
          const sfg = document.getElementById('stat-following');
          const sfr = document.getElementById('stat-followers');
          if (sp) sp.textContent = json.data.counts.posts ?? 0;
          if (sfg) sfg.textContent = json.data.counts.following ?? 0;
          if (sfr) sfr.textContent = json.data.counts.followers ?? 0;
        }
        if (json.data.banner_url) {
          const header = document.querySelector('.profile-card-header');
          if (header) {
            header.style.backgroundImage = "url('" + json.data.banner_url + "')";
            header.style.backgroundSize = "cover";
            header.style.backgroundPosition = "center";
          }
        }
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

            <div class="composer-poll-form" id="composer-poll-form">
              <div class="form-group" style="margin-bottom:6px">
                <input type="text" class="form-control input-sm poll-choice" placeholder="Opción 1" maxlength="25">
              </div>
              <div class="form-group" style="margin-bottom:6px">
                <input type="text" class="form-control input-sm poll-choice" placeholder="Opción 2" maxlength="25">
              </div>
              <div id="extra-poll-choices"></div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
                <button type="button" class="btn btn-default btn-xs" onclick="circusApp.addPollChoice()">+ Agregar opción</button>
                <button type="button" class="btn btn-link btn-xs" onclick="circusApp.togglePoll(false)" style="color:#d90429">Eliminar encuesta</button>
              </div>
            </div>
          </div>
        </div>

        <div class="composer-bottom">
          <div class="composer-tools">
            <input type="file" id="media-upload-input" accept="image/*,video/*" multiple style="display:none" onchange="circusApp.handleFileUpload(event)">
            <button class="composer-tool-btn" type="button" onclick="document.getElementById('media-upload-input').click()" title="Adjuntar foto o video">
              <svg class="composer-tool-icon" viewBox="0 0 24 24"><path d="M19.75 2H4.25C3.01 2 2 3.01 2 4.25v15.5C2 20.99 3.01 22 4.25 22h15.5c1.24 0 2.25-1.01 2.25-2.25V4.25C22 3.01 20.99 2 19.75 2zM4.25 3.5h15.5c.41 0 .75.34.75.75v10.67l-1.44-1.44c-.29-.29-.77-.29-1.06 0l-5.35 5.35-3.07-3.07c-.29-.29-.77-.29-1.06 0L3.5 20.74V4.25c0-.41.34-.75.75-.75zM17.5 10.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5z"/></svg>
            </button>
            <button class="composer-tool-btn" type="button" onclick="circusApp.togglePoll(true)" title="Crear encuesta">
              <svg class="composer-tool-icon" viewBox="0 0 24 24"><path d="M6 5v14h3V5H6zm5 6v8h3v-8h-3zm5-3v11h3V8h-3z"/></svg>
            </button>
          </div>
          <div class="composer-right">
            <span class="char-counter" id="char-counter">280</span>
            <button class="btn btn-primary btn-sm btn-tweet-nav" id="btn-submit-tweet" onclick="circusApp.submitTweet()">Twittear</button>
          </div>
        </div>
      </div>
    \`;
  },

  onComposerInput(textarea) {
    const len = textarea.value.length;
    const remaining = 280 - len;
    const counter = document.getElementById('char-counter');
    const btn = document.getElementById('btn-submit-tweet');

    counter.textContent = remaining;
    counter.className = 'char-counter';
    if (remaining < 20 && remaining >= 0) counter.classList.add('warning');
    if (remaining < 0) counter.classList.add('danger');

    btn.disabled = remaining < 0 || (len === 0 && this.composerMediaIds.length === 0);
  },

  focusComposer() {
    if (document.getElementById('profile-view').style.display === 'block') {
      this.goHome();
    }
    const txt = document.getElementById('tweet-textarea');
    if (txt) {
      txt.focus();
      txt.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  togglePoll(active) {
    this.composerPollActive = active;
    const form = document.getElementById('composer-poll-form');
    if (form) form.style.display = active ? 'block' : 'none';
  },

  addPollChoice() {
    const container = document.getElementById('extra-poll-choices');
    const count = container.querySelectorAll('input').length + 3;
    if (count > 4) {
      this.showNotice('Máximo 4 opciones por encuesta.');
      return;
    }
    container.insertAdjacentHTML('beforeend', \`
      <div class="form-group" style="margin-bottom:6px">
        <input type="text" class="form-control input-sm poll-choice" placeholder="Opción \${count}" maxlength="25">
      </div>
    \`);
  },

  async handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      if (this.composerMediaIds.length >= 4) {
        this.showNotice('Máximo 4 fotos o 1 video.');
        break;
      }
      this.showNotice('Subiendo archivo...');
      const formData = new FormData();
      formData.set('media', file);

      try {
        const res = await fetch('/api/v1/media', {
          method: 'POST',
          body: formData
        });
        const json = await res.json();
        if (json.data && json.data.media_id) {
          const id = json.data.media_id;
          this.composerMediaIds.push(id);
          this.renderMediaPreviews();
        } else {
          this.showNotice('Error al subir el archivo.');
        }
      } catch {
        this.showNotice('Error en la conexión.');
      }
    }
    e.target.value = '';
    const txt = document.getElementById('tweet-textarea');
    if (txt) this.onComposerInput(txt);
  },

  renderMediaPreviews() {
    const previews = document.getElementById('composer-media-previews');
    previews.innerHTML = '';
    this.composerMediaIds.forEach((id, idx) => {
      previews.insertAdjacentHTML('beforeend', \`
        <div class="composer-thumb-wrap">
          <img class="composer-thumb" src="/media/\${id}.jpg" onerror="this.src='/public/icon-dark.png'">
          <button class="composer-thumb-del" onclick="circusApp.removeMedia(\${idx})">&times;</button>
        </div>
      \`);
    });
  },

  removeMedia(index) {
    this.composerMediaIds.splice(index, 1);
    this.renderMediaPreviews();
    const txt = document.getElementById('tweet-textarea');
    if (txt) this.onComposerInput(txt);
  },

  async submitTweet() {
    const textarea = document.getElementById('tweet-textarea');
    const text = textarea ? textarea.value.trim() : '';

    let poll = null;
    if (this.composerPollActive) {
      const inputs = Array.from(document.querySelectorAll('.poll-choice'));
      const choices = inputs.map(i => i.value.trim()).filter(Boolean);
      if (choices.length < 2) {
        return this.showNotice('La encuesta necesita al menos 2 opciones.');
      }
      poll = { choices, minutes: 1440 };
    }

    if (!text && this.composerMediaIds.length === 0 && !poll) {
      return this.showNotice('Escribe algo o adjunta un archivo.');
    }

    this.showNotice('Publicando...');
    try {
      const res = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          text,
          media_ids: this.composerMediaIds,
          poll
        })
      });
      const json = await res.json();
      if (json.data) {
        if (textarea) textarea.value = '';
        this.composerMediaIds = [];
        this.togglePoll(false);
        this.renderMediaPreviews();
        this.showNotice('¡Post publicado!');
        this.loadTimeline();
        if (this.viewer) this.fetchUserStats(this.viewer.screen_name);
      } else {
        this.showNotice(json.error || 'No se pudo publicar.');
      }
    } catch {
      this.showNotice('Error al conectar.');
    }
  },

  switchFeed(feed) {
    this.feedType = feed;
    document.querySelectorAll('.stream-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-feed-' + feed)?.classList.add('active');
    this.loadTimeline();
  },

  async loadTimeline(cursor = null) {
    if (this.isLoading) return;
    this.isLoading = true;

    const stream = document.getElementById('tweet-stream');
    const loadBtn = document.getElementById('load-more-btn');

    if (!cursor) {
      stream.innerHTML = \`
        <div style="padding:40px;text-align:center;color:#657786" id="stream-loading">
          <p style="font-size:16px;font-weight:bold;margin-bottom:8px">Cargando el Circo...</p>
          <p>Preparando los mejores actos del día.</p>
        </div>
      \`;
    }

    try {
      const url = '/api/v1/timeline?feed=' + this.feedType + (cursor ? '&cursor=' + encodeURIComponent(cursor) : '');
      const res = await fetch(url);
      const json = await res.json();
      const posts = json.data || [];

      if (!cursor) stream.innerHTML = '';

      if (posts.length === 0 && !cursor) {
        stream.innerHTML = '<div style="padding:40px;text-align:center;color:#657786">No hay publicaciones aquí todavía.</div>';
        loadBtn.style.display = 'none';
      } else {
        posts.forEach(post => {
          stream.insertAdjacentHTML('beforeend', this.renderTweetCard(post));
        });
        this.nextCursor = json.next_cursor;
        loadBtn.style.display = this.nextCursor ? 'inline-block' : 'none';
      }
    } catch {
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
          <span>\${this.escape(p.reposted_by.name)} \${this.renderBadges(p.reposted_by)} reposteó</span>
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
        <div class="quote-card" onclick="circusApp.viewProfile('\${qAuthor.screen_name}')">
          <div class="quote-header">
            <b>\${this.escape(qAuthor.name)}</b>
            \${this.renderBadges(qAuthor)}
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
              <span class="tweet-author-name" onclick="circusApp.viewProfile('\${author.screen_name}')">
                \${this.escape(author.name)}
              </span>
              \${this.renderBadges(author)}
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
    if (!confirm('¿Seguro que deseas eliminar este post del Circo?')) return;
    try {
      const res = await fetch('/api/v1/posts/' + id, { method: 'DELETE' });
      const json = await res.json();
      if (json.data && json.data.deleted) {
        const el = document.getElementById('tweet-' + id);
        if (el) el.remove();
        this.showNotice('Post eliminado.');
        if (this.viewer) this.fetchUserStats(this.viewer.screen_name);
      }
    } catch {}
  },

  async votePoll(pollId, choice) {
    if (!this.viewer) return this.showNotice('Inicia sesión para votar.');
    try {
      const res = await fetch('/api/v1/polls/' + pollId + '/vote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ choice })
      });
      const json = await res.json();
      if (json.data) {
        this.updateCardInDom(json.data);
      }
    } catch {}
  },

  async translateTweet(id) {
    const textEl = document.getElementById('text-' + id);
    if (!textEl) return;
    this.showNotice('Traduciendo con IA...');
    try {
      const res = await fetch('/api/v1/posts/' + id + '/translate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ target_lang: this.viewer?.language || 'es' })
      });
      const json = await res.json();
      if (json.data && json.data.translated_text) {
        textEl.innerHTML = \`
          <div>\${this.formatTweetText(json.data.translated_text)}</div>
          <div style="font-size:11px;color:#657786;margin-top:4px">
            🌐 Traducido de <b>\${(json.data.source_lang || '').toUpperCase()}</b> a <b>\${(json.data.target_lang || '').toUpperCase()}</b>
          </div>
        \`;
      } else {
        this.showNotice('No se pudo traducir este post.');
      }
    } catch {
      this.showNotice('Error al traducir.');
    }
  },

  updateCardInDom(post) {
    const card = document.getElementById('tweet-' + post.id);
    if (card) {
      card.outerHTML = this.renderTweetCard(post);
    }
  },

  async loadTrends() {
    const list = document.getElementById('trends-list');
    try {
      const res = await fetch('/api/v1/trends');
      const json = await res.json();
      const trends = json.data || [];
      if (trends.length > 0) {
        list.innerHTML = '';
        trends.forEach(t => {
          list.insertAdjacentHTML('beforeend', \`
            <div class="trend-item">
              <span class="trend-tag" onclick="circusApp.searchPosts('\${t.name}')">\${this.escape(t.name)}</span>
              <span class="trend-count">\${t.count} posts</span>
            </div>
          \`);
        });
      }
    } catch {}
  },

  async loadSuggestions() {
    const list = document.getElementById('suggestions-list');
    try {
      const res = await fetch('/api/v1/suggestions');
      const json = await res.json();
      const users = json.data || [];
      if (users.length === 0) {
        list.innerHTML = '<p style="color:#657786;font-size:12px">No hay sugerencias por ahora.</p>';
        return;
      }
      list.innerHTML = '';
      users.forEach(u => {
        const isFollowing = u.viewer && u.viewer.following;
        list.insertAdjacentHTML('beforeend', \`
          <div class="suggest-user-item">
            <img class="suggest-avatar" src="\${u.avatar_url || '/public/icon-dark.png'}" alt="\${u.screen_name}" onclick="circusApp.viewProfile('\${u.screen_name}')">
            <div class="suggest-info">
              <div class="suggest-name-row">
                <span class="suggest-name" onclick="circusApp.viewProfile('\${u.screen_name}')">\${this.escape(u.name)}</span>
                \${this.renderBadges(u)}
              </div>
              <div class="suggest-handle">@\${this.escape(u.screen_name)}</div>
              \${this.viewer ? \`
                <button class="btn-follow \${isFollowing ? 'following' : ''}" style="margin-top:6px" onclick="circusApp.toggleFollow('\${u.screen_name}', \${!!isFollowing}, '\${u.id}')">
                  \${isFollowing ? 'Siguiendo' : 'Seguir'}
                </button>
              \` : ''}
            </div>
          </div>
        \`);
      });
    } catch {
      list.innerHTML = '<p style="color:#657786;font-size:12px">No se pudieron cargar sugerencias.</p>';
    }
  },

  async toggleFollow(screenName, isFollowing, userId) {
    if (!this.viewer) return this.showNotice('Inicia sesión para seguir cuentas.');
    try {
      const res = await fetch('/api/v1/users/' + encodeURIComponent(screenName) + '/follow', {
        method: isFollowing ? 'DELETE' : 'POST'
      });
      const json = await res.json();
      if (json.data) {
        this.loadSuggestions();
        if (this.currentProfileUser && this.currentProfileUser.screen_name.toLowerCase() === screenName.toLowerCase()) {
          this.viewProfile(screenName);
        }
        if (this.viewer) this.fetchUserStats(this.viewer.screen_name);
        this.showNotice(isFollowing ? 'Dejaste de seguir a @' + screenName : 'Ahora sigues a @' + screenName);
      }
    } catch {}
  },

  handleSearch(e) {
    e.preventDefault();
    const query = document.getElementById('search-query').value.trim();
    if (query) this.searchPosts(query);
  },

  async searchPosts(query) {
    this.goHome();
    const stream = document.getElementById('tweet-stream');
    stream.innerHTML = '<div style="padding:40px;text-align:center;color:#657786">Buscando "' + this.escape(query) + '"...</div>';
    document.getElementById('load-more-btn').style.display = 'none';

    try {
      const res = await fetch('/api/v1/search?q=' + encodeURIComponent(query));
      const json = await res.json();
      const posts = json.data || [];
      stream.innerHTML = '<div style="padding:10px 16px;background:#f5f8fa;border-bottom:1px solid #e1e8ed;font-weight:bold">Resultados para: ' + this.escape(query) + '</div>';
      if (posts.length === 0) {
        stream.innerHTML += '<div style="padding:40px;text-align:center;color:#657786">No se encontraron resultados para esta búsqueda.</div>';
      } else {
        posts.forEach(post => {
          stream.insertAdjacentHTML('beforeend', this.renderTweetCard(post));
        });
      }
    } catch {
      stream.innerHTML = '<div style="padding:30px;text-align:center;color:#d90429">Error al realizar la búsqueda.</div>';
    }
  },

  /* 2016 Profile View */
  async viewProfile(handle) {
    if (!handle) return;
    const cleanHandle = handle.replace(/^@/, '');
    window.scrollTo(0, 0);

    document.getElementById('nav-item-home')?.classList.remove('active');
    document.getElementById('home-view').style.display = 'none';
    const profileView = document.getElementById('profile-view');
    profileView.style.display = 'block';

    if (window.location.pathname !== '/' + cleanHandle) {
      history.pushState({ type: 'profile', handle: cleanHandle }, '', '/' + cleanHandle);
    }

    this.currentProfileUser = null;
    this.currentProfileHandle = cleanHandle;
    this.currentProfileTab = 'posts';
    this.profileNextCursor = null;

    const canopy = document.getElementById('profile-canopy');
    canopy.style.backgroundImage = '';
    canopy.classList.remove('has-banner');
    document.getElementById('profile-large-avatar').src = '/public/icon-dark.png';
    document.getElementById('profile-display-name').textContent = 'Cargando...';
    document.getElementById('profile-display-handle').textContent = '@' + cleanHandle;
    document.getElementById('profile-display-label').innerHTML = '';
    document.getElementById('profile-display-bio').textContent = '';
    document.getElementById('profile-meta-list').innerHTML = '';
    document.getElementById('profile-nav-actions').innerHTML = '';
    document.getElementById('profile-action-btn-wrap').innerHTML = '';
    document.getElementById('profile-stat-posts').textContent = '-';
    document.getElementById('profile-stat-following').textContent = '-';
    document.getElementById('profile-stat-followers').textContent = '-';
    document.getElementById('profile-stat-likes').textContent = '-';
    document.getElementById('profile-tweet-stream').innerHTML = '<div style="padding:40px;text-align:center;color:#657786">Cargando publicaciones...</div>';
    document.getElementById('profile-load-more-btn').style.display = 'none';

    document.querySelectorAll('.profile-nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('profile-tab-posts').classList.add('active');

    try {
      const res = await fetch('/api/v1/users/' + encodeURIComponent(cleanHandle));
      const json = await res.json();
      if (!json.data) {
        document.getElementById('profile-display-name').textContent = 'Usuario no encontrado';
        document.getElementById('profile-tweet-stream').innerHTML = '<div style="padding:40px;text-align:center;color:#657786">Este personaje no existe en el Circo.</div>';
        return;
      }

      const u = json.data;
      this.currentProfileUser = u;

      if (u.banner_url) {
        canopy.style.backgroundImage = "url('" + u.banner_url + "')";
        canopy.classList.add('has-banner');
      }

      document.getElementById('profile-large-avatar').src = u.avatar_url || '/public/icon-dark.png';
      document.getElementById('profile-display-name').innerHTML = this.escape(u.name) + ' ' + this.renderBadges(u);
      document.getElementById('profile-display-handle').textContent = '@' + u.screen_name;
      document.getElementById('profile-display-bio').innerHTML = this.formatTweetText(u.bio || '');

      document.getElementById('profile-stat-posts').textContent = u.counts?.posts || 0;
      document.getElementById('profile-stat-following').textContent = u.counts?.following || 0;
      document.getElementById('profile-stat-followers').textContent = u.counts?.followers || 0;
      document.getElementById('profile-stat-likes').textContent = u.counts?.likes || 0;

      let metaHtml = '';
      if (u.location) {
        metaHtml += '<li><svg class="profile-meta-icon" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg><span>' + this.escape(u.location) + '</span></li>';
      }
      if (u.website) {
        const cleanWeb = u.website.replace(/^https?:\\/\\//, '');
        metaHtml += '<li><svg class="profile-meta-icon" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg><a href="' + this.escape(u.website) + '" target="_blank" rel="noopener">' + this.escape(cleanWeb) + '</a></li>';
      }
      if (u.created_at) {
        metaHtml += '<li><svg class="profile-meta-icon" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg><span>Se unió en ' + this.formatJoinedDate(u.created_at) + '</span></li>';
      }
      document.getElementById('profile-meta-list').innerHTML = metaHtml;

      const isMe = this.viewer && u.id === this.viewer.id;
      const isFollowing = u.viewer && u.viewer.following;
      const actionsEl = document.getElementById('profile-nav-actions');

      if (isMe) {
        actionsEl.innerHTML = '<button class="btn-edit-profile" onclick="circusApp.openSettingsModal(\\'profile\\')">Editar perfil</button>';
      } else if (this.viewer) {
        actionsEl.innerHTML = '<button class="btn-follow ' + (isFollowing ? 'following' : '') + '" onclick="circusApp.toggleFollow(\\'' + u.screen_name + '\\', ' + !!isFollowing + ', \\'' + u.id + '\\')">' + (isFollowing ? 'Siguiendo' : 'Seguir') + '</button>';
        document.getElementById('profile-action-btn-wrap').innerHTML = '<button class="btn btn-default btn-sm btn-block" style="border-radius:100px;font-weight:bold;margin-top:10px" onclick="circusApp.tweetTo(\\'' + u.screen_name + '\\')">Twittear a @' + this.escape(u.screen_name) + '</button>';
      }

      this.loadProfileSuggestions();
      this.loadProfilePosts();
    } catch {
      document.getElementById('profile-tweet-stream').innerHTML = '<div style="padding:40px;text-align:center;color:#d90429">Error al cargar perfil.</div>';
    }
  },

  async loadProfilePosts(cursor = null) {
    if (!this.currentProfileHandle) return;
    const stream = document.getElementById('profile-tweet-stream');
    const loadBtn = document.getElementById('profile-load-more-btn');
    if (!cursor) {
      stream.innerHTML = '<div style="padding:40px;text-align:center;color:#657786">Cargando publicaciones...</div>';
    }

    try {
      const repliesParam = this.currentProfileTab === 'replies' ? '&replies=true' : '';
      const cursorParam = cursor ? '&cursor=' + encodeURIComponent(cursor) : '';
      const res = await fetch('/api/v1/users/' + encodeURIComponent(this.currentProfileHandle) + '/posts?limit=20' + repliesParam + cursorParam);
      const json = await res.json();
      const posts = json.data || [];

      if (!cursor) stream.innerHTML = '';

      if (posts.length === 0 && !cursor) {
        stream.innerHTML = '<div style="padding:40px;text-align:center;color:#657786">@' + this.escape(this.currentProfileHandle) + ' todavía no ha publicado nada en el Circo.</div>';
        loadBtn.style.display = 'none';
        return;
      }

      posts.forEach(post => {
        stream.insertAdjacentHTML('beforeend', this.renderTweetCard(post));
      });

      this.profileNextCursor = json.next_cursor;
      loadBtn.style.display = this.profileNextCursor ? 'inline-block' : 'none';
    } catch {
      if (!cursor) stream.innerHTML = '<div style="padding:30px;text-align:center;color:#d90429">Error al cargar publicaciones.</div>';
    }
  },

  loadMoreProfilePosts() {
    if (this.profileNextCursor) {
      this.loadProfilePosts(this.profileNextCursor);
    }
  },

  switchProfileTab(tab) {
    this.currentProfileTab = tab;
    document.querySelectorAll('.profile-nav-tab').forEach(t => t.classList.remove('active'));
    if (tab === 'posts') {
      document.getElementById('profile-tab-posts')?.classList.add('active');
    } else if (tab === 'replies') {
      document.getElementById('profile-tab-with-replies')?.classList.add('active');
    }
    this.loadProfilePosts();
  },

  async loadProfileSuggestions() {
    const list = document.getElementById('profile-suggestions-list');
    if (!list) return;
    try {
      const res = await fetch('/api/v1/suggestions');
      const json = await res.json();
      const users = json.data || [];
      if (users.length === 0) {
        list.innerHTML = '<p style="color:#657786;font-size:12px">No hay sugerencias disponibles.</p>';
        return;
      }
      list.innerHTML = '';
      users.slice(0, 3).forEach(u => {
        const isFollowing = u.viewer && u.viewer.following;
        list.insertAdjacentHTML('beforeend', \`
          <div class="suggest-user-item">
            <img class="suggest-avatar" src="\${u.avatar_url || '/public/icon-dark.png'}" alt="\${u.screen_name}" onclick="circusApp.viewProfile('\${u.screen_name}')">
            <div class="suggest-info">
              <div class="suggest-name-row">
                <span class="suggest-name" onclick="circusApp.viewProfile('\${u.screen_name}')">\${this.escape(u.name)}</span>
                \${this.renderBadges(u)}
              </div>
              <div class="suggest-handle">@\${this.escape(u.screen_name)}</div>
              \${this.viewer ? \`
                <button class="btn-follow \${isFollowing ? 'following' : ''}" style="margin-top:6px" onclick="circusApp.toggleFollow('\${u.screen_name}', \${!!isFollowing}, '\${u.id}')">
                  \${isFollowing ? 'Siguiendo' : 'Seguir'}
                </button>
              \` : ''}
            </div>
          </div>
        \`);
      });
    } catch {
      list.innerHTML = '<p style="color:#657786;font-size:12px">No disponible.</p>';
    }
  },

  goHome() {
    window.scrollTo(0, 0);
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('home-view').style.display = 'block';
    document.getElementById('nav-item-home')?.classList.add('active');
    if (window.location.pathname !== '/') {
      history.pushState({ type: 'home' }, '', '/');
    }
  },

  tweetTo(handle) {
    this.goHome();
    this.focusComposer();
    const txt = document.getElementById('tweet-textarea');
    if (txt) {
      txt.value = '@' + handle + ' ';
      txt.focus();
      this.onComposerInput(txt);
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

  /* Settings Modal */
  openSettingsModal(tab = 'profile') {
    if (!this.viewer) {
      window.location.href = '/';
      return;
    }
    this.switchSettingsTab(tab);
    const nameInput = document.getElementById('settings-name');
    const bioInput = document.getElementById('settings-bio');
    const locInput = document.getElementById('settings-location');
    const webInput = document.getElementById('settings-website');
    const langSelect = document.getElementById('settings-language-select');

    if (nameInput) nameInput.value = this.viewer.name || '';
    if (bioInput) bioInput.value = this.viewer.bio || '';
    if (locInput) locInput.value = this.viewer.location || '';
    if (webInput) webInput.value = this.viewer.website || '';
    if (langSelect && this.viewer.language) langSelect.value = this.viewer.language;

    $('#settings-modal').modal('show');
  },

  switchSettingsTab(tab) {
    document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('settings-tab-profile').style.display = 'none';
    document.getElementById('settings-tab-language').style.display = 'none';
    document.getElementById('settings-tab-tools').style.display = 'none';

    if (tab === 'profile') {
      document.getElementById('tab-btn-profile').classList.add('active');
      document.getElementById('settings-tab-profile').style.display = 'block';
    } else if (tab === 'language') {
      document.getElementById('tab-btn-language').classList.add('active');
      document.getElementById('settings-tab-language').style.display = 'block';
    } else if (tab === 'tools') {
      document.getElementById('tab-btn-tools').classList.add('active');
      document.getElementById('settings-tab-tools').style.display = 'block';
    }
  },

  async saveProfileSettings(e) {
    e.preventDefault();
    const name = document.getElementById('settings-name').value.trim();
    const bio = document.getElementById('settings-bio').value;
    const location = document.getElementById('settings-location').value;
    const website = document.getElementById('settings-website').value.trim();

    this.showNotice('Guardando cambios...');
    try {
      const res = await fetch('/api/v1/account/settings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, bio, location, website })
      });
      const json = await res.json();
      if (json.data) {
        this.viewer = json.data;
        window.__VIEWER__ = json.data;
        this.renderLeftColumn();
        $('#settings-modal').modal('hide');
        this.showNotice('¡Perfil actualizado con éxito!');
        if (this.currentProfileUser && this.currentProfileUser.id === this.viewer.id) {
          this.viewProfile(this.viewer.screen_name);
        }
      } else {
        this.showNotice(json.error || 'No se pudo actualizar el perfil.');
      }
    } catch {
      this.showNotice('Error al conectar con el servidor.');
    }
  },

  async saveLanguageSettings(e) {
    e.preventDefault();
    const lang = document.getElementById('settings-language-select').value;
    this.showNotice('Guardando idioma...');
    try {
      const res = await fetch('/api/v1/account/settings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ language: lang })
      });
      const json = await res.json();
      if (json.data) {
        if (this.viewer) this.viewer.language = lang;
        document.cookie = 'lang=' + encodeURIComponent(lang) + '; Path=/; Max-Age=31536000; SameSite=Lax';
        $('#settings-modal').modal('hide');
        this.showNotice('Idioma actualizado a ' + lang.toUpperCase());
      } else {
        this.showNotice(json.error || 'Error al actualizar idioma.');
      }
    } catch {
      this.showNotice('Error al guardar idioma.');
    }
  },

  toggleUserDropdown(e) {
    if (e) e.stopPropagation();
    const drop = document.getElementById('user-nav-dropdown');
    if (drop) {
      drop.classList.toggle('show');
    }
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

  formatJoinedDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return months[d.getMonth()] + ' de ' + d.getFullYear();
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
