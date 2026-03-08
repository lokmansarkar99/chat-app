import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from ".";
import { User } from "../app/modules/user/user.model";
import { USER_ROLES, STATUS } from "../enums/user";

passport.use(
  new GoogleStrategy(
    {
      clientID:     config.google.client_id as string,
      clientSecret: config.google.client_secret  as string,
      callbackURL:  config.google.callback_url  as string,
    },
    // verify callback
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;

        if (!email) {
          return done(new Error("Google account has no public email"), undefined);
        }

        // ① User exist or not
        let user = await User.findOne({ email, isDeleted: false });

        if (!user) {
          // ② new user create
          user = await User.create({
            name: profile.displayName,
            email,
            profileImage: profile.photos?.[0]?.value || "",
            role: USER_ROLES.USER,
            status: STATUS.ACTIVE,
            verified: true,
            // we can store google id in passowrd field 
            password: `${googleId}_${Date.now()}`, 
            // its be optional can be added a google field in schema to store googleId for better management
          });
        }

        // ③ retrun to passport middleware
        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

// if dont use sessions, these serialize/deserialize can be omitted, but passport still needs them defined
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id: string, done) => {
  const user = await User.findById(id).select("-password");
  done(null, user);
});

export default passport;
