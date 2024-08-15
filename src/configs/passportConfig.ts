import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../app/models/user.model'; // Adjust the import path as necessary
import userService from '../app/services/user.service'; // Adjust the import path as necessary

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await userService.findUserByEmail(email);
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      const isValid = await userService.validatePassword(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userService.findUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});