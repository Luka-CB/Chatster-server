const passport = require("passport");
const User = require("../models/User");

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "development"
          ? "/api/auth/google/callback"
          : "https://chatster-server-production.up.railway.app/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const newUser = {
        username: profile.displayName,
        providerId: profile.id,
        providerName: profile.provider,
        avatar: profile.photos[0].value,
      };

      try {
        let user = await User.findOne({ providerId: profile.id });

        if (user) {
          done(null, user);
        } else {
          user = await User.create(newUser);
          done(null, user);
        }
      } catch (error) {
        console.log(error);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "development"
          ? "/api/auth/facebook/callback"
          : "https://chatster-server-production.up.railway.app/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const newUser = {
        username: profile.displayName,
        providerId: profile.id,
        providerName: profile.provider,
        avatar: profile.profileUrl,
      };

      try {
        let user = await User.findOne({ providerId: profile.id });

        if (user) {
          done(null, user);
        } else {
          user = await User.create(newUser);
          done(null, user);
        }
      } catch (error) {
        console.log(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
