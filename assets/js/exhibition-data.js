/* Exhibition data. Add a month at the top of the list when its winner is chosen. While the list is empty the page says entries are open.
   Each photo: src (a web-sized copy, about 2500 px long side, put in assets/exhibition/), title, by, class.
   rank: 'winner' (one per month) or 'commended'. Optional: story, camera, full (link to the full-quality original).
   formUrl: the Google Form link. Leave it empty until the form exists.
   sample: true shows a notice that the photos are stand-ins (only for testing). */
window.EXHIBITION = {
  "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSeXPmIEDwzG20LI3ZRzvFDP0CFSW2ncX94FyHkc91pkClsDpg/viewform",
  "closing": "24th",
  "months": []
};
