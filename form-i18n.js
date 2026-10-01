/* form-i18n.js: English / Amharic for create-event.html and edit-event.html.
   Language is stored under the same key the rest of the site should use (LANG_KEY).
   If your i18n.js already uses a different localStorage key, change LANG_KEY below. */
(function () {
  const LANG_KEY = 'lang';
  const AM = {
    // ---- shared / create page ----
    'Create your invitation': 'ግብዣዎን ይፍጠሩ',
    "Add your photo, video, and details. You'll get a QR code to print on your cards.": 'ፎቶዎን፣ ቪዲዮዎን እና ዝርዝሮችን ያክሉ። በካርዶችዎ ላይ የሚታተም QR ኮድ ያገኛሉ።',
    'View invitation': 'ግብዣውን ይመልከቱ',
    'Edit invitation': 'ግብዣውን ያስተካክሉ',
    'Paste your private edit link': 'የግል የማስተካከያ ሊንክዎን ይለጥፉ',
    'Open edit page': 'የማስተካከያ ገጹን ክፈት',
    'You received this link when you created your invitation. Lost it? The shop can send it again.': 'ይህን ሊንክ ግብዣዎን ሲፈጥሩ አግኝተዋል። ጠፍቷል? ሱቁ እንደገና ሊልክልዎ ይችላል።',
    'Card code': 'የካርድ ኮድ',
    '(printed on your event card)': '(በዝግጅት ካርድዎ ላይ የታተመ)',
    'Card code (optional for admin) ': 'የካርድ ኮድ (ለአስተዳዳሪ አማራጭ) ',
    'e.g. RYVXP1': 'ለምሳሌ RYVXP1',
    'Event type': 'የዝግጅት ዓይነት',
    'Wedding': 'ሰርግ', 'Birthday': 'የልደት በዓል', 'Seminar / multi-day': 'ሴሚናር / ብዙ ቀን',
    'Church / religious': 'ቤተ ክርስቲያን / ሃይማኖታዊ', 'Memorial': 'መታሰቢያ', 'Other': 'ሌላ',
    'Title': 'ርዕስ', "Selam & Dawit's Wedding": 'የሰላም እና ዳዊት ሰርግ',
    'About us': 'ስለ እኛ', 'About me': 'ስለ እኔ',
    '(your story, shown in the "About us" section)': '(ታሪክዎ፣ በ"ስለ እኛ" ክፍል ውስጥ ይታያል)',
    '(your story, shown in the "About me" section)': '(ታሪክዎ፣ በ"ስለ እኔ" ክፍል ውስጥ ይታያል)',
    'Date and time': 'ቀን እና ሰዓት', 'Wedding date': 'የሰርግ ቀን',
    '(optional if you add a schedule below)': '(ከታች የጊዜ ሰሌዳ ካከሉ አማራጭ)',
    '(seminars: optional)': '(ሴሚናር፦ አማራጭ)',
    'Seminar days': 'የሴሚናር ቀናት', 'Time schedule': 'የጊዜ ሰሌዳ',
    'Add each day with its own title. You can change titles later.': 'እያንዳንዱን ቀን ከራሱ ርዕስ ጋር ያክሉ። ርዕሶችን በኋላ መቀየር ይችላሉ።',
    'Each day needs a date and a title.': 'እያንዳንዱ ቀን ቀን እና ርዕስ ያስፈልገዋል።',
    'Add each moment of the wedding day with its time, for example 9:00 church ceremony, 12:00 photos, 6:00 reception. All items use the wedding date above.': 'የሰርጉን ቀን እያንዳንዱን ክንውን ከሰዓቱ ጋር ያክሉ፣ ለምሳሌ 3:00 የቤተ ክርስቲያን ሥነ ሥርዓት፣ 6:00 ፎቶ፣ 12:00 ግብዣ። ሁሉም ከላይ ያለውን የሰርግ ቀን ይጠቀማሉ።',
    '+ Add day': '+ ቀን ጨምር', '+ Add to schedule': '+ ወደ ሰሌዳ ጨምር',
    'Remove day': 'ቀኑን አስወግድ', 'Remove': 'አስወግድ',
    'Date': 'ቀን', 'Start time': 'መጀመሪያ ሰዓት', 'End time': 'መጨረሻ ሰዓት', '(optional)': '(አማራጭ)',
    'Title for this day ': 'የዚህ ቀን ርዕስ ', 'Title for this day': 'የዚህ ቀን ርዕስ',
    'What happens at this time ': 'በዚህ ሰዓት የሚሆነው ', 'What happens at this time': 'በዚህ ሰዓት የሚሆነው',
    'e.g. Church ceremony': 'ለምሳሌ የቤተ ክርስቲያን ሥነ ሥርዓት',
    'e.g. Church ceremony, Photos, Reception': 'ለምሳሌ የቤተ ክርስቲያን ሥነ ሥርዓት፣ ፎቶ፣ ግብዣ',
    'e.g. Opening and Vision': 'ለምሳሌ መክፈቻ እና ራዕይ',
    'Background color': 'የጀርባ ቀለም',
    'White': 'ነጭ', 'Black': 'ጥቁር', 'Grey': 'ግራጫ', 'Cream': 'ክሬም', 'Navy': 'ጥቁር ሰማያዊ', 'Burgundy': 'ወይን ጠጅ', 'Pink': 'ሮዝ', 'Blue': 'ሰማያዊ',
    'Hosts': 'አስተናጋጆች', 'Parents / families': 'ወላጆች / ቤተሰቦች',
    '(optional. Groom\u2019s side | bride\u2019s side. Use / for a new line)': '(አማራጭ። የሙሽራው ወገን | የሙሽሪት ወገን። ለአዲስ መስመር / ይጠቀሙ)',
    'Together with their families': 'ከቤተሰቦቻቸው ጋር በመሆን',
    'Mr. & Mrs. Tadesse / Alemu | Mr. & Mrs. Bekele / Almaz': 'አቶ እና ወ/ሮ ታደሰ / አለሙ | አቶ እና ወ/ሮ በቀለ / አልማዝ',
    'Venue': 'ቦታ', 'Map link': 'የካርታ ሊንክ', '(Google Maps share link)': '(የGoogle Maps መጋራት ሊንክ)',
    'Message': 'መልእክት',
    'Photos': 'ፎቶዎች', 'Main photos': 'ዋና ፎቶዎች',
    '(up to 3, shown as a slideshow. JPG, PNG or WebP, up to 50 MB each)': '(እስከ 3፣ እንደ ስላይድ ሾው ይታያሉ። JPG፣ PNG ወይም WebP፣ እያንዳንዳቸው እስከ 50 ሜባ)',
    'Additional photos': 'ተጨማሪ ፎቶዎች', 'Gallery photos': 'የማዕከለ ስዕል ፎቶዎች',
    '(up to 20, shown in the "Photos" section. JPG, PNG or WebP, up to 50 MB each)': '(እስከ 20፣ በ"ፎቶዎች" ክፍል ውስጥ ይታያሉ። JPG፣ PNG ወይም WebP፣ እያንዳንዳቸው እስከ 50 ሜባ)',
    '(up to 20, shown in the "Gallery" section. JPG, PNG or WebP, up to 50 MB each)': '(እስከ 20፣ በ"ማዕከለ ስዕል" ክፍል ውስጥ ይታያሉ። JPG፣ PNG ወይም WebP፣ እያንዳንዳቸው እስከ 50 ሜባ)',
    'Video': 'ቪዲዮ',
    '(MP4, MOV or WebM, up to 50 MB. Shorter videos load faster for guests.)': '(MP4፣ MOV ወይም WebM፣ እስከ 50 ሜባ። አጫጭር ቪዲዮዎች ለእንግዶች በፍጥነት ይከፈታሉ።)',
    '(MP4, MOV or WebM, up to 50 MB)': '(MP4፣ MOV ወይም WebM፣ እስከ 50 ሜባ)',
    'Let guests reply (RSVP)': 'እንግዶች ምላሽ እንዲሰጡ ፍቀድ (RSVP)',
    'Allow guests to reply (RSVP)': 'እንግዶች ምላሽ እንዲሰጡ ፍቀድ (RSVP)',
    'Uploading…': 'በመጫን ላይ…',
    'Your invitation is ready': 'ግብዣዎ ተዘጋጅቷል',
    'The QR code on your card now opens this invitation. The code below is an extra copy you can print elsewhere.': 'በካርድዎ ላይ ያለው QR ኮድ አሁን ይህን ግብዣ ይከፍታል። ከታች ያለው ኮድ በሌላ ቦታ ማተም የሚችሉት ተጨማሪ ቅጂ ነው።',
    'Guests will open:': 'እንግዶች የሚከፍቱት፦',
    'Download QR (SVG)': 'QR አውርድ (SVG)', 'Preview page': 'ገጹን ቅድመ እይታ', 'View replies': 'ምላሾችን ይመልከቱ',
    'Your private edit link.': 'የግል የማስተካከያ ሊንክዎ።',
    'Keep it safe. Anyone who has it can change this invitation and see the replies.': 'በጥንቃቄ ያስቀምጡት። ሊንኩ ያለው ሰው ይህን ግብዣ መቀየር እና ምላሾችን ማየት ይችላል።',
    'Copy edit link': 'የማስተካከያ ሊንክ ቅዳ', 'Copied': 'ተቀድቷል',
    'Lost the link? The shop can send it to you again.': 'ሊንኩ ጠፍቷል? ሱቁ እንደገና ሊልክልዎ ይችላል።',
    'This card already has an invitation.': 'ይህ ካርድ ቀድሞ ግብዣ አለው።',
    'An invitation already exists for this card. Paste your private edit link below to change it.': 'ለዚህ ካርድ ግብዣ ቀድሞ አለ። ለመቀየር የግል የማስተካከያ ሊንክዎን ከታች ይለጥፉ።',
    'No invitation has been created with this card yet. Fill in the form below to create it.': 'በዚህ ካርድ እስካሁን ግብዣ አልተፈጠረም። ለመፍጠር ከታች ያለውን ቅጽ ይሙሉ።',
    'That does not look like an edit link. Paste the full link you were given.': 'ይህ የማስተካከያ ሊንክ አይመስልም። የተሰጥዎትን ሙሉ ሊንክ ይለጥፉ።',
    'Could not open the edit page.': 'የማስተካከያ ገጹን መክፈት አልተቻለም።',
    'Please choose up to 3 photos.': 'እባክዎ እስከ 3 ፎቶዎች ብቻ ይምረጡ።',
    'Please choose up to 20 additional photos.': 'እባክዎ እስከ 20 ተጨማሪ ፎቶዎች ብቻ ይምረጡ።',
    'Each schedule item needs a time.': 'እያንዳንዱ የሰሌዳ ንጥል ሰዓት ያስፈልገዋል።',
    'End time must be different from the start time.': 'የመጨረሻ ሰዓት ከመጀመሪያ ሰዓት የተለየ መሆን አለበት።',
    'Each seminar day needs a date and a title.': 'እያንዳንዱ የሴሚናር ቀን ቀን እና ርዕስ ያስፈልገዋል።',
    'Create invitation': 'ግብዣ ፍጠር',
    'Upload failed.': 'መጫን አልተሳካም።',
    'Could not load replies.': 'ምላሾችን መጫን አልተቻለም።', 'No replies yet.': 'እስካሁን ምላሽ የለም።',
    'coming': 'ይመጣል', 'not coming': 'አይመጣም',
    // ---- edit page ----
    'Edit your invitation': 'ግብዣዎን ያስተካክሉ',
    'Loading your invitation…': 'ግብዣዎ በመጫን ላይ…',
    'Change anything below and press Save. Your QR code and link stay the same, so cards you already printed keep working.': 'ከታች ማንኛውንም ነገር ቀይረው አስቀምጥን ይጫኑ። QR ኮድዎ እና ሊንክዎ አይቀየሩም፣ ስለዚህ ያተሟቸው ካርዶች መስራታቸውን ይቀጥላሉ።',
    'Save changes': 'ለውጦችን አስቀምጥ', 'Saving…': 'በማስቀመጥ ላይ…',
    'Saved. Your invitation is updated.': 'ተቀምጧል። ግብዣዎ ተዘምኗል።',
    'Guest replies': 'የእንግዶች ምላሾች', 'Show replies': 'ምላሾችን አሳይ',
    'No photos yet.': 'እስካሁን ፎቶ የለም።', 'No additional photos yet.': 'እስካሁን ተጨማሪ ፎቶ የለም።', 'No video yet.': 'እስካሁን ቪዲዮ የለም።', 'Remove this photo': 'ይህን ፎቶ አስወግድ', 'Remove current video': 'አሁን ያለውን ቪዲዮ አስወግድ',
    ' Remove this photo': ' ይህን ፎቶ አስወግድ', ' Remove': ' አስወግድ', ' Remove current video': ' አሁን ያለውን ቪዲዮ አስወግድ',
    'This edit link is incomplete. Please open the full link you were given.': 'ይህ የማስተካከያ ሊንክ ያልተሟላ ነው። እባክዎ የተሰጥዎትን ሙሉ ሊንክ ይክፈቱ።',
    'This edit link is not valid.': 'ይህ የማስተካከያ ሊንክ ትክክል አይደለም።',
    'Could not reach the server. Please try again.': 'ከሰርቨሩ ጋር መገናኘት አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
    'Please choose the wedding date.': 'እባክዎ የሰርጉን ቀን ይምረጡ።',
    'Maximum 3 photos. Remove one first or choose fewer files.': 'ቢበዛ 3 ፎቶዎች። መጀመሪያ አንዱን ያስወግዱ ወይም ጥቂት ፋይሎችን ይምረጡ።',
    'Maximum 20 additional photos. Remove some or choose fewer files.': 'ቢበዛ 20 ተጨማሪ ፎቶዎች። የተወሰኑትን ያስወግዱ ወይም ጥቂት ፋይሎችን ይምረጡ።',
    'Language': 'ቋንቋ'
  };
  const dyn = [
    [/^The server did not accept the request \(status (\d+)\)\. The events API may not be deployed yet\.$/, (m, s) => 'ሰርቨሩ ጥያቄውን አልተቀበለም (ሁኔታ ' + s + ')። የዝግጅት API እስካሁን ላይሰማራ ይችላል።'],
    [/^Save failed \((\d+)\)\.$/, (m, s) => 'ማስቀመጥ አልተሳካም (' + s + ')።']
  ];
  let lang = 'en';
  try { const q = new URLSearchParams(location.search).get('lang'); const s = localStorage.getItem(LANG_KEY); lang = (q === 'am' || q === 'en') ? q : (s === 'am' ? 'am' : 'en'); } catch {}
  const FT = s => {
    if (lang !== 'am' || typeof s !== 'string') return s;
    if (AM[s] !== undefined) return AM[s];
    for (const [re, fn] of dyn) { const m = s.match(re); if (m) return fn(...m); }
    return s;
  };
  window.FT = FT; window.FLANG = () => lang;

  // Static text and attributes: remember the English original so we can switch back and forth.
  const orig = new WeakMap(), origAttr = new WeakMap();
  function walk(root) {
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.parentNode && /^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) || !n.nodeValue.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const nodes = []; while (tw.nextNode()) nodes.push(tw.currentNode);
    nodes.forEach(n => {
      const rec = orig.get(n), en = (rec && n.nodeValue === rec.written) ? rec.en : n.nodeValue;
      const lead = en.match(/^\s*/)[0], trail = en.match(/\s*$/)[0], core = en.trim();
      const t = FT(core); n.nodeValue = t === core ? en : lead + t + trail;
      orig.set(n, { en, written: n.nodeValue });
    });
    root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(e => {
      let o = origAttr.get(e); if (!o) { o = {}; ['placeholder', 'title', 'aria-label'].forEach(a => { if (e.hasAttribute(a)) o[a] = e.getAttribute(a); }); origAttr.set(e, o); }
      for (const a in o) e.setAttribute(a, FT(o[a]));
    });
  }
  window.applyFormLang = () => { document.documentElement.lang = lang; walk(document.body); document.title = FT(window.__enTitle || (window.__enTitle = document.title)); };

  function switcher() {
    const b = document.createElement('div');
    b.style.cssText = 'position:fixed;top:10px;right:10px;z-index:50;display:flex;gap:4px;background:#fff;border:1px solid #b9cfcc;border-radius:999px;padding:3px;font:500 .85rem "DM Sans","Noto Sans Ethiopic",sans-serif';
    [['en', 'English'], ['am', 'አማርኛ']].forEach(([c, n]) => {
      const x = document.createElement('button'); x.type = 'button'; x.textContent = n; x.lang = c; x.dataset.noI18n = '1';
      x.style.cssText = 'border:0;border-radius:999px;padding:6px 12px;cursor:pointer;font:inherit;background:' + (c === lang ? '#0f5257' : 'transparent') + ';color:' + (c === lang ? '#fff' : '#0f5257');
      x.setAttribute('aria-pressed', c === lang);
      x.onclick = () => { try { localStorage.setItem(LANG_KEY, c); } catch {} const u = new URL(location.href); u.searchParams.delete('lang'); location.href = u.href; };
      b.append(x);
    });
    b.setAttribute('role', 'group'); b.setAttribute('aria-label', 'Language'); document.body.append(b);
  }
  document.addEventListener('DOMContentLoaded', () => { switcher(); window.applyFormLang(); });
})();
