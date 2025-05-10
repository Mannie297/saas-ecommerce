# African Market E-commerce Website

A full-stack e-commerce website for African groceries built with React, TypeScript, Tailwind CSS, and FastAPI.

## Features

- Modern, responsive UI with Tailwind CSS
- Product catalog with categories
- Shopping cart functionality
- User authentication
- Search functionality
- Admin dashboard for product management

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- PostgreSQL

## Setup

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a .env file with your database configuration:
   ```
   DATABASE_URL=postgresql://user:password@localhost/dbname
   SECRET_KEY=your-secret-key
   ```

4. Run database migrations:
   ```bash
   alembic upgrade head
   ```

5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Project Structure

```
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   └── ...
│   └── ...
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── models/       # Database models
│   │   └── schemas/      # Pydantic schemas
│   └── ...
├── venv/                 # Python virtual environment
├── requirements.txt      # Python dependencies
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 