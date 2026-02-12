# SMTP Server - Mail Inbox for Developers

A local SMTP server with web interface for email testing and debugging, built with Laravel and React. Perfect for development environments where you need to capture and inspect outgoing emails without actually sending them.

![SMTP Server](https://img.shields.io/badge/Laravel-12-red) ![React](https://img.shields.io/badge/React-19-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan)

## Features

- ✉️ **SMTP Server** - Listens on port 1025 (configurable)
- 🌐 **Web Interface** - Beautiful UI built with React and shadcn/ui
- 🔍 **Search & Filter** - Find emails by subject, sender, or content
- 📎 **Attachment Support** - View and download email attachments
- 🗑️ **Email Management** - Delete individual emails or clear all
- 📊 **Real-time Updates** - Auto-refresh every 5 seconds
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **HTML & Text Views** - Toggle between HTML and plain text
- 📄 **Raw Source View** - Inspect raw email headers and content
- 🔒 **Secure** - Sandboxed iframe for HTML email rendering

## Screenshots

### Inbox View
Clean, modern interface showing all received emails with sender, subject, and preview.

### Email Viewer
Full email display with HTML rendering, attachments, and metadata.

## Installation

### Prerequisites

- PHP 8.4+
- Composer
- Node.js & NPM
- Laravel Herd (or any PHP development environment)

### Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd smtp
```

2. **Install dependencies:**
```bash
composer install
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Run migrations:**
```bash
php artisan migrate
```

5. **Seed test data (optional):**
```bash
php artisan db:seed --class=EmailSeeder
```

## Usage

### Starting the SMTP Server

Open a terminal and run:

```bash
php artisan smtp:serve
```

**Options:**
- `--host=0.0.0.0` - Host to bind to (default: 0.0.0.0)
- `--port=1025` - Port to listen on (default: 1025)

**Example:**
```bash
php artisan smtp:serve --host=127.0.0.1 --port=2525
```

The server will start and display:
```
SMTP Server listening on 0.0.0.0:1025
```

### Starting the Web Interface

In a separate terminal, run:

```bash
npm run dev
```

Or for production:
```bash
npm run build
```

Then visit: **http://smtp.test** (or your configured Herd domain)

### Configuring Your Application

Point your application's SMTP settings to the local server:

**Configuration:**
```
Host: 127.0.0.1 (or localhost)
Port: 1025
Encryption: None
Authentication: None
```

#### Laravel Example

Update your `.env` file:

```env
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="${APP_NAME}"
```

#### PHP mail() Function

```php
ini_set('SMTP', '127.0.0.1');
ini_set('smtp_port', '1025');

mail('to@example.com', 'Test Subject', 'Test message body');
```

#### Node.js (Nodemailer)

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: '127.0.0.1',
  port: 1025,
  secure: false,
  tls: { rejectUnauthorized: false }
});

transporter.sendMail({
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  text: 'Hello World!'
});
```

#### Python (smtplib)

```python
import smtplib

server = smtplib.SMTP('127.0.0.1', 1025)
server.sendmail(
    'sender@example.com',
    ['recipient@example.com'],
    'Subject: Test\n\nHello World!'
)
server.quit()
```

### Testing Email Sending

Use the included test script:

```bash
php test-email.php
```

Or send a test email from Laravel:

```php
use Illuminate\Support\Facades\Mail;

Mail::raw('This is a test email', function ($message) {
    $message->to('test@example.com')
            ->subject('Test Email');
});
```

## API Endpoints

The application provides a REST API for programmatic access:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/emails` | List all emails (paginated, searchable) |
| GET | `/api/emails/{id}` | Get single email details |
| DELETE | `/api/emails/{id}` | Delete specific email |
| DELETE | `/api/emails` | Delete all emails |
| GET | `/api/emails/{id}/source` | View raw email source |
| GET | `/api/emails/{id}/attachments/{attachmentId}` | Download attachment |
| GET | `/api/stats` | Get email statistics |

**Example:**
```bash
# Get all emails
curl http://smtp.test/api/emails

# Search emails
curl http://smtp.test/api/emails?search=invoice

# Get email statistics
curl http://smtp.test/api/stats
```

## Architecture

### Backend

- **Framework:** Laravel 12
- **SMTP Server:** Built with `react/socket` for async handling
- **Email Parser:** Uses `zbateson/mail-mime-parser` for MIME parsing
- **Database:** SQLite with UUID primary keys
- **Storage:** Attachments stored in `storage/app/attachments`

### Frontend

- **Framework:** React 19 + Inertia.js v2
- **UI Components:** shadcn/ui with Tailwind CSS v4
- **Layout:** Responsive sidebar with email list and viewer
- **Updates:** Automatic polling every 5 seconds

### Database Schema

**emails table:**
- `id` (UUID) - Primary key
- `from` - Sender email address
- `to` (JSON) - Array of recipient addresses
- `cc` (JSON) - Carbon copy addresses
- `bcc` (JSON) - Blind carbon copy addresses
- `subject` - Email subject line
- `html_body` - HTML content
- `text_body` - Plain text content
- `raw_message` - Complete raw email
- `size` - Email size in bytes
- `attachments_count` - Number of attachments
- `read_at` - Timestamp when email was viewed
- `created_at`, `updated_at` - Timestamps

**attachments table:**
- `id` (UUID) - Primary key
- `email_id` (UUID) - Foreign key to emails
- `filename` - Original filename
- `content_type` - MIME type
- `size` - File size in bytes
- `path` - Storage path
- `created_at`, `updated_at` - Timestamps

## Features in Detail

### Email List
- View all received emails in chronological order
- Unread emails displayed in bold
- Shows sender, subject, preview, and timestamp
- Attachment indicator icon
- Click to view full email

### Email Viewer
- Toggle between HTML and plain text views
- Sandboxed iframe for secure HTML rendering
- View all email headers (From, To, CC, Date)
- Download attachments individually
- View raw email source in new tab
- Delete email with confirmation modal
- Back button on mobile devices

### Search & Filter
- Real-time search across subject, sender, and body
- Results update as you type
- Clear search to show all emails

### Email Management
- Delete individual emails
- Clear all emails at once
- Confirmation modals prevent accidental deletion
- Automatic list refresh after deletion

## Development

### Running Tests

```bash
php artisan test
```

### Code Formatting

```bash
vendor/bin/pint
```

### Building for Production

```bash
npm run build
```

## Troubleshooting

### SMTP Server Not Receiving Emails

**Check if port is in use:**
```bash
lsof -i :1025
```

**Verify SMTP configuration:**
- Ensure `MAIL_MAILER=smtp` in your app's `.env`
- Confirm `MAIL_PORT=1025`
- Check `MAIL_HOST=127.0.0.1`

**Check Laravel logs:**
```bash
tail -f storage/logs/laravel.log
```

### Frontend Not Updating

**Rebuild assets:**
```bash
npm run build
```

**Or ensure dev server is running:**
```bash
npm run dev
```

**Clear browser cache:**
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

### Attachments Not Downloading

**Check storage permissions:**
```bash
chmod -R 775 storage/app/attachments
```

**Verify storage directory exists:**
```bash
mkdir -p storage/app/attachments
```

### Images Not Loading in Emails

Images should load automatically. If not:
- Check browser console for errors
- Verify the email HTML contains valid image URLs
- External images require internet connection

## Security Notes

⚠️ **This is a development tool only!**

- **No authentication** - Anyone with access can view all emails
- **No encryption** - All traffic is unencrypted
- **Accepts all emails** - No spam filtering or validation
- **Local use only** - Do not expose to public networks
- **Development only** - Not suitable for production environments

**Never use this tool:**
- On production servers
- With real customer data
- On public networks
- For actual email delivery

## Performance Tips

- **Email retention:** Regularly clear old emails to maintain performance
- **Database size:** SQLite works well for development; consider PostgreSQL for heavy use
- **Attachment storage:** Monitor `storage/app/attachments` directory size
- **Polling interval:** Adjust refresh rate in `EmailList.tsx` if needed (default: 5s)

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and code formatting
5. Submit a pull request

## License

MIT License - feel free to use this project for any purpose.

## Credits

Built with:
- [Laravel](https://laravel.com) - PHP Framework
- [React](https://react.dev) - UI Library
- [Inertia.js](https://inertiajs.com) - Modern Monolith
- [shadcn/ui](https://ui.shadcn.com) - UI Components
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [ReactPHP](https://reactphp.org) - Async Socket Server

Inspired by [Mailpit](https://github.com/axllent/mailpit) and [MailHog](https://github.com/mailhog/MailHog).

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Happy Email Testing! 📧**
