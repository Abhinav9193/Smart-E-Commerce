# Deployment Guide: Smart E-Commerce Platform

This guide provides step-by-step instructions to deploy your full-stack application using **Neon (Database)**, **Render (Backend)**, and **Vercel (Frontend)**.

---

## 1. Database Setup (Neon)

1.  Log in to [Neon.tech](https://neon.tech/).
2.  Your **PostgreSQL Version**: 15 (or latest).
3.  Your **Database Connectivity** (Based on your credentials):
    *   **User**: `neondb_owner`
    *   **Password**: `npg_qQU5RrMCTlf2`
    *   **Host**: `ep-round-cloud-amdw8j3a-pooler.c-5.us-east-1.aws.neon.tech`
    *   **Database**: `neondb`
    *   **JDBC Connection String** (format needed for backend):
        `jdbc:postgresql://ep-round-cloud-amdw8j3a-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require`

---

## 2. Backend Deployment (Render)

Render is excellent for hosting Dockerized Spring Boot applications.

1.  Log in to [Render.com](https://render.com/).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository: `https://github.com/Abhinav9193/Smart-E-Commerce.git`.
4.  Under **Advanced**, click **Add Environment Variable**:
    | Variable Name | Value |
    | :--- | :--- |
    | `DB_URL` | `jdbc:postgresql://ep-round-cloud-amdw8j3a-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require` |
    | `DB_USER` | `neondb_owner` |
    | `DB_PASS` | `npg_qQU5RrMCTlf2` |
    | `JWT_SECRET` | `SmartCartSecretKeyGeneration2024_AbhinavSecureKey` |
    | `CORS_ORIGIN` | `*` (Update this to your actual Vercel URL once Step 3 is done) |
5.  Select **Runtime: Docker** (Render will use our `backend/Dockerfile` automatically).
6.  Set the **Root Directory** to `backend`.
7.  Deploy! Once live, copy your backend URL (e.g., `https://smart-backend.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

1.  Log in to [Vercel.com](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Select your repository.
4.  In the configuration:
    *   **Root Directory**: Set to `frontend`.
    *   **Framework Preset**: Next.js.
5.  Add **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: `https://[YOUR_RENDER_BACKEND_URL]/api` (e.g., `https://smart-backend.onrender.com/api`).
6.  Click **Deploy**.
7.  Once deployed, copy your production Vercel URL (e.g., `https://smart-next.vercel.app`).

---

## 4. Final Connection (Crucial!)

1.  Go back to your **Render Backend** settings.
2.  Update the `CORS_ORIGIN` environment variable with your **actual Vercel URL** (from Step 3.7).
    *   Example: `https://smart-next.vercel.app`
3.  Redeploy the backend to apply the CORS change.

---

## ✅ Deployment Summary Checklist

- [✓] **Neon**: Credentials retrieved and formatted for JDBC.
- [✓] **GitHub**: Code pushed to `https://github.com/Abhinav9193/Smart-E-Commerce.git`.
- [ ] **Render**: Environment variables configured and service started.
- [ ] **Vercel**: Frontend URL live and connected to the Render backend.
