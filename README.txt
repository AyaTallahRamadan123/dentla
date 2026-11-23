DENTLA LANDING PAGE

Files
- index.html : page structure, content and the two join forms
- styles.css : design and responsive styles
- script.js  : hero motion, dentist/lab switch, form validation and submit

How to preview
Extract the ZIP and open index.html in a browser.

Join forms (replace "Log in")
- "Join as a dentist" and "Join as a lab" buttons everywhere on the page open the matching form.
- Direct links: index.html#join-dentist  and  index.html#join-lab
- Both forms validate before sending and show a confirmation message.

Receiving the submissions (important)
The two forms submit via AJAX to Formspree.
The configured endpoint is https://formspree.io/f/xzerkryn.
Both forms send their fields using FormData. Formspree should send a notification
to the verified email address configured in the Formspree dashboard. Fields:
  dentist: fullName, clinicName, email, phone, governorate, specialty, license, casesPerMonth, needs[], message
  lab:     labName, contactPerson, email, phone, governorate, license, teamSize, capacity, services[], digitalScans, message
Before publishing
- Confirm the recipient email in the Formspree dashboard.
- Replace dentlateam@gmail.com with your real contact email in index.html.
- Submit one test as a dentist and one as a lab, then verify both in Formspree submissions and the recipient inbox.
