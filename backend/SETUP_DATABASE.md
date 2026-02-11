# PostgreSQL Database Setup Guide

## Issue: Password Authentication Failed

You're getting this error because the PostgreSQL password you entered is incorrect.

## Solutions (Choose One)

### Option 1: Find Your PostgreSQL Password

Your PostgreSQL password was set during installation. Common defaults:
- **Password you set during installation** (most likely)
- `postgres` (sometimes used as default)
- `admin`
- Check your password manager or installation notes

### Option 2: Reset PostgreSQL Password (Recommended if you forgot)

1. **Open pgAdmin 4** (installed with PostgreSQL)
   - Search for "pgAdmin" in Windows Start menu

2. **Connect to your server**
   - If it asks for a password, this is the **master password for pgAdmin**, not PostgreSQL
   - Expand "Servers" → "PostgreSQL 18"

3. **Right-click on "Login/Group Roles" → "postgres"**
   - Select "Properties"
   - Go to "Definition" tab
   - Enter a new password (e.g., `postgres123`)
   - Click "Save"

### Option 3: Use SQL Shell (psql)

1. **Open "SQL Shell (psql)"** from Windows Start menu
2. Press Enter for all prompts (Server, Database, Port, Username)
3. Enter your PostgreSQL password when prompted
4. Run this command to create the database:
   ```sql
   CREATE DATABASE antikarma_db;
   ```
5. Type `\q` to exit

### Option 4: Use pgAdmin GUI (Easiest)

1. **Open pgAdmin 4**
2. **Connect to PostgreSQL 18 server**
3. **Right-click on "Databases"** → **"Create" → "Database..."**
4. **Name:** `antikarma_db`
5. **Owner:** `postgres`
6. Click **"Save"**

## After Creating the Database

Once the database is created, you can run your Flask app:

```bash
cd c:\Users\teknik.ofis\Desktop\ANTI-KARMA\backend
python app.py
```

The Flask app will automatically:
- Create all necessary tables
- Create a default admin user: `admin@firma.com` / `admin123`

## Update .env File (Optional but Recommended)

Create a `.env` file in the backend directory with your PostgreSQL password:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/antikarma_db
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password.
