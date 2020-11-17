## 2020-11-05
I am failing to get the right topics according to currently logged in user.

Observations:

* jwt savec in http-cookie might not be the right thing to do
* btw: the http-cookie fails to persist on refresh
* might need to implement a logout to make the process clearer
* unsure about which "jwt" is sent to server with each requests (could be due to http cookie). Seems I always request the server from the same user.

What I shoudl probably do:

[*] Not JWT http-cookie storage anymore (server only sends token via json response)
[*] Client stores the JWT in memory
[*] The refreshToken can be stored in http cookie
[*] In order to call refreshToken I need to provide userId, check if this is the right thing or if I could avoid that (removing the need of userId)
[*] On refresh: try to get a new token with refresh token, if not working go to login
[*] If successful: store the jwt


## 2020-11-07

Login is now pretty well in place. Now is the time to improve the topic experience

[*] Add sorting and filtering options in topic requests
[*] Implement sort by last update and filter by status on topics view
[*] Try to watch the topics in the topics view so that when a topic is created or edited it is refreshed on the page (tried to used watch without much success yet, try again another time)
[*] Make Open topic work
[*] Make the edit topic work
[*] Make change topic status work
[*] Make delete topic status work
[*] Try the imageService for topic images
[*] Fix implementation of croppie in avatar and topic-form (fixed adding croppie css)
[*] Display preview image in topic preview and topic detail
[*] Create a Value Converter to "select" the best image from the image array when displaying an image (ex: | getFileId:400)
[*] Fix getUser in mini-user component
[*] Implement function API tests for topics filtering and sorting

## 2020-11-15

[ ] Work on Profile page so we can
[ ] Edit current user
[*] Logout
[*] Create friendship API
[*] Manage friendships API
[*] Add tests for friendships
[*] Add test for listing my friendships, including sort and filters
[*] Add test that someone "else" tries to remove the friendship of someone else (must fail)

Once this is done, would be good to implement crypting

[ ] Crypt Messages before creating or after editing
[ ] Have a simple thing in place to ensure that the topics in the view are decrypted easily (should be pretty simple with the "myShare" prop

 