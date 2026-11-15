# NCD Photography Club website

Plain HTML, CSS and JavaScript. No build step, no installs.

## Put it online (GitHub Pages)
1. Create a new repository and upload everything in this folder (keep the folder structure).
2. Repository Settings, Pages, deploy from the `main` branch, root folder.
3. Open the address GitHub shows. It is detected automatically.

## Add photos
Make a new folder inside `assets/photos/`. Each folder is one event and its name is the event title.
Start the folder name with a date to set the order, for example `2026-03-14 Spring photo walk`.
On GitHub Pages the site reads the folders from the repository, so nothing else needs editing.
On any other host, also add the folder to the list in `assets/js/events.js`.

## Edit the Panel page
Edit `assets/js/panel-data.js`. Put portrait photos in `assets/panel/` and write the file name in `photo`.

## Still to replace
- `photoclub@example.com` in `contact.html` is a placeholder email.
- The five "Full Name" entries in `assets/js/panel-data.js`.
