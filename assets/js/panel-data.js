/* PANEL PAGE: edit this file to change the Panel page. Nothing else needs to change.
   ADD A PERSON     Copy one { ... } block (with its comma) and paste it where you want it. Order here is order on the page.
   REMOVE A PERSON  Delete the block and its comma.
   PHOTO            Put the image in assets/panel/ and write its file name in "photo" (lowercase, no spaces).
                    Leave "photo" empty ("") to show the person's initials. Portrait photos about 800px wide look best.
   TEXT             Edit the words between the quote marks. Leave a field empty ("") to hide it.
   GROUPS           Each person says which group they belong to. The group names are listed under "groups" below. */
window.PANEL_DATA = {
  eyebrow: "Panel",
  title: "The people who run the club.",
  intro: "The executive committee that plans our walks, runs critique nights and hangs the annual exhibition.",
  groups: { exec: "Executive committee 2026/27" },
  people: [
    { group: "exec", name: "Abrar Sadad", photo: "president.jpg", position: "President", speech: "" },
    { group: "exec", name: "Noshin Tabassum", photo: "vice-president.jpg", position: "Vice President", speech: "" },
    { group: "exec", name: "Adib Bin Waheed", photo: "general-secretary.jpg", position: "General Secretary", speech: "" },
    { group: "exec", name: "Sajh Saha Swapno", photo: "assistant-general-secretary.jpg", position: "Assistant General Secretary", speech: "" },
    { group: "exec", name: "Radiah Raha", photo: "organizing-secretary.jpg", position: "Organizing Secretary", speech: "" }
  ]
};
