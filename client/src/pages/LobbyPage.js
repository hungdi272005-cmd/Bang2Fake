/**
 * Lobby Page - Sau khi đăng nhập
 */

import { getUser, logout } from '../utils/auth.js';
import { navigateTo } from '../utils/router.js';

export function initLobbyPage() {
  const lobbyPage = document.getElementById('lobby-page');
  
  const user = getUser();
  
  lobbyPage.innerHTML = `
    <div class="gradient-bg"></div>
    <div class="lobby-container">
      <div class="glass-card lobby-card">
        <div class="lobby-header text-center">
          <h1>🎮 LOBBY</h1>
          <p class="lobby-subtitle">Chào mừng, <strong>${user?.username || 'Player'}</strong>!</p>
        </div>

        <div class="user-info">
          <h3>Thông tin tài khoản</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Tài khoản:</span>
              <span class="info-value">${user?.username}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Số điện thoại:</span>
              <span class="info-value">${user?.phone}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tank:</span>
              <span class="info-value">${user?.selectedTank}</span>
            </div>
          </div>

          <div class="stats-grid mt-lg">
            <div class="stat-card">
              <div class="stat-value">${user?.stats?.gamesPlayed || 0}</div>
              <div class="stat-label">Trận đã chơi</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${user?.stats?.wins || 0}</div>
              <div class="stat-label">Thắng</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${user?.stats?.losses || 0}</div>
              <div class="stat-label">Thua</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${user?.stats?.kills || 0}</div>
              <div class="stat-label">Kills</div>
            </div>
          </div>
        </div>

        <div class="lobby-actions mt-xl">
          <button class="btn btn-primary btn-full btn-lg" id="find-match-btn">
            🔍 Tìm Trận
          </button>
          
          <button class="btn btn-secondary btn-full mt-md" id="logout-btn">
            🚪 Đăng Xuất
          </button>
        </div>
      </div>
    </div>
  `;

  // Handle logout
  const logoutBtn = lobbyPage.querySelector('#logout-btn');
  logoutBtn.addEventListener('click', () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      logout();
    }
  });

  // Handle find match (TODO: implement later)
  const findMatchBtn = lobbyPage.querySelector('#find-match-btn');
  findMatchBtn.addEventListener('click', () => {
    alert('Tính năng tìm trận đang phát triển!');
    // TODO: Implement matchmaking
  });
}
