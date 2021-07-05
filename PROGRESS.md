# Progress

Sort of a roadmap

## 2020-11-05

I am failing to get the right topics according to currently logged in user.

Observations:

* jwt savec in http-cookie might not be the right thing to do
* btw: the http-cookie fails to persist on refresh
* might need to implement a logout to make the process clearer
* unsure about which "jwt" is sent to server with each requests (could be due to http cookie). Seems I always request the server from the same user.

What I shoudl probably do:

- [x] Not JWT http-cookie storage anymore (server only sends token via json response)
- [x] Client stores the JWT in memory
- [x] The refreshToken can be stored in http cookie
- [x] In order to call refreshToken I need to provide userId, check if this is the right thing or if I could avoid that (removing the need of userId)
- [x] On refresh: try to get a new token with refresh token, if not working go to login
- [x] If successful: store the jwt


## 2020-11-07

Login is now pretty well in place. Now is the time to improve the topic experience

- [x] Add sorting and filtering options in topic requests
- [x] Implement sort by last update and filter by status on topics view
- [x] Try to watch the topics in the topics view so that when a topic is created or edited it is refreshed on the page (tried to used watch without much success yet, try again another time)
- [x] Make Open topic work
- [x] Make the edit topic work
- [x] Make change topic status work
- [x] Make delete topic status work
- [x] Try the imageService for topic images
- [x] Fix implementation of croppie in avatar and topic-form (fixed adding croppie css)
- [x] Display preview image in topic preview and topic detail
- [x] Create a Value Converter to "select" the best image from the image array when displaying an image (ex: | getFileId:400)
- [x] Fix getUser in mini-user component
- [x] Implement function API tests for topics filtering and sorting

## 2020-11-15

- [x] Logout
- [x] Create friendship API
- [x] Manage friendships API
- [x] Add tests for friendships
- [x] Add test for listing my friendships, including sort and filters
- [x] Add test that someone "else" tries to remove the friendship of someone else (must fail)
- [x] Add test including the new "friend" fieldResolver

## 21.11.2020 - Crypting

- [x] Crypt Messages before creating or after editing
- [x] Have a simple thing in place to ensure that the topics in the view are decrypted easily (should be pretty simple with the "myShare" prop
- [x] Only request privateKey if not in memory

## 22.11.2020 - Branding

- [x] Work on a name (Sunago)
- [x] Web font: GFS Neohellenic

## 23.11.2020 - Overall design

- [x] Simplify overall design (avoid complex thing with headbar and bottombar for now, make it white if possible)
- [x] Have the logo (sunago) always in main screen top left
- [x] Display tabs below (like Twitter)
 
## 24.11.2020 - Update packages

- [x] Identify issue with dirty-checker when updating to latest Aurelia
- [x] Open up an issue if needed, reach for help
- [x] Identify issue with Safari and latest update of fast (fast-provider)
- [x] Open up an issue if needed, reach for help

## 26.11.2020 - Several things

- [x] Migrate to sunago.app
- [x] Start the conversation page
- [x] Deploy so we can use it on mobile device

## 27.11.2020 - Messages

- [x] Messages view

## 28.11.2020 - Messages

- [x] Fix refreshToken issue (fixed by not sending the jwt with the refreshToken mutation)
- [x] Fix login button / form / enter (seem ok, to be confirmed)
- [ ] Check how the "return" button on login form could be called something else (not 100% so far)
- [x] Make preview work with the right datas (except prayer)
- [x] Memorize previous username for fast login

## 29.11.2020 Prayer Model

- [x] Define prayer model
- [x] Display prayers inside conversation
- [x] Add tests for prayers

## 01.12.2020 Praying View (playlist)

- [x] Playlist with nice navigation (the cool thing from previous app was that when you mention that you pray you automatically get the next topic)

## 02.12.2020 Server cache with Redis

- [x] Add a cache layer with redis (https://medium.com/@haimrait/how-to-add-a-redis-cache-layer-to-mongoose-in-node-js-a9729181ad69)

## 05.12.2020 

- [x] Upgrade to latest FAST
- [x] Mark prayer as answered
- [x] Nicer head buttons
- [x] If topic is archived, only keep those where I'm owner
- [x] Create a nice flag for answered topics (so they can be clearly identified)
- [x] Nicer topic form
- [x] Work on Profile page so we can edit current profile avatar, name


## 07.12.2020 - Apollo Cache improvements

- [x] Do some research on possible cache patterns
- [ ] Save edited topic when submitting updates

## 16.12.2020 - Go for an app ready to be tried

- [x] Crypt messages
- [x] Import data
- [x] Import images

## 17.12.2020 - Prepare for production

- [x] Test Jelastic deployment
- [x] Send code by SMS for registration
- [x] Script to start node automatically in NodeJS container
- [x] Import data in production

## 25.12.2020 - Use Page Visibility API
- [x] Check login state when back to foreground
- [x] Try to fetch topics again when back to foreground
- [x] Improve webpack config for better caching and PWA update

## 26.12.2020 - Prod env
- [x] Update prod scripts for Jelastic
- [x] Restore the storage container in Jelastic env

## 27.12.2020 - Many fixes
- [x] Upgrade Aurelia to last version
- [x] Fix redis issues
- [x] Refactoring of CryptingService, with more precise crypting/decrypting and detection of crypted values
- [x] Scroll to bottom when opening a conversation
- [x] Fetch new data silently when possible, using apollo cache otherwise
- [x] Nl2br in messages
- [x] Set cache-control for images so that the browser can safely cache them for long time

## 29.12.2020 - Viewed by
- [x] Add a "viewedBy" property to topic, messages and prayers model so we can add personalised notifications based on who viewed what

## 30.12.2020 - Prod client
- [x] Fix cookie (same-site not strict)
- [x] Fix image service (mode not production in webpack)

## 31.12.2020 - Prod client
- [x] Add a badge in "list" and "settings" screen for nb of updates and nb of friends requests
- [x] Fix friendship list cache and cache clearing
- [x] Backups scripts for DB and files
- [x] Fixes for better UX
- [x] Version number on login screen

## Early January

- [x] Activity feed
- [x] Cordova App (TestFlight)
- [x] Start pray from messages view must start with current topic


## 9.1.2021 - Improve frienship flow
- [x] Add little helps along the process
- [x] Improve wording
- [x] Only display notification for friends requests, not friends waiting for reply
- [x] Add friendships in activity
- [x] Search for friends by phone number
- [x] When removing a friendship: also remove all shares from (in both directions)

## 11.1.2021 - Improve UX with help screens and illustrations

- [x] Ensure the screen looks amazing even without content (after first registration)
- [x] Help tooltips

# 20.1.2021 - Internationalization
- [x] Translation i18n

# 30.1.2021 - Internationalization
- [x] Web client ready in english

# 1.2.2021 - Many things
- [x] Add a client version checker (for API) in order to inform user of out-of date client version and require update
- [x] Change password / no password, only SMS
- [x] Ensure a nice register process
- [x] Diminish the number of refresh tokens available per user
- [x] Add a version from GIT in API ? Or use the build version ?
- [x] Improve Apple / Demo user account with new mobile only system
- [x] Stack AppNotifications (so we can see several)


# 5.2.2021 - Many things
- [x] Solidify notification start and settings
- [x] Solid testing of notifications
- [x] Translation: external files and notification translation

## Next 
- [ ] Create more realistic tests scenario including user registration and increased users friendships, refresh token and admin accounts
- [ ] Create a way to have a realistic staging
- [ ] Create SMS API account
- [ ] Ackknoledgment (incl. illustrations)
- [ ] Backups every night
- [ ] Avoid REDIS to crash
- [ ] Work on the TODO's
- [ ] Optimize bundles with code splitting (https://webpack.js.org/guides/code-splitting/)
- [ ] Create tests with image upload (if not yet)

- [ ] Allow owner to give "owner" role on their topics
- [ ] Cache images
- [ ] Fix class-validator warning, check if I need it for the project

## Crypting compliance

- Apple Encryption
https://help.apple.com/app-store-connect/#/dev63c95e436
https://help.apple.com/app-store-connect/#/devc3f64248f
https://getonthestore.com/export-compliance/
https://annual-self-classification-report.github.io
