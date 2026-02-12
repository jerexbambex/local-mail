# Laravel SMTP Server

A lightweight, local SMTP server for testing email functionality in your applications. Capture, inspect, and debug emails with a modern web interface.

<img width="1624" height="1061" alt="Screenshot 2026-02-12 at 11 52 52 AM" src="https://github.com/user-attachments/assets/44264f0f-3b98-4e38-b089-23abd2b6b579" />
<img width="1624" height="1061" alt="Screenshot 2026-02-12 at 11 53 56 AM copy" src="https://github.com/user-attachments/assets/322247c8-6b4b-4252-af7b-75e67329b894" />


## Features

- **Local SMTP Server**: Listens on port `1025` for easy integration.
- **Modern Web Interface**: Clean, responsive UI built with React and Tailwind CSS.
- **Developer Tools**: View HTML source, raw headers, and variable inspection.
- **Auto-Configuration**: Copy-paste ready code snippets for Laravel, Node.js, Python, and more.
- **Dark Mode**: Built-in dark and light themes.

## Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd smtp-server
    ```

2.  **Install dependencies**
    ```bash
    composer install
    npm install
    ```

3.  **Configure environment**
    ```bash
    cp .env.example .env
    php artisan key:generate
    php artisan migrate
    ```

## Usage

### 1. Start the Server
Run the following command to start both the SMTP server and the web interface:

```bash
php artisan smtp:serve
```

*   **SMTP Port**: `1025`
*   **Web Interface**: [http://127.0.0.1:8000](http://127.0.0.1:8000)

### 2. Configure Your Application
Point your application's mail settings to the local server.

**Laravel (.env):**
```dotenv
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

**Nodemailer (Node.js):**
```javascript
const transport = nodemailer.createTransport({
  host: "127.0.0.1",
  port: 1025,
  secure: false
});
```

For more examples (Curl, Go, Python, PHP), visit the **Quick Start** section on the landing page.

## Tech Stack

-   **Backend**: Laravel 12, ReactPHP
-   **Frontend**: React 19, Inertia.js, Tailwind CSS v4, shadcn/ui
-   **Database**: SQLite

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
