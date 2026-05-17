// auth.js - Xử lý đăng nhập và phân quyền

let currentUser = null;
let userRole = null; // 'vanthu' hoặc 'leader'

const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

// Bắt sự kiện đăng nhập
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btn = loginForm.querySelector('button');

    try {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
        btn.disabled = true;
        loginError.style.display = 'none';

        // Fake Auth cho môi trường chưa cấu hình Firebase thực sự (mockup)
        // Trong thực tế, bạn sẽ dùng: await auth.signInWithEmailAndPassword(email, password);
        await mockLogin(email, password);
        
    } catch (error) {
        loginError.textContent = error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.';
        loginError.style.display = 'block';
        btn.innerHTML = 'Đăng nhập';
        btn.disabled = false;
    }
});

// Mock chức năng login để test giao diện
async function mockLogin(email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email === 'vanthukbxiii' && password === '12345678') {
                handleAuthStateChanged({ uid: 'vanthu123', email: email, role: 'vanthu', name: 'Văn Thư' });
                resolve();
            } else if (email === 'bgdkbnnxiii' && password === '123456') {
                handleAuthStateChanged({ uid: 'leader123', email: email, role: 'leader', name: 'Lãnh Đạo' });
                resolve();
            } else {
                reject(new Error("Sai tài khoản hoặc mật khẩu."));
            }
        }, 1000);
    });
}

// Bắt sự kiện đăng xuất
logoutBtn.addEventListener('click', () => {
    // Thực tế: auth.signOut();
    currentUser = null;
    userRole = null;
    appScreen.style.display = 'none';
    loginScreen.style.display = 'flex';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    loginForm.querySelector('button').innerHTML = 'Đăng nhập';
    loginForm.querySelector('button').disabled = false;
});

// Xử lý thay đổi trạng thái đăng nhập
// Thực tế dùng: auth.onAuthStateChanged(user => { ... })
async function handleAuthStateChanged(user) {
    if (user) {
        currentUser = user;
        
        // Thực tế: fetch role từ Firestore
        // const doc = await db.collection('users').doc(user.uid).get();
        // userRole = doc.data().role;
        userRole = user.role || 'leader'; 
        
        // Cập nhật UI Header
        document.getElementById('user-display-name').textContent = user.name || user.email;
        const roleBadge = document.getElementById('user-role-badge');
        roleBadge.textContent = userRole === 'vanthu' ? 'Văn thư' : 'Lãnh đạo';
        roleBadge.style.background = userRole === 'vanthu' ? '#fee2e2' : '#fef3c7'; // Đỏ nhạt cho văn thư, Vàng nhạt cho lãnh đạo
        roleBadge.style.color = userRole === 'vanthu' ? '#B91C1C' : '#D97706'; // Đỏ đậm / Vàng đậm
        
        // Ẩn/Hiện nút Thêm lịch và Xuất tùy Role
        const addScheduleBtn = document.getElementById('add-schedule-btn');
        const exportExcelBtn = document.getElementById('export-excel-btn');
        if (userRole === 'vanthu') {
            addScheduleBtn.style.display = 'inline-flex';
            if (exportExcelBtn) exportExcelBtn.style.display = 'inline-flex';
        } else {
            addScheduleBtn.style.display = 'none';
            if (exportExcelBtn) exportExcelBtn.style.display = 'none';
        }

        // Chuyển màn hình
        loginScreen.style.display = 'none';
        appScreen.style.display = 'flex';
        
        // Gọi hàm khởi tạo App (từ app.js)
        if(typeof initApp === 'function') initApp();
    } else {
        appScreen.style.display = 'none';
        loginScreen.style.display = 'flex';
    }
}
