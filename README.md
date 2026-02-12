# SMTP Server

Local SMTP server for email testing. Capture and inspect emails with a beautiful web interface.

![Laravel](https://img.shields.io/badge/Laravel-12-red) ![React](https://img.shields.io/badge/React-19-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan)

## Features

- 📧 Local SMTP server (port 1025)
- 🌐 Web interface for viewing emails
- 🔍 Search emails
- 📎 Download attachments
- 🗑️ Delete emails
- 📱 Responsive design

## Quick Start

```bash
# Install dependencies
composer install
npm install

# Setup
cp .env.example .env
php artisan key:generate
php artisan migrate

# Start SMTP server
php artisan smtp:serve

# Start web interface (separate terminal)
npm run dev
```

Visit **http://smtp.test**

## Configuration

Point your app to the SMTP server:

```
Host: 127.0.0.1
Port: 1025
Encryption: None
Authentication: None
```

### Laravel Example

```env
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_ENCRYPTION=null
```

### Test Email

```bash
php test-email.php
```

## API Endpoints

```
GET    /api/emails              # List emails
GET    /api/emails/{id}         # View email
DELETE /api/emails/{id}         # Delete email
DELETE /api/emails              # Delete all
GET    /api/emails/{id}/source  # Raw source
```

## Tech Stack

- **Backend:** Laravel 12, ReactPHP, SQLite
- **Frontend:** React 19, Inertia.js, shadcn/ui, Tailwind CSS

## Development

```bash
# Run tests
php artisan test

# Format code
vendor/bin/pint

# Build for production
npm run build
```

## Security Warning

⚠️ **Development only!** Do not use in production or expose to public networks.

## License

MIT
