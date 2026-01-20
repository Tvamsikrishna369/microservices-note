<!-- 🧩 Microservices Learning Project (NestJS)

This project is a learning-first microservices setup built using NestJS, without Docker and without a database initially.

The goal is to understand core microservice fundamentals clearly, before introducing tools and complexity.

🎯 Learning Goals

This project is intentionally minimal to teach:

What a real microservice actually is

How multiple backend services run independently

How an API Gateway communicates with services

Why validation, authentication, JWT, and DBs are required

Difference between in-memory data vs persistent storage

How frontend clients talk to microservices

Why configuration management (env files) matters

🏗️ Architecture Overview
Client (Postman / Frontend)
        |
        v
   API Gateway (3000)
        |
--------------------------------
| Auth Service (4000) | Notes Service (4001) |
--------------------------------


Each box represents:

A separate NestJS application

Running on a different port

Started/stopped independently

Communicating over HTTP

👉 This is the core definition of microservices.

📂 Project Structure
microservices-note/
├── api-gateway/
├── auth-service/
└── notes-service/


Each service has:

Its own package.json

Its own node_modules

Its own NestJS runtime

No shared memory or state

🔌 Ports Used
Service	Port
API Gateway	3000
Auth Service	4000
Notes Service	4001

Ports are configured in src/main.ts of each service.

▶️ How to Run the Project (No Docker)

Open 3 separate terminals:

API Gateway
cd api-gateway
npm run start:dev

Auth Service
cd auth-service
npm run start:dev

Notes Service
cd notes-service
npm run start:dev


👉 Each terminal = one running microservice process

❤️ Health Endpoints (Service Check)

Used to verify that services are running.

Direct service checks
GET http://localhost:3000
GET http://localhost:4000
GET http://localhost:4001


Example response:

{ "service": "auth-service", "status": "ok" }

🔀 API Gateway Proxy Routes

The client never talks directly to services.

The API Gateway forwards requests using HTTP.

Auth Service (via Gateway)
GET  /api/auth/health
POST /api/auth/register
POST /api/auth/login

Notes Service (via Gateway)
GET  /api/notes
POST /api/notes
GET  /api/notes/health

📝 Notes Service (Current State)
Create Note
POST http://localhost:3000/api/notes


Request body:

{
  "id": "1766328376792",
  "userId": "1766316318608",
  "text": "my first note"
}

Get Notes
GET http://localhost:3000/api/notes


Response:

[
  {
    "id": "1766328207732",
    "userId": "1766316318608",
    "text": "my first note"
  }
]


📌 Notes are currently stored in memory, not in a database.

🔐 Auth Service (Current State)
Endpoints
Method	Endpoint	Description
POST	/auth/register	Register user
POST	/auth/login	Login user

Accessed via gateway:

/api/auth/register
/api/auth/login

Example Register Request
{
  "email": "a@test.com",
  "password": "1234"
}

Example Responses
{ "id": "1766254040655" }

{ "accessToken": "fake-token-for-1766254040655" }


⚠️ Token is fake for now. JWT will be added later.

🧠 Important Learning: No Database Yet

Users and notes are stored like this:

private users: User[] = [];
private notes: Note[] = [];


This means:

Data survives API calls

Data is lost on service restart

Explains why:

“User already exists” happened

Restarting service clears data

👉 This clearly shows why databases are necessary.

🚨 Why Empty Request Bodies Worked

By default, NestJS does NOT validate input.

So:

Empty body → accepted

email === undefined → still stored

This is intentional at this stage to understand:

Why DTO validation is required

Why frameworks don’t “protect you magically”

⚙️ Configuration Problem Identified
❌ Problem

Hardcoded URLs everywhere:

http://localhost:3000
http://localhost:4000
http://localhost:4001


Issues:

Painful to maintain

Breaks during deployment

Requires code changes per environment

✅ Solution: Centralized Configuration
Use Environment Variables

Example .env:

API_GATEWAY_URL=http://localhost:3000
AUTH_SERVICE_URL=http://localhost:4000
NOTES_SERVICE_URL=http://localhost:4001


Benefits:

No hardcoded URLs

Easy deployment

Industry best practice

Follows 12-Factor App principles

🧱 Microservice Rules You Followed

✅ Separate services
✅ Separate ports
✅ API Gateway communication
✅ No shared memory
✅ No shared database
✅ Network-based calls (HTTP)

You are building real microservices, not a fake setup.

🛣️ Roadmap (Next Steps)

Features will be added in this exact order:

1️⃣ DTO Validation
2️⃣ bcrypt (password hashing)
3️⃣ JWT (real tokens)
4️⃣ Protect Notes APIs
5️⃣ PostgreSQL + Prisma
6️⃣ Remove in-memory storage

🧠 Final Takeaway (Very Important)

Microservices are about independent runtime units, not folders.

You already built:

Real services

Real gateway

Real communication

Everything else builds on this foundation. -->


# 🧩 Microservices Project – NestJS (Auth + Notes)

This project is a **fully working microservices-based backend system** built using **NestJS**.  
It demonstrates **real-world authentication, authorization, validation, and service-to-service communication** using an **API Gateway**.

The project was built step-by-step with a strong focus on **learning fundamentals correctly** rather than shortcut implementations.

---

## 🎯 What This Project Covers (Completed)

✅ True microservices architecture  
✅ API Gateway pattern  
✅ Authentication & Authorization  
✅ JWT Access Tokens  
✅ Refresh Token flow (with logout & revocation)  
✅ DTO-based validation  
✅ Password hashing using bcrypt  
✅ Protected APIs using Guards  
✅ Database integration  
✅ Removal of in-memory storage  

---

## 🏗️ Architecture Overview

Client (Postman / Frontend)
|
v
API Gateway (3000)
|
| Auth Service (4000) | Notes Service (4001) |
markdown
Copy code

### Key Characteristics
- Each service is a **separate NestJS application**
- Each runs on its **own port**
- Each has its **own database access**
- Services communicate **only through HTTP**
- Client communicates **only with API Gateway**

This matches **real production microservice systems**.

---

## 📂 Project Structure

microservices-note/
├── api-gateway/
├── auth-service/
└── notes-service/

yaml
Copy code

Each service contains:
- Its own `package.json`
- Its own `node_modules`
- Its own `.env`
- Its own database connection
- Independent lifecycle

---

## 🔌 Ports Used

| Service        | Port |
|---------------|------|
| API Gateway   | 3000 |
| Auth Service  | 4000 |
| Notes Service | 4001 |

Ports are configured in `src/main.ts`.

---

## ▶️ Running the Project (No Docker)

Open **three terminals**:

### API Gateway
```bash
cd api-gateway
npm run start:dev
Auth Service
bash
Copy code
cd auth-service
npm run start:dev
Notes Service
bash
Copy code
cd notes-service
npm run start:dev
Each terminal represents one running microservice.

❤️ Health Check Endpoints
h
Copy code
GET http://localhost:3000
GET http://localhost:4000
GET http://localhost:4001
Used to verify services are running correctly.

🔀 API Gateway Routes
Auth Routes
http
Copy code
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
Notes Routes (Protected)
http
Copy code
POST /api/notes
GET  /api/notes
Clients never call Auth or Notes services directly.

🔐 Authentication & Security
1️⃣ User Registration
json
Copy code
{
  "email": "user@test.com",
  "password": "123456"
}
Input validated using DTOs

Password hashed using bcrypt

User stored in database

2️⃣ Login
Response:

json
Copy code
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
Access token → short-lived

Refresh token → long-lived

3️⃣ Refresh Token Flow
http
Copy code
POST /api/auth/refresh
json
Copy code
{
  "refreshToken": "jwt-refresh-token"
}
Issues new access token

Validates refresh token against DB

Prevents reuse of revoked tokens

4️⃣ Logout (Refresh Token Revocation)
http
Copy code
POST /api/auth/logout
json
Copy code
{
  "refreshToken": "jwt-refresh-token"
}
Refresh token is revoked

Further usage returns 401 Unauthorized

🛡️ Protected Notes API
Notes APIs are protected using JWT Guards

Access token must be sent via Authorization header

http
Copy code
Authorization: Bearer <accessToken>
Unauthenticated requests are rejected.

📝 Notes Service
Create Note
json
Copy code
{
  "text": "My first secure note"
}
User ID extracted from JWT

Note linked to authenticated user

Stored in database

Get Notes
Returns only notes belonging to logged-in user

Fully authorization-safe

🧱 Validation (DTOs)
All incoming requests use DTOs

Invalid or empty bodies are rejected

Prevents accidental or malformed data

This fixed early issues like:

Empty request bodies being accepted

Undefined values being stored

🗄️ Database Usage
In-memory storage has been completely removed

Users, notes, and refresh tokens are stored in database

Data persists across service restarts

Logout & refresh logic works reliably

⚙️ Configuration
No hardcoded URLs

Environment-based configuration using .env

Separate configs per service

Ready for deployment

🧠 Key Learnings
Microservices are independent runtime systems

API Gateway simplifies client interaction

Auth is more than login → refresh & logout matter

Validation and hashing are mandatory, not optional

Databases are essential for correctness

Real bugs teach real architecture lessons

✅ Project Status
This project is complete and functional.

It demonstrates:

Real authentication system

Real microservices communication

Real production-style backend design#   m i c r o s e r v i c e s - n o t e  
 