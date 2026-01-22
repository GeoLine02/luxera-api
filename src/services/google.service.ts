import { User } from "../sequelize/models/associate";

export async function findOrCreateGoogleUser({
  email,
  name,
  googleId,
  picture,
}: {
  email: string;
  name: string;
  googleId: string;
  picture?: string;
}) {
  let user = await User.findOne({ where: { google_id: googleId } });

  if (!user) {
    user = await User.create({
      email,
      full_name: name,
      password: null,
      google_id: googleId,
      image: picture,
      provider: "google",
    });
  }

  return user;
}
