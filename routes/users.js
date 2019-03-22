//import express and express router
const express = require('express');
const router = express.Router();
//import the database models.
const db = require('../models');

//import bcrypt and jsonwebtoken
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//ROUTES BEGIN HERE
////////////////////////////////////////////////////

//Register user route
router.post('/', (req,res) => {
  //Try and hash the password
  bcrypt.hash(req.body.password, 10)
    //if able to hash password
    .then((hash) => {
      //make a new user object
      const newUser = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        email: req.body.email,
        password: hash,
      }
      //try and create the user in the database
      db.User.create(newUser)
        //if able to create user
        .then((createdUser) => {
          //send response with created user object
          res.status(201).json({created:createdUser});
        })
        //if unable to create user
        .catch((err) => {
          //send response with error information
          res.status(500).json({error: err});
        });
    });
});

//Login user route
router.post('/login', (req,res) => {
  //get all the users from the database where the username is the same as the user trying to log in
  db.User.findAll({where:{username:req.body.username}})
    .then((users) => {
        //if the list of users return is not empty
        if(users.length > 0){
          //check the provided password against hashed password in database
          bcrypt.compare(req.body.password, users[0].password)
            .then((result) => {
              //if the password matched
              if(result){
                //generate a 4 week JWT which stores the user's ID and uses the SECRET_KEY env variable or dev to sign.
                const token = jwt.sign({id:users[0].id}, process.env.SECRET_KEY || 'dev', {expiresIn:'4 weeks'});
                //send respose with token in
                res.status(200).json({token:token});
              }else{ //if the password did not match
                //send incorrect password error
                res.status(401).json({error:"Incorrect Password"});
              }
            });
        }else{ //if the list of users returned is empty
          //send incorrect username error
          res.status(404).json({error:"Username not found"});
        }
    });
});

//Get user route
router.get('/:id', (req,res) => {
  //search for user in database where the id is the id provided
  db.User.findAll({where:{id:req.params.id}})
    .then((users) => {
      //if the list of users is not empty then
      if(users.length > 0){
        //return the user
        res.status(200).json({user:users[0]});
      }else{ //if list is empty
        //return user not found error
        res.status(404).json({error:"User not found"});
      }
    });
});

//Update user route
router.put('/:id', (req,res) => {
  //search for user in database where id is the id provided
  db.User.findAll({where:{id:req.params.id}})
    .then((users) => {
      //if the list of users is not empty then
      if(users.length > 0){
        //update the user
        users[0].update(req.body)
          .then((updatedUser) => { //if the user can be updated
            res.status(201).json({user:updatedUser}); //send the response with the updated user
          })
          .catch((err) => { //if the user can't be updated
            res.status(500).json({error:"Unable to update user"}); //send a response with the error message
          })
      }else{ //if list is empty
        //return user not found error
        res.status(404).json({error:"User not found"});
      }
    });
});

//Delete user route
router.delete('/:id', (req,res) => {
  //search for user in database where id is the id provided
  db.User.findAll({where:{id:req.params.id}})
    .then((users) => {
      //if the list of users is not empty then
      if(users.length > 0){
        //try to delete user
        users[0].destroy()
          .then((deletedUser) => { //if the user can be deleted
            res.status(200).json({user:deletedUser}); //send response with deleted user
          })
          .catch(() => { //if the user can't be deleted
            res.status(500).json({error:"Unable to delete user"}); //send response with error message
          })
      }else{ //if list is empty
        //return user not found error
        res.status(404).json({error:"User not found"});
      }
    })

});

//Search user route
router.get('/search/:username', (req,res) => {
  res.status(200).json({route:"search"});
});

//Search user route
router.patch('/resetpassword/:id', (req,res) => {
  res.status(200).json({route:"resetpassword"});
});

//ROUTES END HERE
////////////////////////////////////////////////////

module.exports = router;