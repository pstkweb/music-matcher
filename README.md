Music Matcher
==============

General description
-------------------
This Node.js tool provides a website interface that compare songs to find harmonic similarities (chord progression) and propose you songs that you might like based on this specificity.

This tool was developped for the [Master DNR2i](https://www.info.unicaen.fr/DNR2I) - Caen University final year annual project supervised by [François Rioult](https://www.greyc.fr/users/rioultf).

Individual points
-----------------
This is a proof of concept and is not fully developped. Some code can be rewrited/enhanced.

Song data are stored in a MongoDB as chords progression. The website animate a circle of fifth showing the progression via D3.js. Finally the similarities are found with Boyer–Moore–Horspool algorithm.

Technologies
------------
* [MongoDB](https://www.mongodb.org/)
* [Node.js](https://nodejs.org/)
  * [express](http://expressjs.com/)
  * [mongoose ODM](http://mongoosejs.com/)
  * [handlebars](http://handlebarsjs.com/)
* [Semantic UI](http://semantic-ui.com/)
* [D3.js](http://d3js.org/)
