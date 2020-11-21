## 2020-11-05
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


## 2020-11-07

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

## 2020-11-15

- [x] Logout
- [x] Create friendship API
- [x] Manage friendships API
- [x] Add tests for friendships
- [x] Add test for listing my friendships, including sort and filters
- [x] Add test that someone "else" tries to remove the friendship of someone else (must fail)
- [x] Add test including the new "friend" fieldResolver

## 21.11.2020 - Crypting

- [x] Crypt Messages before creating or after editing
- [x] Have a simple thing in place to ensure that the topics in the view are decrypted easily (should be pretty simple with the "myShare" prop
- [x] Only request privateKey if not in memory
- [x]
 
## 21.22.2020 - Profile

- [ ] Work on Profile page so we can
- [ ] Edit current profile avatar, name
- [ ] Change password

## Next 

- [ ] Praying view
- [ ] Notes and messages
- [ ] Mark prayer as answered
- [ ] Deploy so we can use it on mobile device