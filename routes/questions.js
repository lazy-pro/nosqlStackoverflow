var express = require('express');
var router = express.Router();
let Question = require('../models/question');
var path = require('path')
let User = require('../models/user');
let Answer = require('../models/answer');
let Comment = require('../models/comment');



router.get('/ask', function (req, res) {
    if (req.user)
        res.render('ask', { title: 'Ask a question' });
    else {
        req.flash('error', "Login to ask question.");
        res.redirect('/users/login');
    }
});

router.get('/qupvote/:qid', function(req, res){
    //console.log(res.locals.user);
    let user = res.locals.user;
    if(user){
        Question.findOneAndUpdate( { _id: req.params.qid },{ $inc: { upvotes: 1 }})
        .exec(function(err,db_res){
            if(err){
                console.log(err);
            }
            else{
                Question.find({ _id: req.params.qid }, function (err, ques) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    else {
                        console.log(ques[0].upvotes);
                        res.send( {
                            "upvotes": ques[0].upvotes
                        });
                    }
                });
            }
        });
    }
    else{
        Question.find({ _id: req.params.qid }, function (err, ques) {
            if (err) {
                console.log(err);
                return;
            }
            else {
                console.log(ques[0].upvotes);
                res.send( {
                    "upvotes": ques[0].upvotes
                });
            }
        });
    }
});

router.post('/searchbox/tag', function (req, res) {
    var qry = req.body.searchtag;
    qry=qry.toLowerCase();
    res.redirect('/questions/search/tag/' + qry);
});


router.get('/search/tag/:tg', function (req, res) {
    Question.find({ tags: req.params.tg }, function (err, filteredquestions) {
        if (err) {
            console.log(err);
        }
        else {
            Question.find({}, function (err, questions) {
                if (err)
                    console.log(err);
                else {
                    var frequency = {}, value;
                    for (var i = 0; i < questions.length; i++) {
                        for (var j = 0; j < questions[i].tags.length; j++) {
                            console.log(questions[i].tags[j]);
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
                    console.log(result);
        
                    res.render('index', {
                        title: 'Search - ' + req.params.tg,
                        questions: filteredquestions,
                        trendingtags:result
                    });
                }
            });
        }
    });
});

router.post('/ask', function (req, res) {
    const title = req.body.title;
    const qbody = req.body.qbody;
    var tags = req.body.tags;
    var tagarray = tags.split(' ');

    console.log(req.body.title);
    console.log(req.body.qbody);
    console.log(tagarray);

    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('qbody', 'Question body is required').notEmpty();
    req.checkBody('tags', 'Tags are not valid').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        console.log(errors);
        res.render('ask', {
            title: 'Ask a question',
            errors: errors
        });
    }
    else {
        let date = Date();
        let newQ = new Question({
            askedby: req.user._id,
            title: title,
            qbody: qbody,
            tags: tagarray,
            timestamp: date,
            upvotes: 0,
            downvotes: 0,
            asker: req.user.name
        });
        newQ.save(function (err) {
            if (err) {
                console.log(err);
            }
            else {
                req.flash('success', "Question added successfully");
                res.redirect('/');
            }
        });
    }
});

router.post('/:idq/answer/:ida/comment', function (req, res) {
    var cbody = req.body.cbody;
    req.checkBody('cbody', 'Comment must not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        return;
    }
    else {
        let cdate = Date();
        let newComment = new Comment({
            questionid: req.params.idq,
            answerid: req.params.ida,
            cbody: cbody,
            timestamp: cdate,
            upvotes: 0,
            downvotes: 0,
            commenter: req.user.name,
            commenterid: req.user._id,
            flag: 1
        });
        newComment.save(function (err) {
            if (err) {
                console.log(err);
            }
            else {
                req.flash('success', "You just commented on this answer!");
                res.redirect(`/questions/${req.params.idq}`);
            }
        });
    }
});

router.post('/:id/comment', function (req, res) {
    var cbody = req.body.cbody;
    req.checkBody('cbody', 'Comment must not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        return;
    }
    else {
        let cdate = new Date();
        let newComment = new Comment({
            questionid: req.params.id,
            cbody: cbody,
            timestamp: cdate,
            upvotes: 0,
            downvotes: 0,
            commenter: req.user.name,
            commenterid: req.user._id,
            flag: 0
        });
        newComment.save(function (err) {
            if (err) {
                console.log(err);
            }
            else {
                req.flash('success', "You just commented on this question!");
                res.redirect(`/questions/${req.params.id}`);
            }
        });
    }
});

router.post('/:id/answer', function (req, res) {
    var ansbody = req.body.ansbody;
    req.checkBody('ansbody', 'Answer must not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        return;
    }
    else {
        let date = Date();
        let newA = new Answer({
            questionid: req.params.id,
            answeredby: req.user._id,
            ansbody: ansbody,
            timestamp: date,
            upvotes: 0,
            downvotes: 0,
            answerer: req.user.name
        });
        newA.save(function (err) {
            if (err) {
                console.log(err);
            }
            else {
                req.flash('success', "You just answered this question!");
                res.redirect(`/questions/${req.params.id}`);
            }
        });
    }
});


router.get('/:id', function (req, res) {
    Question.findById(req.params.id, function (err, question) {
        if (err) {
            console.log(err);
            return;
        }
        else {
            Answer.find({ questionid: req.params.id }, function (err, answers) {
                if (err) {
                    console.log(err);
                    return;
                }
                else {
                    Comment.find({ questionid: req.params.id }, function (err, comments) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        else {
                            Question.find({}, function (err, questions) {
                                if (err)
                                    console.log(err);
                                else {
                                    var frequency = {}, value;
                                    for (var i = 0; i < questions.length; i++) {
                                        for (var j = 0; j < questions[i].tags.length; j++) {
                                            console.log(questions[i].tags[j]);
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
                                    console.log(result);
                        
                                    res.render('question', {
                                        question: question,
                                        answers: answers,
                                        comments: comments,
                                        trendingtags:result
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
