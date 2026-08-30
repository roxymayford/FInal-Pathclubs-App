# ─────────────────────────────────────────────────────────────────────────────
# BACKEND APP.PY - WITH USER PROGRESS, ML RECS & ADMIN MATERI MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────

import os
import pickle
import numpy as np
import joblib
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# ─── Load Environment Variables ──────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(BASE_DIR, '.env'))
except ImportError:
    pass



GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    "244826909624-055j98h4rd5m8m9ruvami0invr46muof.apps.googleusercontent.com"
)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "iscLP")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "kelompok9")
PORT = int(os.getenv("PORT", 5000))


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Database configuration: support Cloud DB via DATABASE_URL or fallback to local SQLite
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(BASE_DIR, 'learning_path.db')}"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)

# ─── Models ───────────────────────────────────────────────────────────────────
class User(db.Model):
    __tablename__ = 'users'
    id            = db.Column(db.Integer, primary_key=True)
    google_id     = db.Column(db.String(100), unique=True, nullable=True)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)
    avatar        = db.Column(db.Text, nullable=True)
    grade         = db.Column(db.String(100), default='SMA Kelas 10')
    role          = db.Column(db.String(20), default='user') # 'user' or 'admin'
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    is_new        = db.Column(db.Boolean, default=True)

    recommendations = db.relationship('CareerRecommendation', backref='user', lazy=True)
    progress = db.relationship('UserProgress', backref='user', uselist=False, lazy=True)

    def to_dict(self):
        return {
            "id":         self.id,
            "name":       self.name,
            "email":      self.email,
            "avatar":     self.avatar,
            "grade":      self.grade or 'SMA Kelas 10',
            "role":       self.role or 'user',
            "google_id":  self.google_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CareerRecommendation(db.Model):
    __tablename__ = 'career_recommendations'
    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    top_career    = db.Column(db.String(150), nullable=False)
    skills        = db.Column(db.Text, nullable=True)
    interests     = db.Column(db.Text, nullable=True)
    probabilities = db.Column(db.Text, nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at    = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id":            self.id,
            "user_id":       self.user_id,
            "top_career":    self.top_career,
            "skills":        json.loads(self.skills)        if self.skills        else [],
            "interests":     json.loads(self.interests)     if self.interests     else [],
            "probabilities": json.loads(self.probabilities) if self.probabilities else {},
            "created_at":    self.created_at.isoformat() if self.created_at else None,
        }


class UserProgress(db.Model):
    __tablename__ = 'user_progress'
    id                = db.Column(db.Integer, primary_key=True)
    user_id           = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    completed_modules = db.Column(db.Text, default='[]')
    completed_quizzes = db.Column(db.Text, default='[]')
    quiz_xp           = db.Column(db.Integer, default=0)
    daily_target      = db.Column(db.Text, default='{}')
    preferences       = db.Column(db.Text, default='{}')
    unlocked_badges   = db.Column(db.Text, default='[]')
    last_login_date   = db.Column(db.String(20), nullable=True)
    stats             = db.Column(db.Text, default='[]')
    notifications     = db.Column(db.Text, default='[]')
    updated_at        = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "completedModules":  json.loads(self.completed_modules)  if self.completed_modules  else [],
            "completedQuizzes":  json.loads(self.completed_quizzes)  if self.completed_quizzes  else [],
            "quizXp":            self.quiz_xp,
            "dailyTarget":       json.loads(self.daily_target)       if self.daily_target       else {},
            "preferences":       json.loads(self.preferences)       if self.preferences       else {},
            "unlockedBadges":    json.loads(self.unlocked_badges)    if self.unlocked_badges    else [],
            "lastLoginDate":     self.last_login_date,
            "stats":             json.loads(self.stats)             if self.stats             else [],
            "notifications":     json.loads(self.notifications)     if self.notifications     else [],
        }


class Subject(db.Model):
    __tablename__ = 'subjects'
    id          = db.Column(db.Integer, primary_key=True)
    title       = db.Column(db.String(150), nullable=False)
    icon        = db.Column(db.String(50), default='BookOpen')
    color       = db.Column(db.String(50), default='text-blue-600')
    bg_color    = db.Column(db.String(50), default='bg-blue-50')
    order       = db.Column(db.Integer, default=0)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    modules     = db.relationship('Materi', backref='subject', cascade='all, delete-orphan', lazy=True, order_by='Materi.order')

    def to_dict(self, include_modules=True):
        data = {
            "id":        self.id,
            "title":     self.title,
            "icon":      self.icon,
            "color":     self.color,
            "bgColor":   self.bg_color,
            "order":     self.order,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }
        if include_modules:
            data["modules"] = [m.to_dict() for m in self.modules]
        return data


class Materi(db.Model):
    __tablename__ = 'materi'
    id          = db.Column(db.Integer, primary_key=True)
    subject_id  = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
    title       = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    duration    = db.Column(db.String(50), default='15:00')
    type        = db.Column(db.String(50), default='Video')  # 'Video', 'Video + Artikel', 'Artikel', 'Interaktif'
    video_url   = db.Column(db.String(500), nullable=True)
    content     = db.Column(db.Text, nullable=True)
    xp_reward   = db.Column(db.Integer, default=50)
    is_locked   = db.Column(db.Boolean, default=False)
    order       = db.Column(db.Integer, default=0)
    careers     = db.Column(db.Text, default='["Semua Karir"]')  # JSON list of career names
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        careers_parsed = ["Semua Karir"]
        if self.careers:
            try:
                careers_parsed = json.loads(self.careers)
            except Exception:
                careers_parsed = [self.careers]

        return {
            "id":           self.id,
            "subjectId":    self.subject_id,
            "subjectTitle": self.subject.title if self.subject else None,
            "title":        self.title,
            "description":  self.description or '',
            "duration":     self.duration or '15:00',
            "type":         self.type or 'Video',
            "videoUrl":     self.video_url or '',
            "content":      self.content or '',
            "xpReward":     self.xp_reward or 50,
            "isLocked":     bool(self.is_locked),
            "order":        self.order or 0,
            "careers":      careers_parsed,
            "createdAt":    self.created_at.isoformat() if self.created_at else None,
            "updatedAt":    self.updated_at.isoformat() if self.updated_at else None
        }


# ─── Create tables & Seed default data on startup ─────────────────────────────
def seed_default_data():
    if Subject.query.count() == 0:
        print("[SEED] Seeding initial subjects and materi with career tracks...")
        # 1. Subjects
        s1 = Subject(title='Aljabar Linear & Matematika AI', icon='Calculator', color='text-blue-600', bg_color='bg-blue-50', order=1)
        s2 = Subject(title='Struktur Data & Algoritma', icon='GitBranch', color='text-violet-600', bg_color='bg-violet-50', order=2)
        s3 = Subject(title='Probabilitas & Statistika Data', icon='PieChart', color='text-green-600', bg_color='bg-green-50', order=3)
        s4 = Subject(title='Pemrograman Web & Software', icon='BookOpen', color='text-indigo-600', bg_color='bg-indigo-50', order=4)
        s5 = Subject(title='UI/UX Design & Prototyping', icon='Layers', color='text-pink-600', bg_color='bg-pink-50', order=5)
        s6 = Subject(title='Jaringan Komputer & Cloud Security', icon='ShieldCheck', color='text-orange-600', bg_color='bg-orange-50', order=6)
        s7 = Subject(title='Product Management & Strategi Bisnis', icon='Briefcase', color='text-emerald-600', bg_color='bg-emerald-50', order=7)

        db.session.add_all([s1, s2, s3, s4, s5, s6, s7])
        db.session.flush()

        materi_list = [
            # ── Data & AI Track ──
            Materi(
                subject_id=s1.id,
                title='Konsep Dasar Vektor & Matriks untuk AI',
                description='Pengantar representasi ruang vektor dan operasi matriks dalam Machine Learning.',
                duration='18:20',
                type='Video',
                video_url='https://www.youtube.com/watch?v=fNk_zzaMoSs',
                content='### Pengantar Aljabar Linear\nAljabar linear adalah fondasi komputasi data dalam Machine Learning dan Data Science.',
                xp_reward=50,
                is_locked=False,
                order=1,
                careers=json.dumps(['Data & AI'])
            ),
            Materi(
                subject_id=s3.id,
                title='Probabilitas & Distribusi Data',
                description='Konsep peluang, ruang sampel, distribusi normal, dan inferensi data.',
                duration='20:45',
                type='Video',
                video_url='https://www.youtube.com/watch?v=uzkc-qNVoOk',
                content='### Teori Peluang\nMemahami variabel acak dan distribusi probabilitas untuk pemodelan data prediktif.',
                xp_reward=50,
                is_locked=True,
                order=2,
                careers=json.dumps(['Data & AI'])
            ),
            Materi(
                subject_id=s3.id,
                title='Teorema Bayes & Algoritma Klasifikasi',
                description='Penerapan inferensi Bayesian dalam Naive Bayes Classifier dan optimasi model.',
                duration='26:30',
                type='Video + Artikel',
                video_url='https://www.youtube.com/watch?v=HZGCoVF3YvM',
                content='### Teorema Bayes\nMenghitung probabilitas posterior berdasarkan prior dan likelihood.',
                xp_reward=60,
                is_locked=True,
                order=3,
                careers=json.dumps(['Data & AI'])
            ),
            Materi(
                subject_id=s1.id,
                title='Eigenvalue & Reduksi Dimensi (PCA)',
                description='Transformasi data multidimensi dan analisis komponen utama untuk Big Data.',
                duration='22:15',
                type='Video',
                video_url='https://www.youtube.com/watch?v=PFDu9oVAE-g',
                content='### PCA & Eigenvector\nTeknik esensial untuk kompresi fitur dan eksplorasi data tingkat lanjut.',
                xp_reward=60,
                is_locked=True,
                order=4,
                careers=json.dumps(['Data & AI'])
            ),

            # ── Software Development Track ──
            Materi(
                subject_id=s2.id,
                title='Dasar Struktur Data: Array, Stack & Queue',
                description='Penyimpanan memori terstruktur dan efisiensi akses elemen pada pemrograman modern.',
                duration='16:40',
                type='Video',
                video_url='https://www.youtube.com/watch?v=09_LlHjoEiY',
                content='### Struktur Data Dasar\nFondasi utama logika komputasi dan manajemen memori dalam software engineering.',
                xp_reward=50,
                is_locked=False,
                order=1,
                careers=json.dumps(['Software Development'])
            ),
            Materi(
                subject_id=s4.id,
                title='Arsitektur RESTful API & Backend Services',
                description='Mendesain endpoint API scalable, HTTP method, status code, dan JSON payload.',
                duration='24:15',
                type='Video + Artikel',
                video_url='https://www.youtube.com/watch?v=kYB8IZa5AuE',
                content='### RESTful API Design\nStandar komunikasi data client-server pada sistem terdistribusi modern.',
                xp_reward=50,
                is_locked=True,
                order=2,
                careers=json.dumps(['Software Development'])
            ),
            Materi(
                subject_id=s2.id,
                title='Algoritma Graf & Shortest Path Dijkstra',
                description='Pemodelan relasi node, adjacency matrix, dan pencarian lintasan terpendek.',
                duration='25:00',
                type='Video + Artikel',
                video_url='https://www.youtube.com/watch?v=EFg3u_E6eHU',
                content='### Graf & Dijkstra\nAlgoritma esensial untuk navigasi rute dan pemrosesan jaringan relasional.',
                xp_reward=60,
                is_locked=True,
                order=3,
                careers=json.dumps(['Software Development'])
            ),
            Materi(
                subject_id=s4.id,
                title='Git Version Control & CI/CD Pipeline',
                description='Branching strategy, pull request workflow, automated testing, dan deployment.',
                duration='28:00',
                type='Video + Interaktif',
                video_url='https://www.youtube.com/watch?v=_uQrJ0TkZlc',
                content='### Git & DevOps Dasar\nKolaborasi kode skala tim dan integrasi otomatis perangkat lunak.',
                xp_reward=60,
                is_locked=True,
                order=4,
                careers=json.dumps(['Software Development'])
            ),

            # ── Design Track ──
            Materi(
                subject_id=s5.id,
                title='Prinsip Desain Antarmuka (UI/UX) & Layout',
                description='Visual hierarchy, color theory, spacing, dan navigasi ramah pengguna.',
                duration='17:30',
                type='Video',
                video_url='https://www.youtube.com/watch?v=fNk_zzaMoSs',
                content='### Dasar UI/UX Design\nMemahami psikologi pengguna dan tata letak responsif pada aplikasi modern.',
                xp_reward=50,
                is_locked=False,
                order=1,
                careers=json.dumps(['Design'])
            ),
            Materi(
                subject_id=s5.id,
                title='Design System & Component Reusability',
                description='Membangun sistem token warna, tipografi terstruktur, dan komponen UI di Figma.',
                duration='21:40',
                type='Video + Artikel',
                video_url='https://www.youtube.com/watch?v=kYB8IZa5AuE',
                content='### Design System\nMenjaga konsistensi estetika dan skalabilitas antarmuka aplikasi digital.',
                xp_reward=50,
                is_locked=True,
                order=2,
                careers=json.dumps(['Design'])
            ),
            Materi(
                subject_id=s5.id,
                title='Wireframing, Prototyping & Usability Test',
                description='Membuat alur interaktif prototipe dan validasi pengalaman pengguna.',
                duration='26:00',
                type='Video + Interaktif',
                video_url='https://www.youtube.com/watch?v=EFg3u_E6eHU',
                content='### Usability Testing\nMenguji kemudahan penggunaan dan kepuasan pengguna sebelum tahap koding.',
                xp_reward=60,
                is_locked=True,
                order=3,
                careers=json.dumps(['Design'])
            ),

            # ── Infrastructure & Security Track ──
            Materi(
                subject_id=s6.id,
                title='Dasar Jaringan Komputer & Model OSI',
                description='Protokol TCP/IP, DNS, Routing, Subnetting, dan arsitektur internet.',
                duration='19:15',
                type='Video',
                video_url='https://www.youtube.com/watch?v=09_LlHjoEiY',
                content='### Networking Fundamentals\nMemahami bagaimana paket data ditransmisikan melintasi jaringan global.',
                xp_reward=50,
                is_locked=False,
                order=1,
                careers=json.dumps(['Infrastructure & Security'])
            ),
            Materi(
                subject_id=s6.id,
                title='Keamanan Siber & Kriptografi Modern',
                description='Enkripsi simetris/asimetris, hashing, JWT, SSL/TLS, dan proteksi serangan web.',
                duration='25:50',
                type='Video + Artikel',
                video_url='https://www.youtube.com/watch?v=HZGCoVF3YvM',
                content='### Cybersecurity & Cryptography\nMenjaga integritas, kerahasiaan, dan otentikasi data dalam sistem IT.',
                xp_reward=60,
                is_locked=True,
                order=2,
                careers=json.dumps(['Infrastructure & Security'])
            ),
            Materi(
                subject_id=s6.id,
                title='Cloud Infrastructure & Docker Containerization',
                description='Virtualisasi, Docker container, cluster orchestration, dan layanan cloud AWS/GCP.',
                duration='27:30',
                type='Video + Interaktif',
                video_url='https://www.youtube.com/watch?v=9vKqVkMQHKk',
                content='### Cloud & Containers\nMenjalankan dan mengelola aplikasi di lingkungan cloud yang terisolasi dan tangguh.',
                xp_reward=60,
                is_locked=True,
                order=3,
                careers=json.dumps(['Infrastructure & Security'])
            ),

            # ── Product & Business Track ──
            Materi(
                subject_id=s7.id,
                title='Product Discovery & Minimum Viable Product (MVP)',
                description='Identifikasi problem market, analisis kompetitor, dan formulasi value proposition.',
                duration='18:00',
                type='Video',
                video_url='https://www.youtube.com/watch?v=fNk_zzaMoSs',
                content='### Product Discovery\nMenemukan solusi bernilai tinggi yang layak secara bisnis dan teknologi.',
                xp_reward=50,
                is_locked=False,
                order=1,
                careers=json.dumps(['Product & Business'])
            ),
            Materi(
                subject_id=s7.id,
                title='Agile Framework, Scrum & Product Backlog',
                description='Sprint planning, backlog grooming, user story, dan kolaborasi lintas fungsi.',
                duration='22:30',
                type='Video + Artikel',
                video_url='https://www.youtube.com/watch?v=EFg3u_E6eHU',
                content='### Agile & Scrum\nMetodologi iteratif untuk merilis fitur produk secara cepat dan adaptif.',
                xp_reward=50,
                is_locked=True,
                order=2,
                careers=json.dumps(['Product & Business'])
            ),
            Materi(
                subject_id=s7.id,
                title='Product Metrics, KPI & Data-Driven Growth',
                description='Tracking retention rate, CAC, LTV, conversion funnel, dan A/B testing produk.',
                duration='24:10',
                type='Video + Artikel',
                video_url='https://www.youtube.com/watch?v=HZGCoVF3YvM',
                content='### Product Metrics & Analytics\nMengambil keputusan pengembangan produk berdasarkan data analitik kuantitatif.',
                xp_reward=60,
                is_locked=True,
                order=3,
                careers=json.dumps(['Product & Business'])
            ),
        ]

        db.session.add_all(materi_list)
        db.session.commit()
        print("[SEED] Default subjects and modules with career tracks seeded successfully!")

with app.app_context():
    db.create_all()
    # Use IF NOT EXISTS for PostgreSQL compatibility
    for col_sql in [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS grade VARCHAR(100) DEFAULT 'SMA Kelas 10'",
        "ALTER TABLE materi ADD COLUMN IF NOT EXISTS careers TEXT DEFAULT '[\"Semua Karir\"]'"
    ]:
        try:
            with db.engine.connect() as conn:
                conn.execute(db.text(col_sql))
                conn.commit()
        except Exception as e:
            print(f"[WARN] Column migration skipped: {e}")
    seed_default_data()

# ─── Load ML Model ────────────────────────────────────────────────────────────
MODEL_PATH    = os.path.join(BASE_DIR, 'model_rekomendasi_karir.pkl')
FEATURES_PATH = os.path.join(BASE_DIR, 'kolom_fitur.pkl')

try:
    model = joblib.load(MODEL_PATH)
    with open(FEATURES_PATH, 'rb') as f:
        feature_columns = pickle.load(f)

    skills_clean    = []
    interests_clean = []
    for col in feature_columns:
        if col.startswith('Skills_'):
            skills_clean.append(col.replace('Skills_', ''))
        elif col.startswith('Interests_'):
            interests_clean.append(col.replace('Interests_', ''))

    print(f"[OK] Model loaded - {len(skills_clean)} skills, {len(interests_clean)} interests")

except Exception as e:
    print(f"[ERROR] Error loading model: {e}")
    model          = None
    feature_columns = []
    skills_clean    = []
    interests_clean = []


# ═══════════════════════════════════════════════════════════════════════════════
#  AUTH ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    data       = request.get_json()
    credential = data.get('credential') if data else None

    if not credential:
        return jsonify({"error": "No credential provided"}), 400

    try:
        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except ValueError as e:
        return jsonify({"error": f"Invalid token: {str(e)}"}), 401

    google_id = idinfo.get('sub')
    email     = idinfo.get('email')
    name      = idinfo.get('name', 'User')
    avatar    = idinfo.get('picture', '')

    if not email:
        return jsonify({"error": "Email not provided by Google"}), 400

    user = User.query.filter_by(google_id=google_id).first()
    is_new_user = False

    if not user:
        user = User.query.filter_by(email=email).first()
        if user:
            user.google_id = google_id
            user.avatar    = avatar or user.avatar
        else:
            user = User(
                google_id=google_id,
                name=name,
                email=email,
                avatar=avatar,
                is_new=True
            )
            db.session.add(user)
            is_new_user = True

    db.session.commit()

    has_recommendation = CareerRecommendation.query.filter_by(user_id=user.id).first() is not None
    
    # Get user progress
    progress = UserProgress.query.filter_by(user_id=user.id).first()
    progress_data = progress.to_dict() if progress else None

    return jsonify({
        "message":            "Login successful",
        "user":               user.to_dict(),
        "is_new_user":        is_new_user,
        "has_recommendation": has_recommendation,
        "progress":           progress_data
    }), 200


@app.route('/api/auth/google-token', methods=['POST'])
def google_token_auth():
    data        = request.get_json()
    user_info   = data.get('user_info', {}) if data else {}

    google_id   = user_info.get('sub')
    email       = user_info.get('email')
    name        = user_info.get('name', 'User')
    avatar      = user_info.get('picture', '')

    if not email or not google_id:
        return jsonify({"error": "Invalid user info from Google"}), 400

    user = User.query.filter_by(google_id=google_id).first()
    is_new_user = False

    if not user:
        user = User.query.filter_by(email=email).first()
        if user:
            user.google_id = google_id
            user.avatar    = avatar or user.avatar
            if name and name != 'User':
                user.name = name
        else:
            user = User(google_id=google_id, name=name, email=email, avatar=avatar, is_new=True)
            db.session.add(user)
            is_new_user = True
    else:
        if avatar and not user.avatar:
            user.avatar = avatar
        if name and name != 'User' and user.name == 'User':
            user.name = name

    db.session.commit()

    has_recommendation = CareerRecommendation.query.filter_by(user_id=user.id).first() is not None
    
    # Get user progress
    progress = UserProgress.query.filter_by(user_id=user.id).first()
    progress_data = progress.to_dict() if progress else None

    return jsonify({
        "message":            "Login successful",
        "user":               user.to_dict(),
        "is_new_user":        is_new_user,
        "has_recommendation": has_recommendation,
        "progress":           progress_data
    }), 200


@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user with name, email, and password."""
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password or not name:
        return jsonify({"error": "Nama lengkap, email, dan kata sandi wajib diisi."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email sudah terdaftar. Silakan login."}), 400

    password_hash = generate_password_hash(password)
    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        role='user',
        is_new=True,
        grade='SMA Kelas 10'
    )
    db.session.add(user)
    db.session.commit()

    total_materi = Materi.query.count()
    initial_stats = [
        {"id": 1, "icon": "Book", "value": str(total_materi), "label": "Materi Tersedia", "iconColorClass": "text-blue-500", "iconBgClass": "bg-blue-50"},
        {"id": 2, "icon": "GraduationCap", "value": "0", "label": "Modul Selesai", "iconColorClass": "text-emerald-500", "iconBgClass": "bg-emerald-50"},
        {"id": 3, "icon": "Flame", "value": "1", "label": "Hari Beruntun", "iconColorClass": "text-orange-500", "iconBgClass": "bg-orange-50"},
        {"id": 4, "icon": "Trophy", "value": "0", "label": "Total XP", "iconColorClass": "text-primary-dark", "iconBgClass": "bg-primary-light/20"}
    ]
    initial_notifications = [{
        "id": int(datetime.utcnow().timestamp() * 1000),
        "type": "system",
        "unread": True,
        "title": "Selamat Datang! 🎉",
        "time": "Baru saja",
        "description": f"Halo {name}, selamat bergabung di platform belajar cerdas!",
        "iconName": "CheckCheck",
        "iconBg": "bg-indigo-100",
        "iconColor": "text-indigo-600",
    }]

    progress = UserProgress(
        user_id=user.id,
        completed_modules="[]",
        completed_quizzes="[]",
        quiz_xp=0,
        daily_target=json.dumps({"targetMinutes": 60, "currentMinutes": 0, "message": "Ayo mulai target belajarmu hari ini!"}),
        preferences=json.dumps({"learningStyle": "visual"}),
        unlocked_badges="[]",
        last_login_date=datetime.utcnow().strftime('%Y-%m-%d'),
        stats=json.dumps(initial_stats),
        notifications=json.dumps(initial_notifications)
    )
    db.session.add(progress)
    db.session.commit()

    return jsonify({
        "message": "Registrasi berhasil",
        "user": user.to_dict(),
        "is_new_user": True,
        "has_recommendation": False,
        "progress": progress.to_dict()
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user with email and password."""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"error": "Email dan kata sandi wajib diisi."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Akun tidak ditemukan. Silakan daftar terlebih dahulu."}), 401

    if not user.password_hash or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Email atau kata sandi salah."}), 401

    has_recommendation = CareerRecommendation.query.filter_by(user_id=user.id).first() is not None
    progress = UserProgress.query.filter_by(user_id=user.id).first()
    progress_data = progress.to_dict() if progress else None

    return jsonify({
        "message": "Login berhasil",
        "user": user.to_dict(),
        "is_new_user": bool(user.is_new),
        "has_recommendation": has_recommendation,
        "progress": progress_data
    }), 200


@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    """Fetch user profile details."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User tidak ditemukan"}), 404
    return jsonify({"user": user.to_dict()}), 200


@app.route('/api/user/<int:user_id>', methods=['PUT'])
def update_user_profile(user_id):
    """Update user profile (name, avatar, grade)."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User tidak ditemukan"}), 404

    data = request.get_json() or {}
    if 'name' in data and data['name']:
        user.name = data['name'].strip()
    if 'avatar' in data:
        user.avatar = data['avatar']
    if 'grade' in data and data['grade']:
        user.grade = data['grade'].strip()

    db.session.commit()
    return jsonify({"message": "Profil berhasil diperbarui", "user": user.to_dict()}), 200


# ═══════════════════════════════════════════════════════════════════════════════
#  USER PROGRESS ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route('/api/progress/<int:user_id>', methods=['GET'])
def get_progress(user_id):
    progress = UserProgress.query.filter_by(user_id=user_id).first()
    
    if not progress:
        return jsonify({"progress": None}), 200
    
    return jsonify({"progress": progress.to_dict()}), 200


@app.route('/api/progress/<int:user_id>', methods=['POST'])
def save_progress(user_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    progress = UserProgress.query.filter_by(user_id=user_id).first()
    
    if not progress:
        progress = UserProgress(user_id=user_id)
        db.session.add(progress)
    
    # Update fields if provided
    if 'completedModules' in data:
        progress.completed_modules = json.dumps(data['completedModules'])
    if 'completedQuizzes' in data:
        progress.completed_quizzes = json.dumps(data['completedQuizzes'])
    if 'quizXp' in data:
        progress.quiz_xp = data['quizXp']
    if 'dailyTarget' in data:
        progress.daily_target = json.dumps(data['dailyTarget'])
    if 'preferences' in data:
        progress.preferences = json.dumps(data['preferences'])
    if 'unlockedBadges' in data:
        progress.unlocked_badges = json.dumps(data['unlockedBadges'])
    if 'lastLoginDate' in data:
        progress.last_login_date = data['lastLoginDate']
    if 'stats' in data:
        progress.stats = json.dumps(data['stats'])
    if 'notifications' in data:
        progress.notifications = json.dumps(data['notifications'])
    
    progress.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({"message": "Progress saved successfully", "progress": progress.to_dict()}), 200


# ═══════════════════════════════════════════════════════════════════════════════
#  CAREER RECOMMENDATION ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route('/api/save-recommendation', methods=['POST'])
def save_recommendation():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    user_id       = data.get('user_id')
    top_career    = data.get('top_career')
    skills        = data.get('skills', [])
    interests     = data.get('interests', [])
    probabilities = data.get('probabilities', {})

    if not user_id or not top_career:
        return jsonify({"error": "user_id and top_career are required"}), 400

    existing = CareerRecommendation.query.filter_by(user_id=user_id).first()
    if existing:
        existing.top_career    = top_career
        existing.skills        = json.dumps(skills)
        existing.interests     = json.dumps(interests)
        existing.probabilities = json.dumps(probabilities)
        existing.updated_at    = datetime.utcnow()
    else:
        rec = CareerRecommendation(
            user_id       = user_id,
            top_career    = top_career,
            skills        = json.dumps(skills),
            interests     = json.dumps(interests),
            probabilities = json.dumps(probabilities)
        )
        db.session.add(rec)

    user = User.query.get(user_id)
    if user:
        user.is_new = False

    db.session.commit()

    return jsonify({"message": "Recommendation saved successfully"}), 200


@app.route('/api/recommendation/<int:user_id>', methods=['GET'])
def get_recommendation(user_id):
    rec = CareerRecommendation.query.filter_by(user_id=user_id).order_by(
        CareerRecommendation.updated_at.desc()
    ).first()

    if not rec:
        return jsonify({"recommendation": None}), 200

    return jsonify({"recommendation": rec.to_dict()}), 200


# ═══════════════════════════════════════════════════════════════════════════════
#  ADMIN & MATERI MANAGEMENT ENDPOINTS (NEW)
# ═══════════════════════════════════════════════════════════════════════════════

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Authenticate administrator."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Data login tidak diberikan"}), 400

    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        return jsonify({
            "message": "Login admin berhasil",
            "success": True,
            "admin": {
                "username": username,
                "role": "admin"
            }
        }), 200

    return jsonify({"error": "Username atau password admin salah"}), 401


@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    """Returns analytics overview for admin dashboard."""
    total_subjects = Subject.query.count()
    total_materi   = Materi.query.count()
    total_users    = User.query.count()
    total_recs     = CareerRecommendation.query.count()

    return jsonify({
        "totalSubjects": total_subjects,
        "totalMateri":   total_materi,
        "totalUsers":    total_users,
        "totalRecommendations": total_recs
    }), 200


@app.route('/api/careers', methods=['GET'])
def get_careers():
    """List all supported career recommendation tracks."""
    career_list = [
        {"id": "Data & AI", "name": "Data & AI", "icon": "🤖", "color": "text-blue-600", "bgColor": "bg-blue-50", "badgeColor": "bg-blue-100 text-blue-700", "desc": "Menganalisis data & membangun model kecerdasan buatan"},
        {"id": "Software Development", "name": "Software Development", "icon": "💻", "color": "text-violet-600", "bgColor": "bg-violet-50", "badgeColor": "bg-violet-100 text-violet-700", "desc": "Membangun & mengembangkan aplikasi perangkat lunak"},
        {"id": "Design", "name": "Design", "icon": "🎨", "color": "text-pink-600", "bgColor": "bg-pink-50", "badgeColor": "bg-pink-100 text-pink-700", "desc": "Merancang antarmuka & pengalaman pengguna yang menarik"},
        {"id": "Infrastructure & Security", "name": "Infrastructure & Security", "icon": "🔒", "color": "text-orange-600", "bgColor": "bg-orange-50", "badgeColor": "bg-orange-100 text-orange-700", "desc": "Mengelola infrastruktur IT & keamanan sistem"},
        {"id": "Product & Business", "name": "Product & Business", "icon": "📊", "color": "text-emerald-600", "bgColor": "bg-emerald-50", "badgeColor": "bg-emerald-100 text-emerald-700", "desc": "Mengelola produk digital & strategi bisnis"}
    ]
    return jsonify({"careers": career_list}), 200


@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    """List all subjects with their modules/materi ordered, optional career filtering."""
    career_filter = request.args.get('career')
    subjects = Subject.query.order_by(Subject.order.asc(), Subject.id.asc()).all()
    
    result = []
    for s in subjects:
        sub_dict = s.to_dict(include_modules=False)
        modules = []
        for m in s.modules:
            m_dict = m.to_dict()
            if not career_filter or career_filter == 'all':
                modules.append(m_dict)
            else:
                m_careers = m_dict.get('careers', [])
                if 'Semua Karir' in m_careers or career_filter in m_careers:
                    modules.append(m_dict)
        sub_dict['modules'] = modules
        result.append(sub_dict)
        
    return jsonify({"subjects": result}), 200


@app.route('/api/subjects', methods=['POST'])
def create_subject():
    """Create a new subject / category."""
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({"error": "Judul kategori wajib diisi"}), 400

    subject = Subject(
        title    = data.get('title').strip(),
        icon     = data.get('icon', 'BookOpen'),
        color    = data.get('color', 'text-blue-600'),
        bg_color = data.get('bgColor', 'bg-blue-50'),
        order    = int(data.get('order', 0))
    )
    db.session.add(subject)
    db.session.commit()

    return jsonify({"message": "Kategori berhasil dibuat", "subject": subject.to_dict()}), 201


@app.route('/api/subjects/<int:subject_id>', methods=['PUT'])
def update_subject(subject_id):
    """Update an existing subject."""
    subject = Subject.query.get(subject_id)
    if not subject:
        return jsonify({"error": "Kategori tidak ditemukan"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if 'title' in data and data['title']:
        subject.title = data['title'].strip()
    if 'icon' in data:
        subject.icon = data['icon']
    if 'color' in data:
        subject.color = data['color']
    if 'bgColor' in data:
        subject.bg_color = data['bgColor']
    if 'order' in data:
        subject.order = int(data['order'])

    db.session.commit()
    return jsonify({"message": "Kategori berhasil diperbarui", "subject": subject.to_dict()}), 200


@app.route('/api/subjects/<int:subject_id>', methods=['DELETE'])
def delete_subject(subject_id):
    """Delete a subject and all associated modules."""
    subject = Subject.query.get(subject_id)
    if not subject:
        return jsonify({"error": "Kategori tidak ditemukan"}), 404

    db.session.delete(subject)
    db.session.commit()
    return jsonify({"message": "Kategori dan seluruh materi di dalamnya berhasil dihapus"}), 200


@app.route('/api/materi', methods=['GET'])
def get_all_materi():
    """List all materi with optional filtering by subject_id and career."""
    subject_id = request.args.get('subject_id')
    career = request.args.get('career')
    query = Materi.query

    if subject_id and subject_id != 'all':
        query = query.filter_by(subject_id=subject_id)

    materi_list = query.order_by(Materi.subject_id.asc(), Materi.order.asc(), Materi.id.asc()).all()
    
    result = []
    for m in materi_list:
        m_dict = m.to_dict()
        if not career or career == 'all':
            result.append(m_dict)
        else:
            m_careers = m_dict.get('careers', [])
            if 'Semua Karir' in m_careers or career in m_careers:
                result.append(m_dict)

    return jsonify({"materi": result}), 200


@app.route('/api/materi/<int:materi_id>', methods=['GET'])
def get_materi_detail(materi_id):
    """Get single materi details."""
    materi = Materi.query.get(materi_id)
    if not materi:
        return jsonify({"error": "Materi tidak ditemukan"}), 404

    return jsonify({"materi": materi.to_dict()}), 200


@app.route('/api/materi', methods=['POST'])
def create_materi():
    """Create a new materi/modul with career assignment."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    title = data.get('title')
    subject_id = data.get('subjectId')

    if not title or not subject_id:
        return jsonify({"error": "Judul materi dan Kategori wajib diisi"}), 400

    subject = Subject.query.get(subject_id)
    if not subject:
        return jsonify({"error": "Kategori tidak ditemukan"}), 404

    # Parse careers
    careers_input = data.get('careers', ['Semua Karir'])
    if isinstance(careers_input, list):
        careers_json = json.dumps(careers_input if len(careers_input) > 0 else ['Semua Karir'])
    elif isinstance(careers_input, str):
        try:
            parsed = json.loads(careers_input)
            careers_json = json.dumps(parsed if len(parsed) > 0 else ['Semua Karir'])
        except Exception:
            careers_json = json.dumps([careers_input] if careers_input else ['Semua Karir'])
    else:
        careers_json = json.dumps(['Semua Karir'])

    materi = Materi(
        subject_id  = subject_id,
        title       = title.strip(),
        description = data.get('description', ''),
        duration    = data.get('duration', '15:00'),
        type        = data.get('type', 'Video'),
        video_url   = data.get('videoUrl', ''),
        content     = data.get('content', ''),
        xp_reward   = int(data.get('xpReward', 50)),
        is_locked   = bool(data.get('isLocked', False)),
        order       = int(data.get('order', 0)),
        careers     = careers_json
    )
    db.session.add(materi)
    db.session.commit()

    return jsonify({"message": "Materi berhasil ditambahkan", "materi": materi.to_dict()}), 201


@app.route('/api/materi/<int:materi_id>', methods=['PUT'])
def update_materi(materi_id):
    """Update an existing materi with career assignment."""
    materi = Materi.query.get(materi_id)
    if not materi:
        return jsonify({"error": "Materi tidak ditemukan"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if 'subjectId' in data and data['subjectId']:
        subject = Subject.query.get(data['subjectId'])
        if not subject:
            return jsonify({"error": "Kategori baru tidak ditemukan"}), 404
        materi.subject_id = data['subjectId']

    if 'title' in data and data['title']:
        materi.title = data['title'].strip()
    if 'description' in data:
        materi.description = data['description']
    if 'duration' in data:
        materi.duration = data['duration']
    if 'type' in data:
        materi.type = data['type']
    if 'videoUrl' in data:
        materi.video_url = data['videoUrl']
    if 'content' in data:
        materi.content = data['content']
    if 'xpReward' in data:
        materi.xp_reward = int(data['xpReward'])
    if 'isLocked' in data:
        materi.is_locked = bool(data['isLocked'])
    if 'order' in data:
        materi.order = int(data['order'])
    if 'careers' in data:
        careers_input = data.get('careers')
        if isinstance(careers_input, list):
            materi.careers = json.dumps(careers_input if len(careers_input) > 0 else ['Semua Karir'])
        elif isinstance(careers_input, str):
            try:
                parsed = json.loads(careers_input)
                materi.careers = json.dumps(parsed if len(parsed) > 0 else ['Semua Karir'])
            except Exception:
                materi.careers = json.dumps([careers_input] if careers_input else ['Semua Karir'])

    materi.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Materi berhasil diperbarui", "materi": materi.to_dict()}), 200


@app.route('/api/materi/<int:materi_id>', methods=['DELETE'])
def delete_materi(materi_id):
    """Delete a materi."""
    materi = Materi.query.get(materi_id)
    if not materi:
        return jsonify({"error": "Materi tidak ditemukan"}), 404

    db.session.delete(materi)
    db.session.commit()

    return jsonify({"message": "Materi berhasil dihapus"}), 200


# ═══════════════════════════════════════════════════════════════════════════════
#  ML ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route('/api/skills', methods=['GET'])
def get_skills():
    return jsonify({"skills": skills_clean})


@app.route('/api/interests', methods=['GET'])
def get_interests():
    return jsonify({"interests": interests_clean})


@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400

        selected_skills    = data.get('skills', [])
        selected_interests = data.get('interests', [])

        if len(selected_skills) + len(selected_interests) < 3:
            return jsonify({"error": "Please select at least 3 skills and interests combined."}), 400

        if model is None or not feature_columns:
            return jsonify({"error": "Model not loaded properly."}), 500

        input_array = np.zeros(118)

        for skill in selected_skills:
            col_name = f"Skills_{skill}"
            if col_name in feature_columns:
                idx = feature_columns.index(col_name)
                if idx < 118:
                    input_array[idx] = 1

        for interest in selected_interests:
            col_name = f"Interests_{interest}"
            if col_name in feature_columns:
                idx = feature_columns.index(col_name)
                if idx < 118:
                    input_array[idx] = 1

        prediction    = model.predict([input_array])[0]
        probabilities = model.predict_proba([input_array])[0]
        classes       = model.classes_

        prob_dict  = {classes[i]: float(probabilities[i]) for i in range(len(classes))}
        all_results = [
            {"career": classes[i], "probability": float(probabilities[i])}
            for i in range(len(classes))
        ]
        all_results.sort(key=lambda x: x["probability"], reverse=True)

        return jsonify({
            "prediction":  str(prediction),
            "probabilities": prob_dict,
            "all_results": all_results
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=PORT)
