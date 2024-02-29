const express = require('express');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');

const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');


const router = express.Router();

const validateSignup = [
    check('firstName')
      .exists({ checkFalsy: true })
      .withMessage('First name is required'),
    check('lastName')
      .exists({ checkFalsy: true })
      .withMessage('Last name is required'),
    check('email')
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage('Invalid email'),
    check('username')
      .exists({ checkFalsy: true })
      .isLength({ min: 4 })
      .withMessage('Username is required'),
    check('username')
      .not()
      .isEmail()
      .withMessage('Username cannot be an email.'),
    check('password')
      .exists({ checkFalsy: true })
      .isLength({ min: 6 })
      .withMessage('Password must be 6 characters or more.'),
    handleValidationErrors
  ];


// Sign up a user
router.post('/', validateSignup, async (req, res, next) => {
    const { firstName, lastName, email, username, password } = req.body;

    const hashedPassword = bcrypt.hashSync(password);

    const validateEmail = await User.findOne({
      where: {
        email
      }
    })

    if (validateEmail) {
      const err = new Error("User already exists");
      err.title = "User already exists with the specified email";
      err.status = 500;
      err.errors = {email: "User with that email already exists"}
      next(err);
    }

    const validateUsername = await User.findOne({
      where: {
        username
      }
    })

    if (validateUsername) {
      const err = new Error("User already exists");
      err.title = "User already exists with the specified username";
      err.status = 500;
      err.errors = {username: "User with that username already exists"}
      next(err);
    }

    const newUser = await User.create({
        firstName,
        lastName,
        username,
        email,
        hashedPassword
    })

    const safeUser = {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        username: newUser.username
    }

    await setTokenCookie(res, safeUser);

    return res.json({user: safeUser});

})





module.exports = router;
