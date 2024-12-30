const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const SALT_LENGTH = 12;

router.post('/sign-up', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    
    if (userInDatabase) {
      return res.json({err: 'Username already taken.'});
    }
    
    const user = await User.create({
      username: req.body.username,
      hashedPassword: bcrypt.hashSync(req.body.password, SALT_LENGTH)
    })

    const token = jwt.sign(
      { username: user.username, _id: user._id }, 
      process.env.JWT_SECRET
    );

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

router.post('/sign-in', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (user && bcrypt.compareSync(req.body.password, user.hashedPassword)) {
      const token = jwt.sign(
        { username: user.username, _id: user._id },
        process.env.JWT_SECRET
      );

      res.status(200).json({ user, token });
    } else {
      res.status(401).json({ err: 'Invalid username or password.' });
    }

  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

module.exports = router;
