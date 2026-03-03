
#  BETA — Veri Analiz Platformu

**Beta** is a comprehensive full-stack data analysis platform designed with a robust role-based access control (RBAC) system. It streamlines project reporting, personnel analysis, and administrative oversight.

---

## 🛠 Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React + Vite, Recharts, AG Grid, React Router |
| **Backend** | Flask (Python), Flask-JWT-Extended |
| **Database** | PostgreSQL |

---

##  Quick Start Guide

### 1. Database Configuration

Ensure PostgreSQL is running on your local machine, then create the database:

```bash
createdb antikarma_db

```

### 2. Backend Setup

Navigate to the backend directory, install dependencies, and launch the server:

```bash
cd backend
pip install -r requirements.txt
python app.py

```


> **Backend URL:** `http://localhost:5174`
> **Default Admin Credentials:** > - **Email:** `admin@firma.com`
> * **Password:** `admin123`
> 
> 

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and start the development server:

```bash
cd frontend
npm install
npm run dev

```

**Frontend URL:** `http://localhost:5173`

---

## 🔐 Access Control & Roles

The platform uses a tiered authorization system to ensure data security and relevance.

| Role | Turkish Label | Permissions Level |
| --- | --- | --- |
| `admin` | Admin | Full System Access |
| `project_manager` | Proje Yöneticisi | Project & Team Oversight |
| `team_leader` | Takım Lideri | Team Management |
| `hr` | İnsan Kaynakları | Personnel & Leave Management |
| `personal` | Personel | Individual Reporting |

---

## 📂 Platform Map (13 Pages)

The application is divided into three functional modules:

### 📈 Reporting & Analytics

* **Proje Raporlama:** Central project dashboard.
* **Proje Rapor Dağılımı:** Visual report distribution.
* **Proje Öngörü Raporu:** Data-driven forecasting.
* **Personel Analiz Raporları:** Individual performance metrics.
* * **Progress Payment Report:** Monthly progress payment section.
* * **Advanced Analysis:** Configurable analysis section.

### 📝 Operations & Logs

* **Kullanıcı Rapor Girişi:** Daily report entry portal.
* **Canlı Sistem Kayıtları:** Real-time system logs.
* **İzin Talep Yönetimi:** Submit/approve leave requests.
* **Kullanıcı İzin Detayları:** Historical leave data.
* **Proje Detay Sayfası:** Deep dive into specific project data.

### ⚙️ Administration & Profile

* **Kullanıcı Yönetimi:** (Admin Only) Create/Edit/Deactivate users.
* **Yetkilendirme Matrix:** Permission mapping.
* **Sistem Ayarları:** Global platform configuration.
* **Kullanıcı Profili:** Personal account settings.

---

## 🔌 API Documentation

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | No | Authenticate user & receive JWT |
| `GET` | `/api/auth/me` | JWT | Retrieve current user profile |

### User Management (Admin Restricted)

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/users` | List all registered users |
| `POST` | `/api/users` | Create a new user account |
| `PUT` | `/api/users/:id` | Update existing user details |
| `DELETE` | `/api/users/:id` | Soft-delete/Deactivate user |

---


