# User Management Feature

## Overview

The IM Hub now includes a user management system that allows administrators to create and manage user accounts. This replaces the single environment variable-based authentication with a proper database-backed user system.

## Features

- **Create new users** with username, password, full name, and email
- **Admin privileges** - designate users as administrators
- **User activation/deactivation** - disable user accounts without deleting them
- **Delete users** - permanently remove user accounts
- **Password hashing** - secure bcrypt-based password storage
- **Last login tracking** - see when users last accessed the system

## Accessing User Management

1. Log in to the IM Hub as an administrator
2. Navigate to the **Admin Panel** from the navigation menu
3. Click on the **Users** tab

## Creating a New User

1. In the Users tab, click the **"+ Create New User"** button
2. Fill in the user details:
   - **Username** (required): Unique username for login
   - **Password** (required): Initial password for the user
   - **Full Name** (optional): User's full name
   - **Email** (optional): User's email address
   - **Admin privileges**: Check this box to give the user admin access
3. Click **"Create User"**

## Managing Users

### Deactivate/Activate a User
- Click the **"🔒 Deactivate"** button to disable a user account (they won't be able to log in)
- Click the **"✓ Activate"** button to re-enable a deactivated account

### Delete a User
- Click the **"✗ Delete"** button to permanently remove a user
- Note: You cannot delete your own account while logged in

## Default Admin Account

On first startup, a default admin account is created using the environment variables:
- Username: Value from `ADMIN_USERNAME` (default: "admin")
- Password: Value from `ADMIN_PASSWORD` (default: "password")

**Important**: Change the default password immediately after first login!

## Technical Details

### Database Schema

The User table includes:
- `id` - Unique identifier
- `username` - Unique username
- `password_hash` - Bcrypt-hashed password
- `full_name` - User's full name
- `email` - User's email
- `is_admin` - Admin privileges flag
- `is_active` - Account status
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp
- `last_login` - Last successful login timestamp

### API Endpoints

- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create a new user (admin only)
- `PUT /api/users/{user_id}` - Update user details (admin only)
- `DELETE /api/users/{user_id}` - Delete a user (admin only)

### Authentication Flow

1. User submits credentials via login form
2. System checks database for matching username
3. Password is verified using bcrypt
4. If valid, a JWT token is issued
5. Token includes username and admin status
6. Last login timestamp is updated

## Security Considerations

- Passwords are hashed using bcrypt (never stored in plaintext)
- JWT tokens expire after 24 hours
- Admin-only endpoints verify token authentication
- Users cannot delete their own accounts
- Deactivated accounts cannot log in

## Migration Notes

The system maintains backward compatibility with environment variable authentication. If database authentication fails, it will fall back to checking `ADMIN_USERNAME` and `ADMIN_PASSWORD` from environment variables.

## Dependencies

Added to `requirements.txt`:
- `bcrypt>=4.0.0` - For secure password hashing
