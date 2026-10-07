import { ActionForm } from "@/components/ui/action-form";
import { updateProfile } from "@/lib/actions/member";
import { requireMember } from "@/lib/dal/session";
import { getOwnProfile } from "@/lib/dal/portal";

export const instant = false;

export default async function SettingsPage() {
  const viewer = await requireMember();
  const profile = await getOwnProfile(viewer);
  if (!profile) return <p>Profile not found.</p>;

  return (
    <>
      <p className="kicker">Settings</p>
      <h1 className="page-title">Your profile.</h1>
      <ActionForm action={updateProfile} submitLabel="Save profile">
        <label>
          Name
          <input name="full_name" defaultValue={profile.fullName} required />
        </label>
        <label>
          Profile address
          <input name="slug" defaultValue={profile.slug} />
        </label>
        <label>
          Title
          <input name="title" defaultValue={profile.title} />
        </label>
        <label>
          City
          <input name="city" defaultValue={profile.city ?? ""} />
        </label>
        <label>
          Photo URL
          <input name="photo_url" defaultValue={profile.photoUrl ?? ""} />
        </label>
        <label>
          Bio
          <textarea name="bio" defaultValue={profile.bio} />
        </label>
        <label>
          Expertise, comma separated
          <input name="expertise" defaultValue={profile.expertise.join(", ")} />
        </label>
        <label>
          Industries, comma separated
          <input name="industries" defaultValue={profile.industries.join(", ")} />
        </label>
        <label>
          I have
          <textarea name="i_have" defaultValue={profile.iHave} />
        </label>
        <label>
          I need
          <textarea name="i_need" defaultValue={profile.iNeed} />
        </label>
        <label>
          LinkedIn
          <input name="linkedin" defaultValue={profile.socials.linkedin ?? ""} />
        </label>
        <label>
          X
          <input name="x" defaultValue={profile.socials.x ?? ""} />
        </label>
        <label>
          Instagram
          <input name="instagram" defaultValue={profile.socials.instagram ?? ""} />
        </label>
        <label>
          Website
          <input name="website" defaultValue={profile.socials.website ?? ""} />
        </label>
        <label className="check">
          <input name="is_public" type="checkbox" defaultChecked={profile.isPublic} />
          Show this profile on the public site after approval
        </label>
      </ActionForm>
    </>
  );
}
