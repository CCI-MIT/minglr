# Minglr

### About Minglr
MINGLR is an experimental software system developed to explore ways of supporting ad hoc, private videoconferences. We expect it to be useful for virtual conferences and many other kinds of online events, both business and social. An MIT working paper about the MINGLR system and its use at the ACM Collective Intelligence virtual conference (CI 2020) in June 2020 is available [here](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3662620).

### App structure
 * server
   - `libs`: miscelleneous methods
   - `middleware`
   - `routes`
   - `schemas`: models
   - `app.js`: configures the app 
   - `socket.js`: configures socket.io
* client
   - `hoc`: high-level component to authorize the user
   - `components`
      - `approach`: components that go only inside `approach` container
      - `commons`: components that are repeatedly used in multiple pages
      - `containers`: components that act as a container that contains various components
      - `pages`: components that act as a page that shows various containers

### How to deploy your own instance
1. Clone this repository
2. Join [Heroku](https://heroku.com)
3. Create new app on Heroku
4. Go to settings of your app and set up Config Vars as follows:
   - before this, you would need to work on [mongodb](mongodb.com), [cloudinary](https://cloudinary.com), [Google dev center](https://developers.google.com/identity/sign-in/web), and [Facebook dev center](https://developers.facebook.com/)
   ```
   MONGO_ID=your id at mongodb.com
   MONGO_PASSWORD=your password at mongodb.com
   MONGO_APPNAME=app name at mongodb.com
   
   GOOGLE=your OAuth key on Google developer tool
   FACEBOOK=your OAuth key on Facebook developer tool
   
   CLOUD_KEY=your key on cloudinary.com
   CLOUD_SECRET=your secret key on cloudinary.com
   CLOUD_NAME=your cloud name on cloudinary.com
   
   EMAIL_ADDRESS=your email you would like to use for password recovery
   EMAIL_PASSWORD=password of the email above
   
   DOMAIN=your.domain
   ```
5. Turn on your terminal and go to the directory where you cloned this repo
6. Install the Heroku CLI
   - Download and install the Heroku CLI.
   - If you haven't already, log in to your Heroku account and follow the prompts to create a new SSH public key.
   ```
   $ heroku login
   ```
7. Set git remote heroku to https://git.heroku.com/your-app-name.git
   ```
   heroku git:remote -a your-app-name
   ```
8. Deploy Minglr to Heroku
   ```
   git push heroku master
   ```
   

### How to run Minglr locally
1. Clone this repository
2. `npm install && npm run dev`

© Copyright 2020 Massachusetts Institute of Technology


### Citation
Please cite our paper if you use the code or data in this repository.

```
@inproceedings{song2021online,
  title={Online mingling: supporting ad hoc, private conversations at virtual conferences},
  author={Song, Jaeyoon and Riedl, Christoph and Malone, Thomas W},
  booktitle={Proceedings of the 2021 CHI Conference on Human Factors in Computing Systems},
  pages={1--10},
  year={2021}
}
```
