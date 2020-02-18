const express = require('express');
const auth = require('../middleware/auth');
const College = require('../model/College');
const User = require('../model/User');

const router = express.Router();

router.post('/colleges', auth, async (req, res) => {
    try {
        const college = new College(req.body);
        await college.save();
        res.status(201).send(college)
    } catch (error) {
        res.status(400).send({error: error})
    }
});

router.put('/colleges/book', auth, async (req, res) => {
    try {
        // for mapping relationship
        const savedBy = await User.findOne(req.body.savedBy);
        if (!savedBy) {
            const currentCollege = await College.findOne({_id: req.body._id});
            const previousUser = await User.findById(currentCollege.savedBy);
            previousUser.savedColleges = previousUser.savedColleges.filter(element => String(element) !== String(req.body._id));
            await User.findByIdAndUpdate(previousUser._id, previousUser);
        } else {
            savedBy.savedColleges = savedBy.savedColleges.filter(element => String(element) !== String(req.body._id));
            savedBy.savedColleges = savedBy.savedColleges.concat(req.body);
            await User.findByIdAndUpdate(savedBy._id, savedBy);
        }

        await College.updateOne({_id: req.body._id}, req.body);
        res.status(200).send({message: 'Successful!'});
    } catch (error) {
        res.status(400).send({error: error})
        console.log(error)
    }
});

router.patch('/colleges/:id', auth, async (req, res) => {
    try {
        await College.findByIdAndUpdate(req.params.id, req.body, {new: true}, (error, updatedCollege) => {
            if (error) throw new Error(error);
            res.status(200).send(updatedCollege);
        });
    } catch (error) {
        res.status(400).send({error: error})
    }
});

router.get('/colleges/all', auth, async (req, res) => {
    try {
        const colleges = await College.find().populate('savedBy');
        res.status(200).send(colleges);
    } catch (error) {
        res.status(400).send({error: 'No colleges available at the moment!'})
    }
});

router.get('/colleges/:id', auth, async (req, res) => {
    try {
        const colleges = await College.findOne({_id: req.params.id}).populate('savedBy');
        if(!colleges) throw new Error();
        res.status(200).json(colleges);
    } catch (error) {
        res.status(400).send({error: 'No colleges available at the moment!'})
    }
});

/**
 * Filter colleges routes section --
 * **/
router.post('/colleges/filter', auth, async (req, res) => {
    try {
        const colleges = await College.find(req.body).populate('savedBy');
        res.status(200).json(colleges);
    } catch (error) {
        res.status(400).send({error: 'No College available at the moment!'})
    }
});

module.exports = router;
