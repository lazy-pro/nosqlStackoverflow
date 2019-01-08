var express = require('express');

var router = express.Router();
var bcrypt = require('bcryptjs');
let User = require('../models/user');
let Question = require('../models/question');
let Answer = require('../models/answer');
const passport = require('passport');
router.get('/login', function (req, res) {
    res.render('login', { title: 'Login' });
});

router.get('/register', function (req, res) {
    res.render('register', { title: 'Register' });
});

router.post('/regno', function (req, res) {

    const regno = req.body.reg;
    req.checkBody('reg', 'Registration number is required').notEmpty();
    req.checkBody('reg', 'Registration number is invalid').isLength({ min: 8, max: 8 });
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.render('getregno', {
            title: 'Input Registration number',
            errors: errors
        });
    }
    else {
        User.findByIdAndUpdate(req.user._id, { regno: regno }, function (err) {
            if (err) {
                console.log(errors);
                return;
            }
            else {
                req.flash('success','Registration number completed successfully');
                res.redirect('/');
            }
        });
    }
});

router.post('/register', function (req, res) {

    const name = req.body.name;
    const email = req.body.email;
    const regno = req.body.regno;
    const password = req.body.password;
    const password2 = req.body.password2;

    console.log(req.body.name);
    console.log(req.body.email);
    console.log(req.body.regno);
    console.log(req.body.password);
    console.log(req.body.password2);

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('regno', 'Registration number is required').notEmpty();
    req.checkBody('regno', 'Registration number is invalid').isLength({ min: 8, max: 8 });
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    let errors = req.validationErrors();

    if (errors) {
        console.log(errors);
        res.render('register', {
            title: 'Register',
            errors: errors
        });
    }
    else {
        let newUser = new User({
            name: name,
            email: email,
            regno: regno,
            password: password
        });
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function (err, hash) {
                if (err) {
                    console.log(err);
                    return;
                }
                else {
                    newUser.password = hash;
                    newUser.save(function (err) {
                        if (err)
                            console.log(err);
                        else {
                            req.flash('success', 'Successfully Registered! Please Login.');
                            res.redirect('/users/login');
                        }
                    });
                }
            });
        });

    }
});

router.post('/login', function (req, res, next) {

    passport.authenticate('local', {
        successFlash: 'Welcome!',
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);

});

router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'You are logged out!');
    res.redirect('/users/login');
});

router.get('/:id', function (req, res) {
    User.findById(req.params.id, function (err, userdetail) {
        if (err)
            console.log(err);
        else {
            Question.find({ askedby: req.params.id }, function (err, questions) {
                if (err)
                    console.log(err);
                else {
                    Answer.find({ answeredby: userdetail._id }, function (err, answers) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            Question.find({}, function (err, allq) {
                                if (err)
                                    console.log(err);
                                else {
                                    var frequency = {}, value;
                                    for (var i = 0; i < allq.length; i++) {
                                        for (var j = 0; j < allq[i].tags.length; j++) {
                                            console.log(allq[i].tags[j]);
                                            value = allq[i].tags[j];
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
                                    console.log(result);
                                    console.log(answers);
                                    console.log(allq);
                                    res.render('user', {
                                        title: 'User Profile',
                                        userdetail: userdetail,
                                        questions: questions,
                                        answers: answers,
                                        allq: allq,
                                        trendingtags: result
                                    });
                                }

                            });

                        }
                    });

                }

            });
        }

    });
});
module.exports = router