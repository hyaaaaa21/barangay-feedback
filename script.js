// Load reports from LocalStorage or start with empty array
let reports = JSON.parse(localStorage.getItem('barangay_reports')) || [];
let isAdminLoggedIn = false;
let currentLang = 'tl';

const translations = {
    'en': {
        mainTitle: "Barangay Complaint & Feedback System",
        subTitle: "Submit your complaint or suggestion for the improvement of our barangay",
        userView: "User View",
        adminView: "Admin View",
        langLabel: "English",
        formHeader: "Submit Report or Suggestion",
        anonLabel: "Submit as Anonymous",
        nameLabel: "Name (Optional)",
        namePlaceholder: "Enter your name",
        catLabel: "Category *",
        msgLabel: "Message *",
        msgPlaceholder: "Describe your report or suggestion...",
        btnSubmit: "Submit Report",
        feedTitle: "Recorded Reports",
        feedSub: "View the status of reports",
        adminTitle: "Admin Dashboard",
        statTotal: "Total",
        statPending: "Pending",
        statResolved: "Resolved",
        markResolved: "Mark as Resolved",
        markPending: "Mark as Pending"
    },
    'tl': {
        mainTitle: "Sistema ng Reklamo at Feedback sa Barangay",
        subTitle: "Magsumite ng inyong reklamo o suggestion para sa ikabubuti ng ating barangay",
        userView: "User View",
        adminView: "Admin View",
        langLabel: "Tagalog",
        formHeader: "Magsumite ng Reklamo o Suggestion",
        anonLabel: "Isumite nang Anonymous",
        nameLabel: "Pangalan (Optional)",
        namePlaceholder: "Ipasok ang inyong pangalan",
        catLabel: "Kategorya *",
        msgLabel: "Mensahe *",
        msgPlaceholder: "Ilarawan ang inyong reklamo o suggestion...",
        btnSubmit: "Isumite ang Reklamo",
        feedTitle: "Mga Naitala na Reklamo",
        feedSub: "Tingnan ang status ng mga reklamo",
        adminTitle: "Admin Dashboard",
        statTotal: "Kabuuan",
        statPending: "Pending",
        statResolved: "Resolved",
        markResolved: "Markahan bilang Resolved",
        markPending: "Markahan bilang Pending"
    }
};

function saveToLocal() {
    localStorage.setItem('barangay_reports', JSON.stringify(reports));
}

function toggleLanguage() {
    currentLang = (currentLang === 'en') ? 'tl' : 'en';
    const t = translations[currentLang];

    document.getElementById('main-title').innerText = t.mainTitle;
    document.getElementById('sub-title').innerText = t.subTitle;
    document.getElementById('txt-user-view').innerText = t.userView;
    document.getElementById('txt-admin-view').innerText = t.adminView;
    document.getElementById('lang-label').innerText = t.langLabel;
    document.getElementById('form-header').innerText = t.formHeader;
    document.getElementById('lbl-anon').innerText = t.anonLabel;
    document.getElementById('lbl-name').innerText = t.nameLabel;
    document.getElementById('userName').placeholder = t.namePlaceholder;
    document.getElementById('lbl-category').innerText = t.catLabel;
    document.getElementById('lbl-message').innerText = t.msgLabel;
    document.getElementById('message').placeholder = t.msgPlaceholder;
    document.getElementById('btn-text').innerText = t.btnSubmit;
    document.getElementById('feed-title').innerText = t.feedTitle;
    document.getElementById('feed-sub').innerText = t.feedSub;
    document.getElementById('admin-title-text').innerText = t.adminTitle;
    document.getElementById('lbl-stat-total').innerText = t.statTotal;
    document.getElementById('lbl-stat-pending').innerText = t.statPending;
    document.getElementById('lbl-stat-resolved').innerText = t.statResolved;
    
    updateUI();
}

function updateUI() {
    const t = translations[currentLang];
    const userContainer = document.getElementById('user-feed-container');
    const adminContainer = document.getElementById('admin-feed-container');
    
    userContainer.innerHTML = '';
    adminContainer.innerHTML = '';

    let pCount = 0;
    let rCount = 0;

    reports.forEach(r => {
        const isP = r.status === 'pending';
        if (isP) pCount++; else rCount++;

        const cardHTML = `
            <div class="report-card border-${r.status}">
                <strong>${r.name}</strong> <span class="tag-category">${r.category}</span>
                <br><small style="color: #64748b;">${r.date}</small>
                <p style="margin: 15px 0;">${r.message}</p>
                ${isAdminLoggedIn ? `
                    <div style="display:flex; gap:10px;">
                        <button onclick="toggleStatus(${r.id})" class="submit-btn" style="margin-top:5px; background:${isP ? '#16a34a' : '#f59e0b'}">
                            <i class="fa-solid ${isP ? 'fa-check' : 'fa-arrow-rotate-left'}"></i> 
                            ${isP ? t.markResolved : t.markPending}
                        </button>
                        <button onclick="deleteReport(${r.id})" class="submit-btn" style="margin-top:5px; background:#e11d48; width: 50px;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>` : ''}
            </div>`;
        
        userContainer.innerHTML += cardHTML;
        adminContainer.innerHTML += cardHTML;
    });

    document.getElementById('stat-total').innerText = reports.length;
    document.getElementById('stat-pending').innerText = pCount;
    document.getElementById('stat-resolved').innerText = rCount;
    document.getElementById('nav-logout').style.display = isAdminLoggedIn ? 'flex' : 'none';
}

function toggleStatus(id) {
    const r = reports.find(report => report.id === id);
    r.status = (r.status === 'pending') ? 'resolved' : 'pending';
    saveToLocal();
    updateUI();
}

function deleteReport(id) {
    if(confirm("Sigurado ka ba na gusto mong burahin ito?")) {
        reports = reports.filter(r => r.id !== id);
        saveToLocal();
        updateUI();
    }
}

function showView(viewId) {
    if (viewId === 'admin-view' && !isAdminLoggedIn) {
        document.getElementById('loginModal').style.display = 'block';
    } else {
        document.querySelectorAll('.view-section').forEach(s => s.style.display = 'none');
        document.getElementById(viewId).style.display = 'block';
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.getElementById('btn-' + viewId).classList.add('active');
        updateUI();
    }
}

function checkLogin() {
    if (document.getElementById('adminPassword').value === "admin123") {
        isAdminLoggedIn = true;
        closeLogin();
        showView('admin-view');
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function closeLogin() { document.getElementById('loginModal').style.display = 'none'; }
function logoutAdmin() { isAdminLoggedIn = false; showView('user-view'); }

document.getElementById('feedbackForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const isAnon = document.getElementById('anonymous').checked;
    reports.unshift({
        id: Date.now(),
        name: isAnon ? "Anonymous" : (document.getElementById('userName').value || "Anonymous"),
        category: document.getElementById('category').value,
        message: document.getElementById('message').value,
        status: 'pending',
        date: new Date().toLocaleString()
    });
    saveToLocal();
    updateUI();
    this.reset();
});

// Load the UI with saved data on startup
window.onload = updateUI;