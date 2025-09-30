const WEBMAIL_PLATFORMS = [
  { name: 'Gmail', hosts: ['mail.google.com'] },
  { name: 'Outlook', hosts: ['outlook.live.com', 'outlook.office.com', 'outlook.office365.com'] },
  { name: 'Yahoo', hosts: ['mail.yahoo.com'] },
  { name: 'iCloud', hosts: ['www.icloud.com'] },
  { name: 'ProtonMail', hosts: ['mail.proton.me', 'mail.protonmail.com'] },
];

export function isWebmailPlatform(url: string | undefined): boolean {
  if (!url) return false;
  
  try {
    const hostname = new URL(url).hostname;
    return WEBMAIL_PLATFORMS.some(platform => 
      platform.hosts.some(host => 
        hostname === host || hostname.includes(host)
      )
    );
  } catch {
    return false;
  }
}