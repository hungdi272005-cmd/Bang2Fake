/**
 * Google Sign-In SDK Integration
 * Shared module để sử dụng Google Sign-In trên nhiều pages
 */

// Google Client ID - thay đổi giá trị này bằng Client ID thực
const GOOGLE_CLIENT_ID = '867785016996-v484irt56acp696r4bmvla8jtr7bic40.apps.googleusercontent.com';

let googleScriptLoaded = false;
let googleInitialized = false;

/**
 * Load Google Sign-In SDK script
 */
function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (googleScriptLoaded) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleScriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Không thể tải Google Sign-In SDK'));
    document.head.appendChild(script);
  });
}

/**
 * Dọn dẹp tất cả UI liên quan đến Google Sign-In
 */
export function cleanupGoogleUI() {
  // 1. Xóa tất cả các div fallback
  const allTempDivs = document.querySelectorAll('#google-signin-temp');
  allTempDivs.forEach(div => div.remove());
  
  // 2. Tắt Google Prompt
  if (window.google && window.google.accounts && window.google.accounts.id) {
    try {
      window.google.accounts.id.cancel();
    } catch (e) {}
  }
}

/**
 * Khởi tạo Google Sign-In và mở popup chọn tài khoản
 * @param {Function} onSuccess - Callback nhận credential token khi đăng nhập thành công
 */
export async function initGoogleSignIn(onSuccess) {
  try {
    // Luôn dọn dẹp trước khi bắt đầu phiên mới
    cleanupGoogleUI();

    await loadGoogleScript();

    // Khởi tạo Google Identity Services
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      auto_select: false,
      context: 'signin',
      callback: (response) => {
        if (response.credential) {
          console.log('Google login successful, cleaning up UI...');
          cleanupGoogleUI();
          
          // Callback sau một chút delay để SDK dọn dẹp nội bộ
          setTimeout(() => {
            onSuccess(response.credential);
          }, 50);
        }
      }
    });

    // Mở One Tap / popup chọn tài khoản
    google.accounts.id.prompt((notification) => {
      // Nếu One Tap bị chặn hoặc bỏ qua, hiện fallback UI
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        
        // Kiểm tra nếu đã có popup rồi thì không tạo thêm
        if (document.getElementById('google-signin-temp')) return;

        const tempDiv = document.createElement('div');
        tempDiv.id = 'google-signin-temp';
        tempDiv.style.position = 'fixed';
        tempDiv.style.top = '50%';
        tempDiv.style.left = '50%';
        tempDiv.style.transform = 'translate(-50%, -50%)';
        tempDiv.style.zIndex = '10000';
        tempDiv.style.background = 'rgba(0,0,0,0.9)'; // Đậm hơn tí
        tempDiv.style.padding = '40px';
        tempDiv.style.borderRadius = '16px';
        tempDiv.style.textAlign = 'center';
        tempDiv.style.boxShadow = '0 0 40px rgba(0,0,0,0.5)';

        // Nút đóng
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = 'position:absolute;top:10px;right:15px;background:none;border:none;color:white;font-size:20px;cursor:pointer;';
        closeBtn.onclick = () => cleanupGoogleUI();
        tempDiv.appendChild(closeBtn);

        // Title
        const title = document.createElement('p');
        title.textContent = 'Chọn tài khoản Google';
        title.style.cssText = 'color:white;margin-bottom:20px;font-size:16px;font-weight:600;';
        tempDiv.appendChild(title);

        // Container cho nút Google
        const btnContainer = document.createElement('div');
        btnContainer.id = 'google-btn-container';
        tempDiv.appendChild(btnContainer);

        document.body.appendChild(tempDiv);

        // Render nút Google chính thức
        google.accounts.id.renderButton(btnContainer, {
          theme: 'filled_black',
          size: 'large',
          width: 300,
          text: 'signin_with',
          locale: 'vi'
        });
      }
    });
  } catch (error) {
    console.error('Google Sign-In error:', error);
    alert('Không thể khởi tạo đăng nhập Google. Vui lòng thử lại sau.');
  }
}
