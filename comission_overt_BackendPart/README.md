✨ Features
✅ JWT Authentication (Login, Register, Refresh Token)
✅ User Management (CRUD Operations)
✅ Stored Procedures for all database queries
✅ Middleware for authentication & validation
✅ Environment Variables for secure configuration

🛠 Tech Stack
Runtime: Node.js

Framework: Express.js

Database: Microsoft SQL Server (MSSQL)

Authentication: JWT (JSON Web Tokens)

Security: CORS, dotenv

Dev Tools: Nodemon (Auto-reload)

⚙ Setup & Installation
```bash
git clone https://github.com/MalekMerad/comission_overt_BackendPart.git
cd backend
```
2. Install Dependencies
```bash
npm install
```
3. Set Up Environment Variables (Highly important for dataBase connection)

[YouTube Tutorial](https://www.youtube.com/watch?v=YuhKhkQqtP8)

DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_SERVER=your_server_name
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret_key
PORT=5000

5. Run the Server
```bash
nodemon server.js
