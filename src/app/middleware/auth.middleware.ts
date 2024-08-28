import passport from "passport";

import "../../configs/passport.config";

export const authMiddleware = passport.authenticate("jwt", { session: false });