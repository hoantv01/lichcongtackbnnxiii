// app.js - Logic chính của ứng dụng

let mockLeaders = [];

async function loadLeaders() {
    try {
        const response = await fetch('lanhdao.txt');
        if (!response.ok) throw new Error('Cannot load lanhdao.txt');
        const text = await response.text();
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        mockLeaders = lines.map((name, index) => ({
            id: 'l' + (index + 1),
            name: name,
            role: 'Lãnh đạo', // Có thể tuỳ biến thêm
            order: index + 1
        }));
    } catch (e) {
        console.warn('Lỗi đọc lanhdao.txt (chạy qua file:// hoặc không tìm thấy). Đang dùng dữ liệu mẫu.');
        mockLeaders = [
            { id: 'l1', name: 'Nguyễn Văn A', role: 'Giám đốc', order: 1 },
            { id: 'l2', name: 'Trần Thị B', role: 'Phó Giám đốc', order: 2 },
            { id: 'l3', name: 'Lê Văn C', role: 'Phó Giám đốc', order: 3 },
        ];
    }
}

let mockSchedules = [
    {
        id: 's1', leaderId: 'l1', date: formatDate(new Date()), timeOfDay: 'morning',
        content: 'Họp giao ban thường kỳ', attachmentUrl: null
    },
    {
        id: 's2', leaderId: 'l2', date: formatDate(new Date()), timeOfDay: 'afternoon',
        content: 'Làm việc với đối tác', attachmentUrl: 'https://via.placeholder.com/150'
    }
];

// --- Trạng thái Ứng dụng ---
let currentDate = new Date(); // Ngày hiện tại đang xem (giữa tuần)
let currentFilter = 'all';

// --- Khởi tạo ---
async function initApp() {
    await loadLeaders();
    setupModals();
    renderLeaderFilter();
    renderCalendar();
}

// --- Tiện ích Ngày tháng ---
function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
}

function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Thứ 2 là đầu tuần
    return new Date(d.setDate(diff));
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// --- Render Bảng Lịch ---
function renderCalendar() {
    const startOfWeek = getStartOfWeek(currentDate);
    
    // Cập nhật text hiển thị tuần
    const endOfWeek = addDays(startOfWeek, 6);
    document.getElementById('current-week-display').textContent = 
        `Tuần ${getWeekNumber(currentDate)} (${formatDateVN(startOfWeek)} - ${formatDateVN(endOfWeek)})`;

    // 1. Render Header (Thứ 2 -> Chủ Nhật)
    const headerRow = document.getElementById('calendar-header-row');
    // Xóa các cột ngày cũ, giữ lại cột đầu tiên (Lãnh đạo)
    while (headerRow.children.length > 1) {
        headerRow.removeChild(headerRow.lastChild);
    }
    
    const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
    for (let i = 0; i < 7; i++) {
        const curDate = addDays(startOfWeek, i);
        const th = document.createElement('th');
        const isToday = formatDate(curDate) === formatDate(new Date());
        
        th.innerHTML = `
            <div class="day-header ${isToday ? 'today' : ''}">
                <span class="day">${daysOfWeek[i]}</span>
                <span class="date">${curDate.getDate()}/${curDate.getMonth() + 1}</span>
            </div>
        `;
        headerRow.appendChild(th);
    }

    // 2. Render Body (Lãnh đạo & Các ô lịch)
    const tbody = document.getElementById('calendar-body');
    tbody.innerHTML = '';

    const leadersToRender = currentFilter === 'all' 
        ? mockLeaders 
        : mockLeaders.filter(l => l.id === currentFilter);

    leadersToRender.forEach(leader => {
        const tr = document.createElement('tr');
        
        // Cột tên Lãnh đạo
        const tdName = document.createElement('td');
        tdName.className = 'col-leader';
        tdName.innerHTML = `
            <div>${leader.name}</div>
            <div style="font-size: 12px; font-weight: 400; color: var(--text-muted)">${leader.role}</div>
        `;
        tr.appendChild(tdName);

        // 7 cột cho 7 ngày
        for (let i = 0; i < 7; i++) {
            const curDate = addDays(startOfWeek, i);
            const dateStr = formatDate(curDate);
            
            const td = document.createElement('td');
            td.className = 'schedule-cell';
            
            // Tìm các lịch của lãnh đạo này trong ngày này
            const dailySchedules = mockSchedules.filter(
                s => s.leaderId === leader.id && s.date === dateStr
            );

            dailySchedules.forEach(schedule => {
                const sEl = document.createElement('div');
                sEl.className = `schedule-item ${schedule.timeOfDay}`;
                sEl.innerHTML = `
                    <div class="schedule-time-badge">${getTimeText(schedule.timeOfDay)}</div>
                    <div class="schedule-title">${schedule.content}</div>
                    ${schedule.attachmentUrl ? '<i class="fa-solid fa-paperclip schedule-has-attachment"></i>' : ''}
                `;
                
                // Click để xem chi tiết
                sEl.addEventListener('click', () => openViewModal(schedule, leader));
                td.appendChild(sEl);
            });

            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return weekNo;
}
function formatDateVN(date) {
    return `${date.getDate()}/${date.getMonth() + 1}`;
}
function getTimeText(time) {
    if(time === 'morning') return 'Sáng';
    if(time === 'afternoon') return 'Chiều';
    return 'Cả ngày';
}

// --- Điều hướng Tuần ---
document.getElementById('prev-week-btn').addEventListener('click', () => {
    currentDate = addDays(currentDate, -7);
    renderCalendar();
});
document.getElementById('next-week-btn').addEventListener('click', () => {
    currentDate = addDays(currentDate, 7);
    renderCalendar();
});
document.getElementById('today-btn').addEventListener('click', () => {
    currentDate = new Date();
    renderCalendar();
});

// --- Lọc Lãnh đạo ---
function renderLeaderFilter() {
    const select = document.getElementById('leader-filter');
    const scheduleLeaderSelect = document.getElementById('schedule-leader'); // Dành cho form thêm mới
    
    // Xoá dữ liệu cũ để tránh bị duplicate khi đăng nhập lại nhiều lần
    select.innerHTML = '<option value="all">Tất cả</option>';
    scheduleLeaderSelect.innerHTML = '';
    
    mockLeaders.forEach(l => {
        // Option cho bộ lọc
        const opt = document.createElement('option');
        opt.value = l.id;
        opt.textContent = l.name;
        select.appendChild(opt);

        // Option cho form thêm mới
        const opt2 = document.createElement('option');
        opt2.value = l.id;
        opt2.textContent = l.name;
        scheduleLeaderSelect.appendChild(opt2);
    });

    select.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderCalendar();
    });
}

// --- Modals ---
const scheduleModal = document.getElementById('schedule-modal');
const viewModal = document.getElementById('view-modal');
const addBtn = document.getElementById('add-schedule-btn');
const scheduleForm = document.getElementById('schedule-form');

function setupModals() {
    // Đóng Modal
    document.querySelectorAll('.close-modal, .cancel-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            scheduleModal.classList.remove('active');
            viewModal.classList.remove('active');
            scheduleForm.reset();
        });
    });

    // Mở Form thêm mới
    addBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Thêm Lịch Công Tác';
        document.getElementById('schedule-id').value = '';
        document.getElementById('schedule-date').value = formatDate(new Date());
        document.getElementById('file-upload-status').innerHTML = '';
        scheduleModal.classList.add('active');
    });

    // Submit Form
    scheduleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Giả lập lưu dữ liệu
        const newSchedule = {
            id: document.getElementById('schedule-id').value || 's' + Date.now(),
            leaderId: document.getElementById('schedule-leader').value,
            date: document.getElementById('schedule-date').value,
            timeOfDay: document.querySelector('input[name="timeOfDay"]:checked').value,
            content: document.getElementById('schedule-content').value,
            attachmentUrl: document.getElementById('schedule-file').files.length > 0 ? 'https://via.placeholder.com/300?text=Mock+Attachment' : null
        };

        const existingIdx = mockSchedules.findIndex(s => s.id === newSchedule.id);
        if(existingIdx >= 0) {
            mockSchedules[existingIdx] = newSchedule;
        } else {
            mockSchedules.push(newSchedule);
        }

        scheduleModal.classList.remove('active');
        scheduleForm.reset();
        renderCalendar();
    });
}

function openViewModal(schedule, leader) {
    const body = document.getElementById('view-details-body');
    const footer = document.getElementById('view-modal-footer');
    
    body.innerHTML = `
        <div style="margin-bottom: 12px;">
            <span style="color: var(--text-muted); font-size: 13px;">Lãnh đạo:</span>
            <div style="font-weight: 600; font-size: 16px;">${leader.name}</div>
        </div>
        <div class="form-row" style="margin-bottom: 12px;">
            <div>
                <span style="color: var(--text-muted); font-size: 13px;">Ngày:</span>
                <div style="font-weight: 600;">${schedule.date.split('-').reverse().join('/')}</div>
            </div>
            <div>
                <span style="color: var(--text-muted); font-size: 13px;">Thời gian:</span>
                <div style="font-weight: 600;">${getTimeText(schedule.timeOfDay)}</div>
            </div>
        </div>
        <div style="margin-bottom: 12px;">
            <span style="color: var(--text-muted); font-size: 13px;">Nội dung:</span>
            <div style="font-weight: 400; line-height: 1.5; white-space: pre-wrap; padding: 8px; background: #f8fafc; border-radius: var(--radius-sm); margin-top:4px;">${schedule.content}</div>
        </div>
        ${schedule.attachmentUrl ? `
            <div class="attachment-preview">
                <span style="color: var(--text-muted); font-size: 13px;">File đính kèm:</span><br>
                <img src="${schedule.attachmentUrl}" alt="Attachment">
                <a href="${schedule.attachmentUrl}" target="_blank" class="btn-outline btn-small"><i class="fa-solid fa-download"></i> Tải xuống</a>
            </div>
        ` : ''}
    `;

    // Nếu là văn thư, hiển thị nút sửa/xoá
    if (userRole === 'vanthu') {
        footer.innerHTML = `
            <button class="btn-secondary" id="btn-delete-schedule"><i class="fa-solid fa-trash"></i> Xoá</button>
            <button class="btn-primary" id="btn-edit-schedule"><i class="fa-solid fa-pen"></i> Sửa</button>
        `;
        
        document.getElementById('btn-delete-schedule').onclick = () => {
            if(confirm('Bạn có chắc chắn muốn xoá lịch này?')) {
                mockSchedules = mockSchedules.filter(s => s.id !== schedule.id);
                viewModal.classList.remove('active');
                renderCalendar();
            }
        };

        document.getElementById('btn-edit-schedule').onclick = () => {
            viewModal.classList.remove('active');
            
            document.getElementById('modal-title').textContent = 'Sửa Lịch Công Tác';
            document.getElementById('schedule-id').value = schedule.id;
            document.getElementById('schedule-leader').value = schedule.leaderId;
            document.getElementById('schedule-date').value = schedule.date;
            document.querySelector(`input[name="timeOfDay"][value="${schedule.timeOfDay}"]`).checked = true;
            document.getElementById('schedule-content').value = schedule.content;
            
            scheduleModal.classList.add('active');
        };
    } else {
        footer.innerHTML = `<button class="btn-primary close-modal-footer">Đóng</button>`;
        footer.querySelector('.close-modal-footer').onclick = () => viewModal.classList.remove('active');
    }

    viewModal.classList.add('active');
}

// --- Xuất Excel ---
const exportExcelBtn = document.getElementById('export-excel-btn');
if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', () => {
        // Chuẩn bị dữ liệu
        const data = [];
        
        // Sắp xếp lịch theo ngày
        const sortedSchedules = [...mockSchedules].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        sortedSchedules.forEach(s => {
            const leader = mockLeaders.find(l => l.id === s.leaderId);
            const leaderName = leader ? leader.name : 'Không rõ';
            
            data.push({
                'Ngày': s.date.split('-').reverse().join('/'),
                'Lãnh đạo': leaderName,
                'Thời gian': getTimeText(s.timeOfDay),
                'Nội dung công tác': s.content
            });
        });

        if (data.length === 0) {
            alert('Không có dữ liệu lịch công tác để xuất.');
            return;
        }

        // Tạo worksheet và workbook (Sử dụng thư viện SheetJS xlsx)
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Lịch Công Tác");
        
        // Căn chỉnh độ rộng cột
        const wscols = [
            {wch: 15}, // Ngày
            {wch: 25}, // Lãnh đạo
            {wch: 15}, // Thời gian
            {wch: 60}  // Nội dung
        ];
        ws['!cols'] = wscols;

        // Tải file xuống
        XLSX.writeFile(wb, "Lich_Cong_Tac.xlsx");
    });
}
