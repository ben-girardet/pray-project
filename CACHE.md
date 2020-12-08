# Apollo Cache pipeline

This files is an attempt to define a good workflow/pipeline for handling the cache. The goals are:

- [ ] Provide a nice offline experience
- [ ] Lower the load on the server
- [ ] Still provide data accuracy

## Last update check first

I would like to try a cache pattern where:

* Queries are usually done with `cache-first` fetchPolicy. It means that if the data has already been fetch previously its available offline
* Each quries have a sibling query called `hasMoreRecent` request. For exemple the `topics` query has a `topicsHasMoreRecent` where the client sends its last `updatedAt` date from the topics list and the server replies with `true` or `false`. If false we can stay with `cache-first`, if true we do a subsequent `network-only` query

### Background topics fetching

With this in minde we could even go one step further and download recent topics in the background. It would go like this:

* When the app goes back in focus
* It makes a `networkOnly` - `topicsHasMoreRecent` query. If it returns true:
* It makes a `networkOnly` - `topics` query. This list will give back the topics, in order of `updatedAt`
* In the background, the app can then make a call to each topic with a pair of `topicHasMoreRecent` - `topic` to fetch the most recent data, until it reaches the point where the `topicHasMoreRecent` returns false. Then it can be assured that the apps cache is up to date

### Optimizing this pattern

The pattern could probably be optimized. Here are some ideas:

* Caching the `hasMoreRecent` results in Redis on the server side
* Making one call returning all updated data at once

### App's first load

This pattern could also be used at the first load of the app to fetch the data of the whole account pretty quickly. This would allow for offline viewing usage immediately.

### Identifying queries that should always work only in `network-only` mode

* Maybe the sharing screen

## Cache-first always

Another partern would be to go for `cache-first` always, except when there is an explicit refresh requested or required

* First load: `cache-first` is fine because cache is empty
* Requests a `network-only` when.
  * Pull to refresh
  * App back in focus
  * On notification
* Requiring a `network-only` for:
  * Sharing screen
  * Messaging view (interval)
  * Last fetch in the current view is older than one hour