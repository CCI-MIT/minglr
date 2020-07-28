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