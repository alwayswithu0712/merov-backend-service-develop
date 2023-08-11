# Guards

## Description:

Here we have all the different guards, explained

-   **PermissionGuard**

    -   This Guard check that the token of the user come with the permissions that the endpoint requere. The different permissions that we have are: products, owner, admin, chats, orders, offers, members, wallets, addresses, account

-   **RoleGuard**

    -   This Guard check that the token of the user come with the roles that the endpoint requere. The different permissions that we have are: Admin

-   **HasOrganizationGuard**

    -   Check the organization exist before we enter

-   **HasOrganizationGuard**

    -   Check the organization exist before we enter

-   **OptionalAuthGuard**

    -   If the user is logged, we put the user in the request

-   **CreateOrderAuthorizationGuard**

    -   Check if the user exist and have full verification , also if the product is approved and published

-   **UpdateOrderAuthorizationGuard**

    -   Check if the user exist and have full verification , also if the order is accepted

-   **VerificationGuard**

    -   Check if the user exist and have full verification