# Admin Reset & Setup

## Admin Access

- **URL**: https://toolstoy.app/admin (or http://localhost:5175/admin locally)
- **Email**: mortadagzar@gmail.com
- **Password**: 123456 (Cognito requires min 6 characters)

## 1. Wipe Database (delete all users and history)

Run the migration against your PostgreSQL database:

```bash
psql $DATABASE_URL -f database/migrations/009_wipe_all_users_and_history.sql
```

Or via your database client, execute the SQL in `database/migrations/009_wipe_all_users_and_history.sql`.

## 2. Reset Cognito Users (optional)

To delete all Cognito users and recreate only the admin:

1. Get your User Pool ID from Amplify outputs
2. List users: `aws cognito-idp list-users --user-pool-id YOUR_POOL_ID`
3. Delete each user (except the one you want to keep): `aws cognito-idp admin-delete-user --user-pool-id YOUR_POOL_ID --username EMAIL`

## 3. Create Admin User in Cognito

If the admin user doesn't exist:

```bash
export USER_POOL_ID=us-east-1_xxxxx   # From Amplify
./scripts/admin-setup.sh
```

Or sign up manually at https://toolstoy.app/signup with mortadagzar@gmail.com and password 123456.

## 4. Deploy Changes

After updating the password policy and UserContext:

```bash
npx ampx sandbox   # or: npx ampx deploy
```
