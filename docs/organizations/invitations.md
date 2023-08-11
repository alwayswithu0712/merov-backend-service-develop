## Invitations

Inviting members into organizations involves a couple of moving pieces. Auth0 plays a central role, because Merov users are intrinsically connected with auth0 users.

The flow explained here is the one detailed at this [Auth0 guide](https://auth0.com/docs/customize/email/send-email-invitations-for-application-signup#generate-invitations), were two alternatives are explained. We chose in particular the former

> Customize an email template and use it to send a change password email.

because it would let Auth0 in charge of sending the emails, reducing the code we would need to develop. As stated in the linked guide, the feature implements this steps:

1.  Administrator creates a user account.
2.  Administrator sends a registration email invitation to the user.
3.  User follows a link in the invitation email to set up a password for the account.
4.  User creates and verifies a password.
5.  User signs in.

#### Steps 1. and 2.  (Auth0) Administrator creates a user account and sends email with invite link
As a member of an organization (with the `members` permission), inviting a list of people is possible by posting to the endpoint `/organizations/me/invitations` with body
```
{
    "invites": [
        { "email": "foo@bar.com", permissions: ["products"] },
        { "email": "baz@bar.com", permissions: ["chats", "offers"] }
    ]
}
```

In the backend, this will trigger the following actions (`InvitationsService#createMany`, `Auth0Service#inviteMember`):

- Create an entry in the `Invitation` table for each email, saving the permissions set and the inviting user. The invitation status is set as `Pending`.
- Create an auth0 user, using the email, generating a random username and password.
- Set said user's app_metadata. `{ invited: true, used_invite: false, inviteId, inviting_org, invite_sender_email, accountId }`
- Set users permissions.
- Reset password. This step will trigger the reset password email. The emails uses auth0's "reset email template", which needs to be tuned using the liquid syntax as described in the guide, leveraging the user app_metadata to display invite text, organization name and contact emails. The link will expire after 7 days.

When a user is created in Auth0, it triggers the [Post-Register Action Flow](https://auth0.com/docs/customize/actions/flows-and-triggers/post-user-registration-flow) named "Merov Regiser User" which runs a simple script that inserts the new user into our database by posting to `https://${env}.api.merov.io/api/users`. Because the post body picks-up accountId information in the users's app_metadata, the user will be created as part of an existing account (`UserSerice#create`).


#### Step 3. User follows the link

By now, most of the magic has already happened. The link contains a change password box. This template can be configured to display something nicer, taking advantage of the previouse email template, we can add some parameters to the url to display different templates depending of if the user was invited or is actually changing password.

#### Step 4.  User creates and verifies a password.

After changing the password, the user is redirected. This redirect can be configured during reset email temaplate configuration. Right now, the user is redirected to the login page.

#### Step 5. User signs in

In the end, the user should login with their email and new password. The first time this happens, there's a [Login Action]() called "Clean invitation link" that turns off the app_metadata flag `used_invite` and sends a GET to `/organizations/invitations/:invitationId/confirm?email={email}`. This will mark the invitation in our backend as `Confirmed`, closing the loop.
