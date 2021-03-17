import * as path from "path";
import * as express from "express";
import * as url from "url";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as session from "express-session"; //
import * as cookieParser from "cookie-parser"; //

import { DataAccess } from "./DataAccess";
import { ExerciseModel } from "./models/ExerciseModel";
import { PlaylistModel } from "./models/PlaylistModel";
import { JournalEntryModel } from "./models/JournalEntryModel";
import { JournalModel } from "./models/JournalModel";
import { QuoteModel } from "./models/QuoteModel";
import { MoodModel } from "./models/MoodModel";

import GooglePassportObj from "./GooglePassport"; //
import * as passport from "passport"; //

class App {
  public express: express.Application;
  public Exercises: ExerciseModel;
  public Playlists: PlaylistModel;
  public idGenerator: number;
  public JournalEntries: JournalEntryModel;
  public Journals: JournalModel;
  public Quotes: QuoteModel;
  public Moods: MoodModel;
  public googlePassportObj: GooglePassportObj; //

  constructor() {
    this.googlePassportObj = new GooglePassportObj(); //
    this.express = express();
    this.middleware();
    this.routes();
    this.Exercises = new ExerciseModel();
    this.Playlists = new PlaylistModel();
    this.JournalEntries = new JournalEntryModel();
    this.Journals = new JournalModel();
    this.Quotes = new QuoteModel();
    this.Moods = new MoodModel();
  }
  private middleware(): void {
    this.express.use(logger("dev"));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(session({ secret: "keyboard cat" })); //
    this.express.use(cookieParser()); //
    this.express.use(passport.initialize(null)); //
    this.express.use(passport.session(null)); //
  }

  private validateAuth(req, res, next):void {
    if (req.isAuthenticated()) { console.log("user is authenticated"); return next(); }
    console.log("user is not authenticated");
    res.redirect('/');
  }

  private routes(): void {
    let router = express.Router();

    router.get('/auth/google', 
    passport.authenticate('google', {scope: ['profile']}));

    
    router.get('/auth/google/callback', 
    passport.authenticate('google', 
      { failureRedirect: '/' }
    ),
    (req, res) => {
      console.log("successfully authenticated user and returned to callback page.");
      console.log("redirecting to /#/exercises");
      res.redirect('/#/exercises');
    } 
  );


    router.get("/app", (req, res) => {});


    //GET: get list of all exercises
    router.get("/app/exercises", (req, res) => {
      console.log("query exercises");
      this.Exercises.retrieveAllExercises(res);
    });

    router.get("/app/exercises/", this.validateAuth, (req, res) => {
      console.log("Query All Exercises");
      console.log("userId:" + req.user.id);
      console.log("displayName:" + req.user.displayName);
      this.Exercises.retrieveAllExercises(res);
    });

    //POST: add exercise
    router.post("/app/exercises", (req, res) => {
      var jsonDoc = req.body;
      this.Exercises.model.create([jsonDoc], (err) => {
        if (err) {
          console.log("improper data");
        }
      });
      res.send("success");
    });

    //GET: get specific exercise determined by exerciseID
    router.get("/app/exercises/:exerciseID", (req, res) => {
      var id = req.params.exerciseID;
      console.log("Query single exercise with id: " + id);
      this.Exercises.retrieveExerciseDetails(res, { exerciseID: id });
    });

    //GET: get list of all playlist
    router.get("/app/playlists", (req, res) => {
      console.log("query playlists");
      console.log(this.Playlists.retrieveAllPlaylists(res));
    });

    //GET: get specific playlist determined by playlistID
    router.get("/app/playlists/:playlistID", (req, res) => {
      var id = req.params.playlistID;
      console.log("Query single playlist with id: " + id);
      this.Playlists.retrievePlaylistDetails(res, { playlistID: id });
    });

    //POST: add playlist
    router.post("/app/playlists", (req, res) => {
      var jsonDoc = req.body;
      this.Playlists.model.create([jsonDoc], (err) => {
        if (err) {
          console.log("improper data");
        }
      });
      res.send("success");
    });

    //GET: get list of all mood entries
    router.get("/app/moods", (req, res) => {
      console.log("query mood entries");
      this.Moods.retrieveAllMoods(res);
    });

    //POST: add mood entry
    router.post("/app/moods", (req, res) => {
      var jsonDoc = req.body;
      this.Moods.model.create([jsonDoc], (err) => {
        if (err) {
          console.log("improper data");
        }
      });
      res.send("success");
    });

    //GET: get specific mood entry determined by moodID
    router.get("/app/moods/:entryID", (req, res) => {
      var id = req.params.entryID;
      console.log("Query single mood entry with id: " + id);
      this.Moods.retrieveMoodDetails(res, { entryID: id });
    });

    //GET: get list of all journal entries
    router.get("/app/journalentries", (req, res) => {
      console.log("query journal entry");
      this.JournalEntries.retrieveAllJournalEntries(res);
    });

    //POST: add journal entry
    router.post("/app/journalentries", (req, res) => {
      var jsonDoc = req.body;
      this.JournalEntries.model.create([jsonDoc], (err) => {
        if (err) {
          console.log("improper data");
        }
      });
      res.send("success");
    });

    //GET: get specific journal entry determined by entryID
    router.get("/app/journalentries/:entryID", (req, res) => {
      var id = req.params.entryID;
      console.log("Query single journal entry with id: " + id);
      this.JournalEntries.retrieveJournalEntryDetails(res, { entryID: id });
    });

    //DELETE: delete journal entry
    router.delete("/app/journalentries/delete/:entryID", (req, res) => {
      var id = req.params.entryID;
      console.log("entryid = " + id);
      this.JournalEntries.deleteJournalEntry(res, { entryID: id });
    });

    //GET: get list of all journals
    router.get("/app/journals", (req, res) => {
      console.log("query journals");
      this.Journals.retrieveAllJournals(res);
    });

    //POST: add journal
    router.post("/app/journals", (req, res) => {
      var jsonDoc = req.body;
      this.Journals.model.create([jsonDoc], (err) => {
        if (err) {
          console.log("improper data");
        }
      });
      res.send("success");
    });

    //GET: get specific journal determined by journalID
    router.get("/app/journals/:journalID", (req, res) => {
      var id = req.params.journalID;
      console.log("Query single journal with id: " + id);
      this.Journals.retrieveJournalDetails(res, { journalID: id });
    });

    //GET: get list of all quotes
    router.get("/app/quotes", (req, res) => {
      console.log("query quotes");
      this.Quotes.retrieveAllQuotes(res);
    });

    //POST: add quote
    router.post("/app/quotes", (req, res) => {
      var jsonDoc = req.body;
      this.Quotes.model.create([jsonDoc], (err) => {
        if (err) {
          console.log("improper data");
        }
      });
      res.send("success");
    });

    //GET: quotes count
    router.get("/app/quotes/count", (req, res) => {
      console.log(this.Quotes.retrieveNumberQuotes(res));
    });

    //GET: get quote with matching quoteID
    router.get("/app/quotes/:quoteID", (req, res) => {
      var id = req.params.quoteID;
      console.log("Query single quote with id: " + id);
      this.Quotes.retrieveQuoteDetails(res, { quoteID: id });
    });

    this.express.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      res.header(
        "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"
      );
      next();
    });
    this.express.use("/app/json/", express.static(__dirname + "/app/json"));
    this.express.use("/", router);
    this.express.use("/", express.static(__dirname + "/pages"));
  }
}
export { App };
