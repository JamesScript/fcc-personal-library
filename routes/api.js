/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
const moment = require('moment');

module.exports = function (app) {
  
  mongoose.connect(MONGODB_CONNECTION_STRING);
  
  // Database mongoose 
  const bookSchema = new mongoose.Schema({
    title: String,
    _id: String,
    comments: Array,
    commentcount: Number
  });

  const Book = mongoose.model('Book', bookSchema);

  app.route('/api/books')
    .get(function (req, res){
      Book.find({}, function(err, data) {
        if (err) return console.error(err);
        let toReturn = data.slice();
        for (let i = 0; i < toReturn.length; i++) {
          toReturn[i].commentcount = toReturn[i].comments.length;
        }
        return res.json(toReturn);
      });
    })
    
    .post(function (req, res){
      if (req.body.title.length === 0) {
        return res.send("You cannot submit a book with no title");
      }
      let proposedBook = new Book({
        title: req.body.title,
        _id: ObjectId(),
        comments: [],
      });
      proposedBook.save(function(err, data) {
        if (err) return console.error(err);
        const toReturn = {
          title: data.title,
          _id: data._id
        };
        return res.json(toReturn);
      });
    })
    
    .delete(function(req, res){
      Book.deleteMany({}, function(err) {
        if (err) return console.error(err);
        res.send("complete delete successful");
      });
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      Book.findOne({_id: bookid}, function(err, data) {
        if (err) return console.error(err);
        if (data === null) {
          return res.send("Book with that ID does not exist");
        }
        const toReturn = {
            _id: data._id,
            title: data.title,
            comments: data.comments
        };
        res.json(toReturn);
      });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      Book.findOne({_id: bookid}, function(err, book) {
        if (err) return console.error(err);
        const existingComments = book.comments;
        Book.findOneAndUpdate({_id: bookid}, {$set: {comments: [...existingComments, comment]}}, {new: true}, function(err, data) {
          if (err) return console.error(err);
          const toReturn = {
            _id: data._id,
            title: data.title,
            comments: data.comments
          };
          res.json(toReturn);
        });
      });
      
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      Book.findByIdAndRemove(bookid, function(err) {
        if (err) return console.error(err);
        res.send("delete successful");
      });
      //if successful response will be 'delete successful'
    });
  
};
