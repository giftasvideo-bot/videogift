/* i18n.js: English / Amharic switch. Load with <script src="i18n.js"></script> in <head>.
   Language order: ?lang=am|en in the URL, then the saved choice, then the browser language. */
(function () {
  var L = 'en', q = new URLSearchParams(location.search).get('lang');
  try { L = localStorage.getItem('lang') || (/^am/i.test(navigator.language) ? 'am' : 'en'); } catch (e) {}
  if (q === 'am' || q === 'en') { L = q; try { localStorage.setItem('lang', L); } catch (e) {} }

  // English text -> Amharic. To translate a new string, add a line here.
  var AM = {
    'Loading invitation…': 'ግብዣውን በመጫን ላይ…',
    'Photo': 'ፎቶ', 'Photo slideshow': 'የፎቶ ስላይድ ትዕይንት', 'Photo gallery': 'የፎቶ ጋለሪ',
    'Previous photo': 'ቀዳሚ ፎቶ', 'Next photo': 'ቀጣይ ፎቶ',
    'Read More': 'ተጨማሪ ያንብቡ', 'Birthday': 'የልደት በዓል', 'Home': 'መነሻ',
    'Ceremony Info': 'የሥነ ሥርዓት መረጃ',
    'Please join us as we celebrate': 'የጋራ ሕይወታችንን ጅማሬ ስናከብር',
    'the beginning of our life together': 'እንዲገኙ በአክብሮት እንጋብዝዎታለን',
    'Wedding Ceremony': 'የሠርግ ሥነ ሥርዓት', 'The big day has arrived': 'ታላቁ ቀን ደርሷል', 'Countdown': 'ቀሪ ጊዜ',
    'Add to Calendar': 'ወደ ቀን መቁጠሪያ ጨምር', 'Add to calendar': 'ወደ ቀን መቁጠሪያ ጨምር',
    'Open map': 'ካርታውን ክፈት', 'Save the date': 'ቀኑን ያስታውሱ', 'Get directions': 'አቅጣጫ ያግኙ',
    'Guestbook': 'የእንግዳ መጽሐፍ', 'Send wishes': 'መልካም ምኞት ላክ',
    'Enter your name*': 'ስምዎን ያስገቡ*', 'Your name': 'ስምዎ',
    'Enter your wishes*': 'መልካም ምኞትዎን ያስገቡ*', 'Your wishes': 'መልካም ምኞትዎ',
    'Be the first to leave a wish.': 'መጀመሪያ መልካም ምኞት የሚተውት ይሁኑ።',
    'Thank you for your wishes!': 'ለመልካም ምኞትዎ እናመሰግናለን!',
    'Could not send: ': 'መላክ አልተቻለም፦ ', 'please try again': 'እባክዎ እንደገና ይሞክሩ',
    'Wedding venue': 'የሠርጉ ቦታ', 'Map of ': 'ካርታ፦ ',
    'The wedding of': 'የሠርግ ጥሪ', 'The Wedding of': 'የሠርግ ጥሪ',
    'You\u2019re invited': 'ተጋብዘዋል', 'Open the invitation': 'ግብዣውን ክፈት', 'Tap to open': 'ለመክፈት ይንኩ',
    'About me': 'ስለ እኔ', 'About us': 'ስለ እኛ', 'Schedule': 'የጊዜ ሰሌዳ', 'Venue': 'ቦታ',
    'Gallery': 'ጋለሪ', 'Photos': 'ፎቶዎች', 'Video': 'ቪዲዮ', 'RSVP': 'መልስ',
    'Invitation sections': 'የግብዣ ክፍሎች', 'Wedding day schedule': 'የሠርጉ ቀን የጊዜ ሰሌዳ',
    'Confirm attendance': 'መገኘትዎን ያረጋግጡ', 'Will you come?': 'ይመጣሉ?', 'Number of guests': 'የእንግዶች ብዛት',
    "Yes, I'll be there": 'አዎ፣ እገኛለሁ', "Can't make it": 'መገኘት አልችልም', 'Send reply': 'መልስ ላክ',
    'Reply sent. Thank you!': 'መልስዎ ተልኳል። እናመሰግናለን!',
    'Create your invitation': 'ግብዣዎን ይፍጠሩ', 'Your invitation card is ready': 'የግብዣ ካርድዎ ዝግጁ ነው',
    'Add your photos, video and event details. After that, the QR code on this card will open your invitation for everyone who scans it.':
      'ፎቶዎችዎን፣ ቪዲዮዎን እና የዝግጅቱን ዝርዝሮች ያክሉ። ከዚያ በኋላ በዚህ ካርድ ላይ ያለው QR ኮድ ለሚቃኙት ሁሉ ግብዣዎን ይከፍታል።',
    'Create my invitation': 'ግብዣዬን ፍጠር',
    'Could not check this card. Please try again.': 'ይህን ካርድ ማረጋገጥ አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
    'This link is missing its invitation code.': 'ይህ አገናኝ የግብዣ ኮዱ ይጎድለዋል።',
    'This invitation could not be found. Check the link and try again.': 'ይህ ግብዣ አልተገኘም። አገናኙን ያረጋግጡ እና እንደገና ይሞክሩ።',
    // messages that events.js sends back
    'Name is required.': 'ስም ያስፈልጋል።', 'RSVP not available.': 'መልስ መስጠት አይገኝም።',
    'Event not found.': 'ዝግጅቱ አልተገኘም።', 'Too many requests.': 'ብዙ ጥያቄዎች ቀርበዋል።',
    'Too many attempts. Please wait a few minutes and try again.': 'ብዙ ሙከራዎች ተደርገዋል። እባክዎ ጥቂት ደቂቃዎች ጠብቀው እንደገና ይሞክሩ።'
  };

  window.LANG = L;
  window.LOC = L === 'am' ? 'am-ET' : [];                 // pass to toLocale*String()
  window.T = function (s) { return (L === 'am' && AM[s]) || s; };
  window.MONTHS = L === 'am'
    ? ['ጃንዋሪ','ፌብሩዋሪ','ማርች','ኤፕሪል','ሜይ','ጁን','ጁላይ','ኦገስት','ሴፕቴምበር','ኦክቶበር','ኖቬምበር','ዲሴምበር']
    : ['January','February','March','April','May','June','July','August','September','October','November','December'];
  window.WEEKDAYS = L === 'am'
    ? ['እሑድ','ሰኞ','ማክሰኞ','ረቡዕ','ሐሙስ','ዓርብ','ቅዳሜ']
    : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  window.DOW = L === 'am' ? ['ሰ','ማ','ረ','ሐ','ዓ','ቅ','እ'] : ['Mo','Tu','We','Th','Fr','Sa','Su']; // Monday first

  document.documentElement.lang = L;
  var css = document.createElement('style');
  css.textContent =
    '#langBtn{position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:1000;border:1px solid rgba(0,0,0,.3);' +
    'background:rgba(255,255,255,.94);color:#222;border-radius:999px;padding:9px 16px;font:600 .95rem "Noto Sans Ethiopic","DM Sans",sans-serif;' +
    'cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2)}#langBtn:focus-visible{outline:3px solid #000;outline-offset:2px}' +
    (L === 'am' ? 'html[lang=am] body *{letter-spacing:.02em!important}' : '');
  document.head.appendChild(css);

  document.addEventListener('DOMContentLoaded', function () {
    var b = document.createElement('button');
    b.id = 'langBtn'; b.type = 'button';
    b.textContent = L === 'am' ? 'English' : 'አማርኛ';
    b.setAttribute('aria-label', L === 'am' ? 'Switch to English' : 'ወደ አማርኛ ቀይር');
    b.onclick = function () {
      var n = L === 'am' ? 'en' : 'am';
      try { localStorage.setItem('lang', n); } catch (e) {}
      var u = new URL(location.href); u.searchParams.delete('lang'); location.replace(u.href);
    };
    document.body.appendChild(b);
  });
})();
