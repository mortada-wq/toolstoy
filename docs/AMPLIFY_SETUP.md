# Amplify Backend Setup — Your Part

Only the steps you must do yourself. Everything else is already in the project.

---

## Step 1: Check Node.js

```bash
node --version
```

You need 18.x or higher. If not, install from [nodejs.org](https://nodejs.org).

---

## Step 2: Install AWS CLI

Download and install from: https://aws.amazon.com/cli/

After install, run:

```bash
aws --version
```

---

## Step 3: Configure AWS (one-time)

Open a terminal and run:

```bash
aws configure
```

You will be asked for:

| Prompt | What to enter |
|--------|----------------|
| AWS Access Key ID | Your access key from IAM |
| AWS Secret Access Key | Your secret key from IAM |
| Default region name | `us-east-1` |
| Default output format | `json` |

Where to get keys: AWS Console → IAM → Users → Your user → Security credentials → Create access key.

---

## Step 4: Give your user enough permissions

Your IAM user needs permissions to create Amplify resources. In AWS Console:

1. IAM → Users → Your user
2. Add permissions → Attach policies
3. Attach **AdministratorAccess** (easiest), **or** attach a custom policy with:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "amplify:*",
        "cloudformation:*",
        "iam:*",
        "lambda:*",
        "s3:*",
        "cognito-idp:*",
        "cognito-identity:*",
        "appsync:*",
        "dynamodb:*",
        "logs:*",
        "sts:AssumeRole"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Step 5: Deploy the backend

From the project root:

```bash
npm install
npx ampx sandbox --once
```

Wait until you see something like “Sandbox deployed successfully”.  
`amplify_outputs.json` will be created/updated in the project root.

---

## Step 6: Run the app

```bash
npm run dev
```

Open http://localhost:5173 and sign up or sign in.

---

## If something fails

**“Unable to resolve AWS account”**  
→ Your AWS credentials are not set up. Re-run Step 3.

**“account not bootstrapped”**  
→ Run this once (use your AWS account ID):

```bash
npx aws-cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1
```

**Permission errors**  
→ The IAM user needs more permissions (Step 4).

**Check your credentials**  
```bash
aws sts get-caller-identity
```

---

## Quick checklist

- [ ] Node.js 18+
- [ ] AWS CLI installed
- [ ] `aws configure` run with access key and secret
- [ ] IAM user has Amplify/Lambda/Cognito permissions
- [ ] `npx ampx sandbox --once` completes successfully
- [ ] `amplify_outputs.json` exists
- [ ] `npm run dev` works
