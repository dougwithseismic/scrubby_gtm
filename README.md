# SCRUBBY GTM - The Tag Manager Cleaner

v0.0.1 - Scrubs a GTM export to only include currently used Tags, Triggers and Variables. Paused tags and their referred triggers and variables are binned. Perfect for when you inherit a bag of dick.  Sing like no one is listening 🎉

# Installation and Usage

 1. `git clone https://github.com/dougwithseismic/scrubby_gtm.git scrubby_gtm`
 2. Install -  `Yarn`
 3. Export GTM Container from tagmanager.google.com > Admin > Export
    Container
 4. Replace contents of IMPORT_ME.json with Json found in your export.
 5. Run Scrubby - `yarn start`
 6. Import gtmScrub_[TIMESTAMP].json into Tag Manager (Admin > Import Container > Overwrite)