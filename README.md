# Minglr

MINGLR is an experimental software system developed to explore ways of supporting ad hoc, private videoconferences. We expect it to be useful for virtual conferences and many other kinds of online events, both business and social. An MIT working paper about the MINGLR system and its use at the ACM Collective Intelligence virtual conference (CI 2020) in June 2020 is available [here](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3662620).

* Logs (production)
    * `heroku logs --tail --app=minglr-mit`
    * `heroku logs --tail --app=pacific-anchorage-20064`

* Restart (production)
    * `heroku restart -a minglr-mit`
    * `heroku restart -a pacific-anchorage-20064`

* Run locally (development)
    * `npm run dev`

* app structure
    * server
        - `libs`: miscelleneous methods
        - `middleware`
        - `routes`
        - `schemas`: models
        - `app.js`: configures the app 
        - `socket.js`: configures socket.io