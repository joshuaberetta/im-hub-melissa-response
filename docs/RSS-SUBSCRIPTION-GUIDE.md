# RSS Feed Subscription Guide

The IM Hub provides an RSS feed for announcements that allows you to receive automatic updates when new announcements are published.

## RSS Feed URL

**Feed URL:** `https://your-domain.com/feeds/announcements.xml`  
*Development:* `http://localhost:8000/feeds/announcements.xml`

## How to Subscribe to the RSS Feed

### Option 1: Using an RSS Reader

RSS readers are applications that aggregate and display content from multiple RSS feeds in one place.

#### Popular RSS Readers:

**Web-based:**
- [Feedly](https://feedly.com) - Popular, free with premium options
- [Inoreader](https://www.inoreader.com) - Powerful features, free tier available
- [The Old Reader](https://theoldreader.com) - Simple, Google Reader-like interface
- [NewsBlur](https://newsblur.com) - Open source, social features

**Desktop/Mobile:**
- [NetNewsWire](https://netnewswire.com) - Free, Mac/iOS
- [Reeder](https://reederapp.com) - Mac/iOS, paid
- [FeedReader](https://jangernert.github.io/FeedReader/) - Linux, free
- [Outlook](https://www.microsoft.com/outlook) - Built-in RSS support

#### Steps to Subscribe:

1. Open your RSS reader
2. Look for "Add Feed", "Subscribe", or "+" button
3. Paste the RSS feed URL: `https://your-domain.com/feeds/announcements.xml`
4. Click "Subscribe" or "Add"
5. You'll now receive updates automatically when new announcements are posted

### Option 2: Email Notifications from RSS

If you prefer email notifications instead of using an RSS reader, you can use services that convert RSS feeds to email:

#### Recommended Services:

**1. Blogtrottr (Free)**
- Website: https://blogtrottr.com
- Steps:
  1. Enter the RSS feed URL
  2. Enter your email address
  3. Choose update frequency (real-time, daily digest, etc.)
  4. Click "Feed Me"
  5. Confirm your subscription via email

**2. RSS.app (Free tier available)**
- Website: https://rss.app
- Features: Email, Slack, Discord, and webhook notifications
- Steps:
  1. Sign up for free account
  2. Add the RSS feed URL
  3. Choose "Email Notification"
  4. Configure notification settings
  5. Save and activate

**3. IFTTT (If This Then That)**
- Website: https://ifttt.com
- Create an automation:
  1. Sign up for IFTTT account
  2. Create new Applet
  3. Choose "RSS Feed" as trigger
  4. Enter feed URL: `https://your-domain.com/feeds/announcements.xml`
  5. Choose "Email" or "Gmail" as action
  6. Configure email template
  7. Activate the applet

**4. Zapier (Free tier available)**
- Website: https://zapier.com
- Steps:
  1. Create a new Zap
  2. Trigger: "RSS by Zapier" → "New Item in Feed"
  3. Enter RSS feed URL
  4. Action: "Email by Zapier" → "Send Outbound Email"
  5. Configure email template
  6. Test and activate

**5. Kill the Newsletter**
- Website: https://kill-the-newsletter.com
- Converts RSS to email (unique approach)
- Free and simple

### Option 3: Browser Extension

Some browsers support RSS directly or via extensions:

**Firefox:**
- Built-in RSS support in address bar
- Extensions: "Feedbro", "RSS Preview"

**Chrome/Edge:**
- Extension: "RSS Feed Reader", "Feedbro"

**Safari:**
- Extension: "RSS Button for Safari"

## What's in the Feed?

The announcements RSS feed includes:

- **Title** with priority indicator (🔴 High, 🟠 Medium, 🔵 Normal, ⚪ Low)
- **Full announcement content** in HTML format
- **Publication date**
- **Author name**
- **Tags/Categories** for filtering
- **Up to 20 most recent announcements**

## Feed Features

✅ **No authentication required** - Public feed accessible to all subscribers  
✅ **Automatic updates** - New announcements appear immediately  
✅ **Priority indicators** - Visual cues for urgent announcements  
✅ **Full content** - Complete announcement text (no need to visit website)  
✅ **Rich formatting** - HTML content with proper styling  
✅ **Categorized** - Tags help filter announcements by topic  

## Troubleshooting

**Feed not updating?**
- Check if the RSS feed URL is correct
- Some RSS readers cache content - try refreshing manually
- Verify your RSS reader/service is active

**Not receiving emails?**
- Check spam/junk folder
- Verify email notification service is active
- Confirm subscription via confirmation email

**Feed shows old content?**
- RSS readers may cache feeds - force refresh
- Clear RSS reader cache if available
- Wait a few minutes and check again

## For Administrators

To add new announcements that will appear in the RSS feed:

1. Create a new markdown file in `backend/announcements/`
2. Use format: `YYYY-MM-DD-description.md`
3. Include proper frontmatter (title, date, priority, author, tags)
4. The announcement will automatically appear in the RSS feed
5. Subscribers will be notified based on their RSS reader settings

## Support

For issues with the RSS feed or subscription questions, contact the IM Team.

---

*Last updated: November 17, 2025*
