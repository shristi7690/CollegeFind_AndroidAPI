const express = require('express');
const auth = require('../middleware/auth');
const User = require('../model/User');
const NumberUtility = require('../utils/NumberUtility');
const mailSender = require('../utils/mail-sender-utility');

const router = express.Router();

/**
 * Login and Register routes section --
 * **/
router.post('/users', async (req, res) => {
    // Create a new user
    try {
        // Check if user already exists
        const emailExist = await User.findOne({email: req.body.email});
        if (emailExist) return res.status(400).send('Email already exists!');

        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send({error: error})
    }
});

router.post('/users/login', async (req, res) => {
    //Login a registered user
    try {
        const {email, password} = req.body;
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        res.send({user, token})
    } catch (error) {
        res.status(401).send({error: 'Login failed! Check authentication credentials'})
    }

});

router.get('/users/me', auth, async (req, res) => {
    // View logged in user profile
    try {
        const user = await User.findOne(req.user).populate('savedColleges');
        res.send(user)
    } catch (e) {
        console.log(e);
    }
});

router.put('/users/update', auth, async (req, res) => {
    try {
        // Check if user already exists
        const emailExist = await User.findOne({email: req.body.email});
        if (emailExist) return res.status(400).send('Email already exists!');

        const user = new User(req.body);
        await User.findByIdAndUpdate(req.body._id, user);
        res.status(201).send('Updated User!')
    } catch (error) {
        res.status(400).send(error);
        console.log(error);
    }
});

/**
 * Logout routes section --
 * **/

router.post('/users/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        });
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
});

router.post('/users/me/logoutall', auth, async (req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length);
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
});

/**
 * Password reset routes section --
 * **/

router.get(`/users/reset-password/:email`, async (req, res) => {
    try {
        const email = req.params.email;
        const user = await User.findOne({email: email});
        if (!user) {
            return res.status(400).send({error: "User not found!"});
        }
        const token = NumberUtility.generateRandom(1000, 9999);
        user.passResetToken = token;
        await user.save();
        // send mail with reset token.
        mailSender.sendEmail(
            email,
            "Reset Password",
            `Your password reset token is ${token}, Thank you!`
        );
        res.send();
    } catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

router.post(`/users/reset-password`, async (req, res) => {
    try {
        const email = req.body.email;
        const token = req.body.passResetToken;
        const password = req.body.password;

        const user = await User.findOne({email: email});
        if (user.passResetToken !== token) {
            return res.status(401).send({error: "Token did not match"});
        }

        user.passResetToken = null;
        user.password = password;
        await user.save();
        res.send({message: 'successfully updated password!'});
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

/**
 * Filter users routes section --
 * **/
router.post('/users/filter', auth, async (req, res) => {
    try {
        const users = await User.find(req.body);
        res.status(200).json({users});
    } catch (error) {
        res.status(400).send({error: 'No users available at the moment!'})
    }
});

module.exports = router;
