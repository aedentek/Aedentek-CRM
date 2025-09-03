# Gandhii Bai CRM - Professionally Organized

This is a comprehensive Customer Relationship Management (CRM) system for Gandhii Bai, featuring patient attendance, medical records, and management modules - now organized into a clean, maintainable monorepo structure.

## 🎯 Features
- **Patient Attendance** tracking with daily and monthly stats
- **Medical Records** management and patient profiles
- **Staff Management** with advance tracking
- **Doctor Portal** with salary management
- **Inventory System** for medicines and supplies
- **Responsive UI** with modern design
- **Export Functions** - attendance to Excel and data export
- **Full CRUD Operations** for all modules
- **Quick Actions** - mark Present/Late/Absent efficiently

## 🏗️ Architecture

**Monorepo Structure:**
- `frontend/` - React + TypeScript application  
- `backend/` - Node.js + Express API server
- `shared/` - Common database resources and migrations

## 🛠️ Tech Stack
- **Frontend**: React + TypeScript, Vite, shadcn/ui, Radix UI, Tailwind CSS, lucide-react
- **Backend**: Node.js, Express.js, MySQL, Multer (file uploads)
- **DevOps**: GitHub Actions, Vercel deployment

## 🚀 Getting Started

1. **Install all dependencies:**
   ```bash
   npm run setup
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001`

## 📁 Project Structure
```
organized-project/
├── frontend/src/components/patients/PatientAttendance.tsx  # Main attendance page
├── backend/server/                                         # Backend API and database logic
├── shared/sql/                                            # Database schemas
└── Documentation files                                     # Migration guides & structure docs
```

## 📚 Documentation
- [Migration Guide](MIGRATION_GUIDE.md) - How the project was reorganized
- [Structure Comparison](STRUCTURE_COMPARISON.md) - Before/after analysis  
- [Cleanup Summary](CLEANUP_SUMMARY.md) - Complete reorganization details

---
*✨ Project successfully reorganized and cleaned - September 3, 2025*
*For more details, see the code and comments in each file.*
