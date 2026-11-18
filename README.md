# NCD Photography Club website

Plain HTML, CSS and JavaScript. No build step, no installs.

## Put it online (GitHub Pages)
1. Create a new repository and upload everything in this folder (keep the folder structure).
2. Repository Settings, Pages, deploy from the `main` branch, root folder.
3. Open the address GitHub shows. It is detected automatically.

## Home page slideshow
Put the pictures you want in the home page slideshow into the `assets/slideshow/` folder.
They play in name order, so name them `01.jpg`, `02.jpg`, `03.jpg` and so on.
To write a caption for a picture, add a line to `assets/slideshow/captions.txt`, like `01.jpg | My caption`. A picture with no line shows "Latest photos".
To remove a picture from the slideshow, delete it from that folder. If the folder is empty, the site picks photos from the events automatically.
On GitHub Pages nothing else needs editing. On any other host, also list the file names in `assets/js/events.js` (`NCD_SLIDESHOW`).

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
