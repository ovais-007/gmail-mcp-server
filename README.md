# Gmail MCP Server

A Model Context Protocol server for Gmail integration.

## Features

- Send emails through Gmail using App Password or OAuth2
- Professional email templates  
- Gmail inbox management (with OAuth2)
- Configuration validation

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Gmail**
   
   Copy `.env.example` to `.env` and add your Gmail credentials:
   ```
   GMAIL_USER=ovais.00700@gmail.com
   GMAIL_APP_PASSWORD=your_app_password
   ```

3. **Run the server**
   ```bash
   npm start
   ```

## Usage

Add to your MCP client configuration:
```json
{
  "mcpServers": {
    "gmail": {
      "command": "node", 
      "args": ["/path/to/gmail-mcp-server/index.js"]
    }
  }
}
```

Then use commands like:
- "Send an email to someone@example.com"
- "Send an introduction email to ovais.00700@gmail.com"  
- "Check Gmail configuration"

## Authentication

### App Password (Simple)
1. Enable 2-factor authentication in Google Account
2. Generate App Password for Mail
3. Use in .env file

### OAuth2 (Advanced) 
For reading emails, you need OAuth2 setup with Google Cloud Console.

## Author

Mohammad Ovais - ovais.00700@gmail.com
