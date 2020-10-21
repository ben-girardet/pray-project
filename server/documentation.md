# Documentation

## Structure

An explainer on where things live inside of the server application. The project files themselves live inside of the `src` directory and are built using TypeScript. When we speak of structure here, we are going to be referring to the `src` directory.

### controllers

Controllers are classes that contain methods each pertaining to a route. Each method uses as a descriptive verb decorator pertaining to a particular type of request. Controllers are prefixed using a string which denotes what goes before each method route path.