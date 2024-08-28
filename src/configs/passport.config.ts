import passport from "passport";
import { Strategy } from "passport-jwt";

// Options
import { passportOpts } from "./opts.config";

// Import Services
import userService from "../app/services/user.service";


passport.use(new Strategy(passportOpts, async (jwtPayload, done) => {
  try{
    const user = await userService.findUserById(jwtPayload.id);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    console.error(error);
    done(error, false);
  }
})
);