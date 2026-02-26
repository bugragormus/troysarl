/**
 * Generates a premium HTML template for VIP newsletters.
 * Inspired by luxury automotive branding (Black, White, and Premium Accents).
 */
export function generateVipEmailHtml(subject: string, mainContent: string): string {
  // Convert newlines to BR tags if not already present, ensuring line breaks are preserved
  const formattedContent = mainContent.replace(/\n/g, "<br/>");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f4f4f4;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #000000;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      letter-spacing: 4px;
      text-transform: uppercase;
      font-weight: 900;
    }
    .header p {
      color: #888888;
      margin: 10px 0 0;
      font-size: 12px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .content {
      padding: 40px 30px;
      line-height: 1.8;
      font-size: 16px;
      color: #444444;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #eeeeee;
    }
    .footer p {
      margin: 5px 0;
      font-size: 12px;
      color: #999999;
    }
    .button-container {
      text-align: center;
      margin-top: 30px;
    }
    .button {
      background-color: #000000;
      color: #ffffff !important;
      padding: 15px 35px;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      display: inline-block;
      text-transform: uppercase;
      font-size: 14px;
      letter-spacing: 1px;
    }
    .vip-badge {
      display: inline-block;
      padding: 4px 12px;
      background: linear-gradient(45deg, #d4af37, #f1d592);
      color: #000000;
      font-size: 10px;
      font-weight: bold;
      border-radius: 4px;
      margin-bottom: 20px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TROY CARS LUX SARL</h1>
      <p>Vehicle Updates</p>
    </div>
    
    <div class="content">
      ${formattedContent}
      
      <div class="button-container">
        <a href="https://troysarl.com/cars" class="button">View Inventory</a>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Troy Cars SARL</strong></p>
      <p>Premium Vehicle Selection</p>
      <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} Troy Cars SARL. All rights reserved.</p>
      <p style="font-size: 10px; color: #cccccc; margin-top: 20px;">
        You are receiving this because you subscribed to updates from Troy Cars LUX SARL.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
