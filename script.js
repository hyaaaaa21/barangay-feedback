let isAdminLoggedIn = false;
let currentLang = 'tl';
let reports = [];

const translations = {
    'en': {
        mainTitle: "Barangay Feedback System", subTitle: "Submit your suggestion for the barangay",
        userView: "User View", adminView: "Admin View", langLabel: "English",
        formHeader: "Submit Report", anonLabel: "Submit as Anonymous",
        nameLabel: "Name (Optional)", namePlaceholder: "Enter your name",
        catLabel: "Category *", msgLabel: "Message *", msgPlaceholder: "Describe your report...",
        btnSubmit: "Submit Report", feedTitle: "Recorded Reports", feedSub: "Status list",
        adminTitle: "Admin Dashboard", statTotal: "Total", statPending: "Pending", 
        statResolved: "Resolved", markResolved: "Mark as Resolved", markPending: "Mark as Pending"
    },
    'tl': {
        mainTitle: "Sistema ng Reklamo sa Barangay", subTitle: "Magsumite ng inyong reklamo o suggestion para sa ikabubuti ng ating barangay",
        userView: "User View", adminView: "Admin View", langLabel: "Tagalog",
        formHeader: "Magsumite ng Reklamo", anonLabel: "Isumite nang Anonymous",
        nameLabel: "Pangalan (Optional)", namePlaceholder: "Ipasok ang pangalan",
        catLabel: "Kategorya *", msgLabel: "Mensahe *", msgPlaceholder: "Ilarawan dito...",
        btnSubmit: "Isumite ang Reklamo", feedTitle: "Mga Reklamo", feedSub: "Status ng mga reklamo",
        adminTitle: "Admin Dashboard", statTotal: "Kabuuan", statPending: "Pending", 
        statResolved: "Resolved", markResolved: "Markahan bilang Resolved", markPending: "Markahan bilang Pending"
    }
};

const checkFirebase = setInterval(() => {
    if (window.db && window.firestore) {
        clearInterval(checkFirebase);
        startListening();
    }
}, 100);

function startListening() {
    const { collection, onSnapshot, query, orderBy } = window.firestore;
    const q = query(collection(window.db, "reports"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateUI();
    });
}

function updateUI() {
    const t = translations[currentLang];
    const userCont = document.getElementById('user-feed-container');
    const adminCont = document.getElementById('admin-feed-container');
    userCont.innerHTML = ''; adminCont.innerHTML = '';
    let p = 0, r = 0;

    reports.forEach(rep => {
        const isP = rep.status === 'pending';
        isP ? p++ : r++;
        const html = `
            <div class="report-card border-${rep.status}">
                <strong>${rep.name}</strong> <span class="tag-category">${rep.category}</span>
                <br><small style="color:gray;">${rep.date}</small>
                <p>${rep.message}</p>
                ${isAdminLoggedIn ? `
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button onclick="toggleStatus('${rep.id}', '${rep.status}')" class="submit-btn" style="background:${isP ? '#16a34a' : '#f59e0b'}; padding:8px;">${isP ? t.markResolved : t.markPending}</button>
                        <button onclick="deleteReport('${rep.id}')" class="submit-btn" style="background:#e11d48; width:45px; padding:8px;"><i class="fa-solid fa-trash"></i></button>
                    </div>` : ''}
            </div>`;
        userCont.innerHTML += html; adminCont.innerHTML += html;
    });

    document.getElementById('stat-total').innerText = reports.length;
    document.getElementById('stat-pending').innerText = p;
    document.getElementById('stat-resolved').innerText = r;
}

document.getElementById('feedbackForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const isAnon = document.getElementById('anonymous').checked;
    const nameVal = document.getElementById('userName').value.trim();
    const finalName = (isAnon || nameVal === "") ? "Anonymous" : nameVal;

    await window.firestore.addDoc(window.firestore.collection(window.db, "reports"), {
        name: finalName,
        category: document.getElementById('category').value,
        message: document.getElementById('message').value,
        status: 'pending',
        date: new Date().toLocaleString(),
        timestamp: Date.now()
    });
    this.reset();
});

async function toggleStatus(id, currentStatus) {
    const ns = (currentStatus === 'pending') ? 'resolved' : 'pending';
    await window.firestore.updateDoc(window.firestore.doc(window.db, "reports", id), { status: ns });
}

async function deleteReport(id) {
    if(confirm("Delete this?")) await window.firestore.deleteDoc(window.firestore.doc(window.db, "reports", id));
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

function showView(v) {
    if (v === 'admin-view' && !isAdminLoggedIn) { document.getElementById('loginModal').style.display = 'block'; }
    else {
        document.querySelectorAll('.view-section').forEach(s => s.style.display = 'none');
        document.getElementById(v).style.display = 'block';
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.getElementById('btn-' + v).classList.add('active');
        document.getElementById('nav-logout').style.display = isAdminLoggedIn ? 'flex' : 'none';
        updateUI();
    }
}

function checkLogin() {
    if (document.getElementById('adminPassword').value === "admin123") {
        isAdminLoggedIn = true; closeLogin(); showView('admin-view');
    } else { document.getElementById('loginError').style.display = 'block'; }
}
function closeLogin() { document.getElementById('loginModal').style.display = 'none'; }
function logoutAdmin() { isAdminLoggedIn = false; showView('user-view'); }
