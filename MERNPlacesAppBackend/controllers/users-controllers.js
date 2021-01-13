const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return next(new HttpError("couldnt get users", 500));
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("that signup info is a no no", 422));
  }
  const { name, email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(" signup no work", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("that user already registered", 422);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Mainz_50_Pfg_1921.jpg/1000px-Mainz_50_Pfg_1921.jpg",
    password,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("User no maked", 500);
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("login no work", 500);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError("login no work bad credentials", 401);
    return next(error);
  }
  res.json({
    message: "u logged in",
    user: existingUser.toObject({ getters: true }),
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
