# PostgreSQL Password Issue - Solutions

Your Flask app cannot connect to PostgreSQL because the password is incorrect.

## Quick Solution: Create a .env file

1. **Copy the `.env.example` file to `.env`:**
   ```bash
   copy .env.example .env
   ```

2. **Edit the `.env` file** and replace `YOUR_POSTGRES_PASSWORD` with your actual PostgreSQL password

3. **Run your app again:**
   ```bash
   python app.py
   ```

---

## How to Find/Reset Your PostgreSQL Password

### Option 1: Use pgAdmin 4 to Reset Password

1. **Open pgAdmin 4** from Windows Start menu
2. **Connect to PostgreSQL 18** (you'll need the pgAdmin master password you set during installation)
3. **Expand:** Servers → PostgreSQL 18 → Login/Group Roles
4. **Right-click on "postgres"** → Properties
5. **Go to "Definition" tab**
6. **Enter a new password** (e.g., `postgres123`)
7. **Click "Save"**
8. **Update your `.env` file** with this new password

### Option 2: Reset Password via Command Line

If you have access to the PostgreSQL bin directory:

1. **Find PostgreSQL installation** (usually `C:\Program Files\PostgreSQL\18\bin`)
2. **Open Command Prompt as Administrator**
3. **Navigate to the bin directory:**
   ```cmd
   cd "C:\Program Files\PostgreSQL\18\bin"
   ```
4. **Run psql:**
   ```cmd
   psql -U postgres
   ```
5. **If it connects, change the password:**
   ```sql
   ALTER USER postgres WITH PASSWORD 'your_new_password';
   ```
6. **Exit:** `\q`

### Option 3: Edit pg_hba.conf (Temporary - For Development Only)

**WARNING: This is insecure and should only be used temporarily for development!**

1. **Find `pg_hba.conf`** (usually in `C:\Program Files\PostgreSQL\18\data\`)
2. **Open as Administrator** in a text editor
3. **Find the line:**
   ```
   host    all             all             127.0.0.1/32            scram-sha-256
   ```
4. **Change to:**
   ```
   host    all             all             127.0.0.1/32            trust
   ```
5. **Restart PostgreSQL service:**
   ```powershell
   Restart-Service postgresql-x64-18
   ```
6. **Now you can connect without a password** and reset it using pgAdmin or psql
7. **IMPORTANT: Change it back to `scram-sha-256` after resetting your password!**

---

## After Setting the Correct Password

1. **Create the `.env` file** with your correct password
2. **Create the database** using pgAdmin or the `create_db.py` script
3. **Run your Flask app:**
   ```bash
   python app.py
   ```

The app will automatically:
- Connect to PostgreSQL
- Create all necessary tables
- Create a default admin user: `admin@firma.com` / `admin123`
