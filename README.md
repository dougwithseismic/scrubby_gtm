# SCRUBBY GTM - The Tag Manager Cleaner

Working Demo - https://scrubbygtm.netlify.com/

1. Export your container
2. Drop json file below
3. Import downloaded file to GTM > Overwrite

v0.0.1 - Scrubs a GTM export to only include currently used Tags, Triggers and Variables. Paused tags and their referred triggers and variables are binned. A perfect alternative for when you inherit a bag of mess and need to put some man-hours in because nuking from orbit isn't an option.  Sing like no one is listening 🎉

# Installation and Usage

 1. `git clone https://github.com/dougwithseismic/scrubby_gtm.git scrubby_gtm`
 2. Install -  `Yarn`
 3. Export GTM Container from tagmanager.google.com > Admin > Export
    Container
 4. Replace contents of IMPORT_ME.json with Json found in your export.
 5. Run Scrubby - `yarn start`
 6. Import newly generated gtmScrub_[TIMESTAMP].json from root directory into Tag Manager (Admin > Import Container > Overwrite)
