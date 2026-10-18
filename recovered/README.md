# Warm and Fuzzies Wall — Recovered Notes

**Micah's 30th birthday wall.** Originally a Replit app (`WarmFuzzyWall`) backed by a
Neon Postgres database provisioned through Replit. When the Replit subscription lapsed,
the database was deleted. Replit's retention window is about a week, and the lapse went
unnoticed for months, so the data was gone before anyone could export it.

This is what survived.

Recovered from the [YouTube demo video](https://youtu.be/_PtelREnQqY), its thumbnail, a
screenshot the Replit agent attached to a commit, and a screenshot of the live wall.

---


**19 notes recovered** (14 complete or near-complete, 5 fragments).

---

## Complete notes

### 1. To: Geo — Hope — May 2

> Happy Birthday Geo 🥳 You amazing, creative, technologically brilliant, phenomenal soul, you! Keep creating the music ever inspiring Humanity to sing. Wishing you 30 more extraordinary years ahead - and a thousand more greater still. - Hope 🎈 Well

— **Hope**

### 2. Crystal Gravy — Apr 25

> Yoooo Mr geo you're the man! Great to know ya. Happy birthday!

— **Crystal Gravy**

### 3. Anonymous — Apr 24

> Happy birthday to the most creative and inspiring person I have ever met. A person with more drive and intelligence than most. Thank God for the parking meter we met at. May the next 30 years be even better than your last!

— **Anonymous**

### 4. TB — Apr 24

> You've always been so driven, curious, & experimental. Happy Birthday! Hope this new decade is grounded in community, awe, & safe places to land 🕊️

— **TB**

### 5. Anonymous — Apr 23

> I told chatgpt to catch me outside on righting an essay for Micah's 30th birthday. But I really didn't have a good joke to follow that up with. Umm Yeah. What else do I say? This dude right here (metaphorically points at Micah), all grown and stuff in his 30s now. I love him. And don't you forget it!

— **Anonymous**

### 6. JD — Apr 23

> Eyyyy! Happy fu*cckkkiiinnng birthday!! It's been a pleasure to have met you and hoping the best for you man! Good luck on your journey and make those moments count!

— **JD**

### 7. Allie — Apr 23

> MICAH!! So grateful to have met u. I literally wouldn't be where I am if it weren't for your kind heart. Love u boo!!

— **Allie**

### 8. Mani — Apr 23

> Micah!! We've known each other 16 years now!! Happy 30th 🥳🎂 As this benchmark hits, I hope you continue to bring your childhood curiosities and imaginative creativity to every endeavor you choose. Wishing many more revolutions for ya! Much prosperity, love, and positive energy 🫶🏼✨

— **Mani**

### 9. To: Micah — Sarang — Apr 23, 2025 at 10:19 AM

> I met Micah way back in 2015 (10 years ago??) when we were proctors / student research assistants at the good ol' TACC Vislab at UT Austin. We collab'd on a bunch of cool projects on multi touch and immersive technologies and generally had good times. Over the summer I remember making a cool promo video for Google Glass research and Micah was the star actor and our buddy RJ made the background piano music. Happy birthday bro! Keep in touch 🚀

— **Sarang**

### 10. To: Micah — Geo — May 9

> I love you

— **Geo**

*This is Micah's own note (authored as Geo), shown in a modal*

### 11. Jeff Dudan — Apr 23

> It's been awesome seeing you go from a cyborg in highschool to an emotional wreck like everyone else! Glad to call you my brother!

— **Jeff Dudan**

*OCR read this as 'Niff Daddy' / 'NFR Buddy' / 'Jeff Dudan' in different frames — likely 'Jeff Dudan'*

### 12. To: Micah — unknown

> Micah, being a posse scholar with you and going through the 4 years at UT, and seeing you approached everything with an "glass is half full" attitude was always inspiring for posse mates like me.

— **unknown**

*Previously a medium-confidence fragment reconstructed from a Replit commit screenshot that cut off mid-sentence. Confirmed verbatim, including the original "an glass is half full" typo.*

### 17. Anonymous — Apr 23

> Happy birthday! Yer cute.

— **Anonymous**

### 19. Margrit Pez — Apr 23

> Happy Birthday to my Oliver Poppins, May your 30s be your blessed and best years yet! Can't wait to see all the great things I know this next chapter will bring to you and cheers to many more memories together

— **Margrit Pez**

*Never appeared in the demo video. Recovered solely from this screenshot.*

---

## Fragments

Only these parts were ever visible. The rest is gone.

### 13. unknown

> …friend and brother. Lord willing, in this lifetime and the next, I got you!

— **unknown**

*Only the bottom half of this note was ever visible on camera. Beginning is unrecoverable.*

### 14. unknown

> …birthday marks the beginning of a year (and decade!) filled with joy,

— **unknown**

*Middle fragment only. Beginning and end never appeared on camera.*

### 15. To: Micah — unknown

> Micah, you are one of the most thoughtful, creative, and inspirational people that I…

— **unknown**

*Cut off by the bottom edge of the frame.*

### 16. unknown

> Happy 30th Birthday! It feels like just yesterday we were at UT Austin together…

— **unknown**

*Cut off by the bottom edge of the frame.*

### 18. unknown — Apr 23

> …day 🎂🎈 🥰

— **unknown**

*Only a trailing fragment visible. Almost entirely lost.*

---

## What didn't get recovered

The video is a two-minute demo, not an exhaustive capture. It only shows what Micah
happened to scroll past. The app paginated at 12 notes per page, so the original wall
was almost certainly larger than what's here.

**Dead ends, all confirmed:**

- **Neon Postgres database** — deleted with the subscription. ~1 week retention, expired by months.
- **Replit support** — confirmed unrecoverable.
- **Wayback Machine** — zero snapshots. The site was a client-side app that crawlers never captured.
- **The live deployment** — `warm-fuzzy-wall--geoppls.replit.app` still serves the UI, but `/api/notes` returns 500. The database connection is dead.
- **Git history** — no dumps, exports, or seed data were ever committed. Verified against every commit.

## Places left to look

1. **Your Downloads folder.** The app had an Export button hitting `/api/notes/export` that returned the entire database as JSON to the browser. If you ever clicked it, that file has everything and this document is obsolete.
2. **Your camera roll / Google Photos.** You built this for your birthday — you probably screenshotted it.
3. **Group chats.** Anyone who screenshotted their own note is a direct source. One screenshot already recovered a note the video never showed.
4. **The named authors.** Hope, Mani, Allie, JD, TB, Crystal Gravy, Sarang, Jeff Dudan, Margrit Pez. They wrote these — they can confirm the text and may have their own copies.

If an export turns up, `import_notes.py` will merge it with what's here instead of
overwriting, and `render_readme.py` will regenerate this document.
