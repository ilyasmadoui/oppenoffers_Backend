const generateResetPasswordEmail = (newPassword) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .password-box {
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            font-size: 13px;
            color: #777;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset</h2>
          <p>Your password has been reset. Here is your new password:</p>
  
          <div class="password-box">
            ${newPassword}
          </div>
  
          <p><strong>Please change this password after logging in for security reasons.</strong></p>
  
          <div class="footer">
            <p>If you did not request this password reset, please contact support immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  module.exports = generateResetPasswordEmail;