# Organization

1. [Invitations](./invitations.md)

## Description:
Organization has a one-to-one relationship with BusinessVerification. At the same time, it also has a businessVerificationStatus field as a summary of what BusinessVerification contains.
The BusinessVerification table is populated by Middesk.
The different endpoints are shown below and this process can be seen.

## External providers that we use
1. [Middesk](https://www.middesk.com/): We use it to verify the status of an organization and based on that, restrict access to certain parts of the system

## Endpoints that impact organizations.
- **POST -> /api/users**
    - When the user is created, if isOrganizationOwner field is true, the organization is created and the Business is created in Middesk

- **POST -> /api/organizations**
    - Create the organization and the Business in Middesk

- **POST -> /api/webhooks/middesk/events**
    - This endpoint is called when the organization's status is updated from Middesk. Either because the organization was approved or rejected

- **GET -> /api/organizations/me**
    - Returns the organization

- **GET -> /api/organizations/:id/members**
    - Returns the members of an organization

- **GET -> /api/organizations/:id/members/:memberId**
    - Returns a specific member of an organization

- **PATCH -> /api/organizations/:id/members/:memberId**
    - Update an organization member

- **PATCH -> /api/organizations/me**
    - Update the organization

- **GET -> /api/admin/organizations/:id**
    - Returns the organization, with the fields that can only be seen by the admin only

- **GET -> /api/admin/organizations**
    - Returns all organizations, with the fields that can only be seen by the admin only

- **GET -> /api/admin/organizations/:id/members**
    - Returns the members of an organization, with the fields that can only be seen by the admin only

- **GET -> /api/admin/organizations/:id/members/:memberId**
    - Returns a specific member of an organization, with the fields that can only be seen by the admin only

- **POST -> /api/organizations/me/invitations**
    - Sends invitations. `{ invites: {email, permissions: Permission[] }[] }`

- **GET -> /api/organizations/me/invitations**
    - Returns a paginated response of invitations sent

- **GET -> /api/organizations/me/invitations/:invitationId**
    - Returns a specific invitation
