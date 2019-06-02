/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});
const col1="bookshelf"

module.exports = function (app) {

  app.route('/api/books')
  
  //I can get /api/books to retrieve an aray of all books containing title, _id, & commentcount.
    .get(function (req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true},(err,client)=>{
        if(err) throw err;
        const db=client.db('myLibrary')
        db.collection(col1).find().toArray((err,result)=>{
          if(err) throw err;
          result.forEach((ele)=>{
            ele.commentcount=ele.comments.length;
            delete ele.comments;
          })
          res.json(result);
          client.close();
        })
      })
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
  //I can post a title to /api/books to add a book and returned will be the object with the title and a unique _id.
    .post(function (req, res){
      var title = req.body.title;
      if(title){
        MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true},(err,client)=>{
          if(err) throw err;
          const db=client.db('myLibrary')
          db.collection(col1).insertOne({title:title, comments:[]},(err,response)=>{
            if(err) throw err
            res.json(response.ops[0])
            client.close()
          })
        })
      } else {
        res.send("missing title")
      }
      //response will contain new book object including atleast _id and title
    })
    
  //I can send a delete request to /api/books to delete all books in the database. Returned will be 'complete delete successful' if successful.
    .delete(function(req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true},(err,client)=>{
        if(err) throw err;
        const db=client.db('myLibrary')
        db.collection(col1).deleteMany({},(err, result)=>{
          if(err) throw err;
          if(result.result.ok){
            res.send('complete delete successful');
          }
          client.close();
        })
      })
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
  
  //I can get /api/books/{_id} to retrieve a single object of a book containing title, _id, & an array of comments (empty array if no comments present).
  //If I try to request a book that doesn't exist I will get a 'no book exists' message.
    .get(function (req, res){
      var bookId = ObjectId(req.params.id);
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true},(err,client)=>{
        if(err) throw err;
        const db=client.db('myLibrary')
        db.collection(col1).findOne({_id:bookId},(err,result)=>{
          if(result){
            res.json(result);
          } else {
            res.send("no book exists");
          }
          client.close();
        })
      })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
  //I can post a comment to /api/books/{_id} to add a comment to a book and returned will be the books object similar to get /api/books/{_id}.
    .post(function(req, res){
      var bookId = ObjectId(req.params.id);
      var comment = req.body.comment;
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true},(err,client)=>{
        if(err) throw err;
        const db=client.db('myLibrary')
        db.collection(col1).findOneAndUpdate({_id:bookId},{$push: {"comments":comment}},{returnOriginal:false},(err, response)=>{
          if(err) throw err;
          res.json(response.value);
          client.close();
        })
      })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
  //I can delete /api/books/{_id} to delete a book from the collection. Returned will be 'delete successful' if successful.
    .delete(function(req, res){
      var bookId = ObjectId(req.params.id);
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true},(err,client)=>{
        if(err) throw err;
        const db=client.db('myLibrary')
        db.collection(col1).deleteOne({_id:bookId},(err,result)=>{
          if(err) throw err;
          if(result.result.ok){
            res.send('delete successful');
          }
          client.close();
        })
      })
      //if successful response will be 'delete successful'
    });
  
};

    });
  
};
