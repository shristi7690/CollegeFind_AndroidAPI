const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        imgString: {
            type: String
        },
        username: {
            type: String,
            required: true,
            trim: true
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            validate: value => {
                if (!validator.isEmail(value)) {
                    throw new Error({error: 'Invalid Email address'})
                }
            }
        },
        password: {
            type: String,
            required: true,
            minLength: 7
        },
        savedColleges: [{type: mongoose.Schema.Types.ObjectId, ref: 'College'}],
        tokens: [{
            token: {
                type: String,
                required: true
            }
        }],
        passResetToken: {
            type: String
        },
        type: {
            type: String
        }
    },
    {timestamps: true});

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
});

/**
 * .method = requires an instance (obj.method()) to be called ||
 * .statics = directly access method from class name (Class.method())
 **/

userSchema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this;
    const token = jwt.sign({_id: user._id}, process.env.JWT_KEY);
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token
};

userSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({email: email});
    if (!user) {
        throw new Error()
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error()
    }
    return user
};

const User = mongoose.model('User', userSchema);

module.exports = User;
