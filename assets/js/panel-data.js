/* PANEL PAGE: edit this file to change the Panel page. Nothing else needs to change.
   ADD A PERSON     Copy one { ... } block (with its comma) and paste it where you want it. Order here is order on the page.
   REMOVE A PERSON  Delete the block and its comma.
   PHOTO            Put the image in assets/panel/ and write its file name in "photo" (lowercase, no spaces).
                    Leave "photo" empty ("") to show the person's initials. Portrait photos about 800px wide look best.
   TEXT             Edit the words between the quote marks. Leave a field empty ("") to hide it.
   GROUPS           Each person says which group they belong to: group: "heads" or group: "members". */
window.PANEL_DATA = {
  eyebrow: "Panel",
  title: "The people who run the club.",
  intro: "The heads and members who plan our walks, run critique nights and hang the annual exhibition.",
  groups: { heads: "Club heads", members: "Members" },
  people: [
    { group: "heads", name: "Full Name", photo: "", position: "President", speech: "Replace this with the president's own words." },
    { group: "heads", name: "Full Name", photo: "", position: "Vice President", speech: "Replace this with the vice president's own words." },
    { group: "heads", name: "Full Name", photo: "", position: "General Secretary", speech: "Replace this with the general secretary's own words." },
    { group: "members", name: "Full Name", photo: "", position: "Executive Member", speech: "Replace this with the member's own words." },
    { group: "members", name: "Full Name", photo: "", position: "Executive Member", speech: "Replace this with the member's own words." }
  ]
};
