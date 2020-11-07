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
* On refresh: try to get a new token with refresh token, if not working go to login
* If successful: store the jwt
* Decode the JWT client side and console log the signed userId
* Continue testing queries on the server