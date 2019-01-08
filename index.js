const express = require('express');
const app = express();
const port = 3010
const passport = require('passport');
var path = require('path')
var fs = require('fs');
var router = express.Router();
const config = require('./config/database');
//Express Session middleware
var session = require('express-session');
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));


//Bring bodyParser here
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));



//Express messages middleware
var flash = require('connect-flash');
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Express validator midlleware
var expressValidator = require('express-validator')
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
var auth = require('./config/auth');
auth(passport);


var mongoose = require('mongoose');
mongoose.connect(config.database, {
    useNewUrlParser: true
});
var db = mongoose.connection;

// if we're not connected yet
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("Database Connected!")
});

let User = require('./models/user');
let Question = require('./models/question');

app.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});


app.get('/', function (req, res) {

    if(req.user)
    {
        if(req.user.regno == 12345678)
        {
            res.render('getregno',{
                title:'Input Registration number'
            });
        }
    }
    else
    console.log("no one");

    Question.find({}, function (err, question) 
    {
        if (err)
            console.log(err);
        else {
            Question.find({}, function (err, questions) {
                if (err)
                    console.log(err);
                else {
                    var frequency = {}, value;
                    for (var i = 0; i < questions.length; i++) {
                        for (var j = 0; j < questions[i].tags.length; j++) {
                            value = questions[i].tags[j];
                            if (value in frequency) {
                                frequency[value]++;
                            }
                            else {
                                frequency[value] = 1;
                            }
                        }
                    }
                    var uniques = [];
                    for (value in frequency) {
                        uniques.push(value);
                    }

                    function compareFrequency(a, b) {
                        return frequency[b] - frequency[a];
                    }

                    var result = uniques.sort(compareFrequency);
                    
                    res.render('index', {
                        title: 'Home',
                        questions: question,
                        trendingtags: result
                    });
                }
            });
        }

    });
});

app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email']
    }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        req.flash('success', 'Logged in via google');
        res.redirect('/');
    });


let users = require('./routes/users');
app.use('/users', users);

let questions = require('./routes/questions');
app.use('/questions', questions);

app.listen(port, () => console.log(`App listening on port ${port}!`));